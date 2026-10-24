import { countStores, deleteStore, insertStore, selectStore, selectStoresList, updateStore } from "./stores.repository.js"
import { AppError } from "../../utils/app-error.js";
import { db } from "../../lib/db.js";
import { getOwnOrganisation } from "../organisations.module/organisations.service.js";
import { setOrganisationSingleLocation } from "../organisations.module/organisations.repository.js";
import type { AddStoreSchemaType, UpdateStoreSchemaType } from "./stores.schema.js";
import type { storesSelectType } from "../../db/schema/stores.js";

const orThrowNotFound = (store: storesSelectType | undefined) => {
    if (!store) throw new AppError(404, "Store not found.");
    return store;
};

export const addStoreService = async (adminUserId: string, values: AddStoreSchemaType) => {
    const organisation = await getOwnOrganisation(adminUserId);

    return await db.transaction(async (tx) => {
        const store = await insertStore({ ...values, adminUserId, organisationId: organisation.id }, tx);

        if (organisation.singleLocation && await countStores(organisation.id, tx) > 1) {
            await setOrganisationSingleLocation(organisation.id, false, tx);
        }

        return store;
    });
};

export const getStoreService = async (adminUserId: string, id: string) => {
    const organisation = await getOwnOrganisation(adminUserId);
    return orThrowNotFound(await selectStore(id, organisation.id));
};

export const getStoresListService = async (adminUserId: string) => {
    const organisation = await getOwnOrganisation(adminUserId);
    return await selectStoresList(organisation.id);
};

export const updateStoreService = async (adminUserId: string, id: string, values: UpdateStoreSchemaType) => {
    const organisation = await getOwnOrganisation(adminUserId);
    return orThrowNotFound(await updateStore(id, organisation.id, values));
};

export const deleteStoreService = async (adminUserId: string, id: string) => {
    const organisation = await getOwnOrganisation(adminUserId);
    const store = orThrowNotFound(await deleteStore(id, organisation.id));
    return { id: store.id };
};
