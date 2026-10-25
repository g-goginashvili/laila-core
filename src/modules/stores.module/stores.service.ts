import {
    countStores, deleteClosure, deleteStore, insertClosure, insertStore, replaceHours, replaceTables,
    selectClosures, selectHours, selectMenuCounts, selectStore, selectStoresList, selectTables, updateStore
} from "./stores.repository.js"
import { AppError } from "../../utils/app-error.js";
import { db } from "../../lib/db.js";
import { getOwnOrganisation } from "../organisations.module/organisations.service.js";
import { setOrganisationSingleLocation } from "../organisations.module/organisations.repository.js";
import type {
    AddStoreSchemaType, StoreClosureSchemaType, StoreHoursSchemaType, StoreTablesSchemaType, UpdateStoreSchemaType
} from "./stores.schema.js";
import type { storesSelectType } from "../../db/schema/stores.js";
import { addDays, serviceNow } from "../../utils/service-time.js";

const orThrowNotFound = <T>(value: T | undefined, message = "Store not found.") => {
    if (!value) throw new AppError(404, message);
    return value;
};

// Every store-scoped endpoint (menu, reservations, …) resolves its store through this.
export const getOwnedStore = async (adminUserId: string, storeId: string) => {
    const organisation = await getOwnOrganisation(adminUserId);
    return orThrowNotFound(await selectStore(storeId, organisation.id));
};

const withSettings = async (storeList: storesSelectType[]) => {
    const ids = storeList.map(store => store.id);
    const [hours, tables, menuCounts] = await Promise.all([selectHours(ids), selectTables(ids), selectMenuCounts(ids)]);
    // Fetch from a day early, then trim per store's own time zone.
    const closures = await selectClosures(ids, addDays(serviceNow("UTC").date, -1));

    return storeList.map(store => ({
        ...store,
        hours: hours.filter(shift => shift.storeId === store.id),
        tables: tables.filter(table => table.storeId === store.id),
        closures: closures.filter(closure => closure.storeId === store.id && closure.date >= serviceNow(store.timezone).date),
        menuGroupCount: menuCounts.groups.find(row => row.storeId === store.id)?.value ?? 0,
        menuItemCount: menuCounts.items.find(row => row.storeId === store.id)?.value ?? 0,
    }));
};

export const addStoreService = async (adminUserId: string, values: AddStoreSchemaType) => {
    const organisation = await getOwnOrganisation(adminUserId);

    const store = await db.transaction(async (tx) => {
        const created = await insertStore({ ...values, adminUserId, organisationId: organisation.id }, tx);

        if (organisation.singleLocation && await countStores(organisation.id, tx) > 1) {
            await setOrganisationSingleLocation(organisation.id, false, tx);
        }

        return created;
    });

    const [detailed] = await withSettings([store]);
    return detailed!;
};

export const getStoreService = async (adminUserId: string, id: string) => {
    const [detailed] = await withSettings([await getOwnedStore(adminUserId, id)]);
    return detailed!;
};

export const getStoresListService = async (adminUserId: string) => {
    const organisation = await getOwnOrganisation(adminUserId);
    return await withSettings(await selectStoresList(organisation.id));
};

export const updateStoreService = async (adminUserId: string, id: string, values: UpdateStoreSchemaType) => {
    const store = await getOwnedStore(adminUserId, id);

    const minParty = values.minPartySize ?? store.minPartySize;
    const maxParty = values.maxPartySize ?? store.maxPartySize;
    if (minParty > maxParty) throw new AppError(400, "Minimum party size can't exceed the maximum.");

    const updated = orThrowNotFound(await updateStore(id, store.organisationId, values));
    const [detailed] = await withSettings([updated]);
    return detailed!;
};

export const deleteStoreService = async (adminUserId: string, id: string) => {
    const organisation = await getOwnOrganisation(adminUserId);
    const store = orThrowNotFound(await deleteStore(id, organisation.id));
    return { id: store.id };
};

export const replaceHoursService = async (adminUserId: string, id: string, { hours }: StoreHoursSchemaType) => {
    await getOwnedStore(adminUserId, id);

    for (let weekday = 0; weekday < 7; weekday++) {
        const shifts = hours.filter(shift => shift.weekday === weekday).sort((a, b) => a.opensMinutes - b.opensMinutes);
        for (let i = 1; i < shifts.length; i++) {
            if (shifts[i]!.opensMinutes < shifts[i - 1]!.closesMinutes) {
                throw new AppError(400, "Opening hours on the same day can't overlap.");
            }
        }
    }

    await replaceHours(id, hours);
    return await getStoreService(adminUserId, id);
};

export const replaceTablesService = async (adminUserId: string, id: string, { tables }: StoreTablesSchemaType) => {
    await getOwnedStore(adminUserId, id);

    const labels = tables.map(table => table.label.toLowerCase());
    if (new Set(labels).size !== labels.length) throw new AppError(400, "Table names must be unique.");

    const existingIds = new Set((await selectTables([id])).map(table => table.id));
    if (tables.some(table => table.id && !existingIds.has(table.id))) throw new AppError(404, "Table not found.");

    await replaceTables(id, tables);
    return await getStoreService(adminUserId, id);
};

export const addClosureService = async (adminUserId: string, id: string, { date, note }: StoreClosureSchemaType) => {
    await getOwnedStore(adminUserId, id);
    return await insertClosure(id, date, note);
};

export const deleteClosureService = async (adminUserId: string, id: string, closureId: string) => {
    await getOwnedStore(adminUserId, id);
    const closure = orThrowNotFound(await deleteClosure(id, closureId), "Closure not found.");
    return { id: closure.id };
};
