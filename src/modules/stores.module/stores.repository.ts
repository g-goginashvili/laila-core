import { db, type DbTransactionType } from "../../lib/db.js"
import { stores, type storesInsertType, type storesUpdateType } from "../../db/schema/stores.js";
import { and, count, eq } from "drizzle-orm";

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
    return await db.select().from(stores).where(eq(stores.organisationId, organisationId)).orderBy(stores.id);
};

export const updateStore = async (id: string, organisationId: string, updateValues: storesUpdateType) => {
    const [store] = await db.update(stores).set(updateValues).where(byIdInOrganisation(id, organisationId)).returning();
    return store;
};

export const deleteStore = async (id: string, organisationId: string) => {
    const [store] = await db.delete(stores).where(byIdInOrganisation(id, organisationId)).returning();
    return store;
};
