import { db, type DbTransactionType } from "../../lib/db.js"
import { stores, type storesInsertType, type storesUpdateType } from "../../db/schema/stores.js";
import { storeClosures, storeHours, storeTables } from "../../db/schema/store-settings.js";
import { menuGroups, menuItems } from "../../db/schema/menu.js";
import { and, asc, count, eq, gte, inArray, notInArray, sql } from "drizzle-orm";

const byIdInOrganisation = (id: string, organisationId: string) =>
    and(eq(stores.id, id), eq(stores.organisationId, organisationId));

export const insertStore = async (
    insertValues: storesInsertType,
    tx?: DbTransactionType
) => {
    const connection = tx ?? db;
    const [store] = await connection.insert(stores).values(insertValues).returning();
    return store!;
};

export const countStores = async (organisationId: string, tx?: DbTransactionType) => {
    const connection = tx ?? db;
    const [result] = await connection.select({ value: count() }).from(stores).where(eq(stores.organisationId, organisationId));
    return result?.value ?? 0;
};

export const selectStore = async (id: string, organisationId: string) => {
    const [store] = await db.select().from(stores).where(byIdInOrganisation(id, organisationId));
    return store;
};

export const selectStoresList = async (organisationId: string) => {
    return await db.select().from(stores).where(eq(stores.organisationId, organisationId)).orderBy(asc(stores.createdAt), asc(stores.id));
};

export const updateStore = async (id: string, organisationId: string, updateValues: storesUpdateType) => {
    const [store] = await db.update(stores).set(updateValues).where(byIdInOrganisation(id, organisationId)).returning();
    return store;
};

export const deleteStore = async (id: string, organisationId: string) => {
    const [store] = await db.delete(stores).where(byIdInOrganisation(id, organisationId)).returning();
    return store;
};

export const touchMenuUpdatedAt = async (storeId: string, tx?: DbTransactionType) => {
    const connection = tx ?? db;
    await connection.update(stores).set({ menuUpdatedAt: new Date() }).where(eq(stores.id, storeId));
};

export const selectHours = async (storeIds: string[]) => {
    if (storeIds.length === 0) return [];
    return await db.select().from(storeHours).where(inArray(storeHours.storeId, storeIds))
        .orderBy(asc(storeHours.weekday), asc(storeHours.opensMinutes));
};

export const replaceHours = async (
    storeId: string,
    hours: { weekday: number, opensMinutes: number, closesMinutes: number }[]
) => {
    await db.transaction(async (tx) => {
        await tx.delete(storeHours).where(eq(storeHours.storeId, storeId));
        if (hours.length > 0) await tx.insert(storeHours).values(hours.map(shift => ({ ...shift, storeId })));
    });
};

export const selectTables = async (storeIds: string[]) => {
    if (storeIds.length === 0) return [];
    return await db.select().from(storeTables).where(inArray(storeTables.storeId, storeIds))
        .orderBy(asc(storeTables.position), asc(storeTables.label));
};

// Upserts by id so reservations keep pointing at tables that still exist.
export const replaceTables = async (
    storeId: string,
    tables: { id?: string | undefined, label: string, seats: number, area: string }[]
) => {
    await db.transaction(async (tx) => {
        const keptIds = tables.flatMap(table => table.id ? [table.id] : []);
        await tx.delete(storeTables).where(and(
            eq(storeTables.storeId, storeId),
            keptIds.length > 0 ? notInArray(storeTables.id, keptIds) : undefined
        ));

        // Free every kept label first so swapping labels between tables can't trip the unique key.
        for (const id of keptIds) {
            await tx.update(storeTables).set({ label: `~${id.slice(-19)}` })
                .where(and(eq(storeTables.id, id), eq(storeTables.storeId, storeId)));
        }

        for (const [position, table] of tables.entries()) {
            const values = { label: table.label, seats: table.seats, area: table.area, position };
            if (table.id) {
                await tx.update(storeTables).set(values)
                    .where(and(eq(storeTables.id, table.id), eq(storeTables.storeId, storeId)));
            } else {
                await tx.insert(storeTables).values({ ...values, storeId });
            }
        }
    });
};

// Marking an already-occupied table again keeps its original start time.
export const updateTableOccupancy = async (storeId: string, tableId: string, occupied: boolean) => {
    const [table] = await db.update(storeTables)
        .set({ occupiedSince: occupied ? sql`coalesce(${storeTables.occupiedSince}, now())` : null })
        .where(and(eq(storeTables.id, tableId), eq(storeTables.storeId, storeId)))
        .returning();
    return table;
};

export const selectClosures = async (storeIds: string[], fromDate: string) => {
    if (storeIds.length === 0) return [];
    return await db.select().from(storeClosures)
        .where(and(inArray(storeClosures.storeId, storeIds), gte(storeClosures.date, fromDate)))
        .orderBy(asc(storeClosures.date));
};

export const insertClosure = async (storeId: string, date: string, note: string) => {
    const [closure] = await db.insert(storeClosures).values({ storeId, date, note }).returning();
    return closure!;
};

export const deleteClosure = async (storeId: string, closureId: string) => {
    const [closure] = await db.delete(storeClosures)
        .where(and(eq(storeClosures.id, closureId), eq(storeClosures.storeId, storeId))).returning();
    return closure;
};

export const selectMenuCounts = async (storeIds: string[]) => {
    if (storeIds.length === 0) return { groups: [], items: [] };
    const groups = await db.select({ storeId: menuGroups.storeId, value: count() }).from(menuGroups)
        .where(inArray(menuGroups.storeId, storeIds)).groupBy(menuGroups.storeId);
    const items = await db.select({ storeId: menuItems.storeId, value: count() }).from(menuItems)
        .where(inArray(menuItems.storeId, storeIds)).groupBy(menuItems.storeId);
    return { groups, items };
};
