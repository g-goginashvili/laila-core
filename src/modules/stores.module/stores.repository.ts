import { db } from "../../lib/db.js"
import { stores, type storesInsertType, type storesUpdateType } from "../../db/schema/stores.js";
import { eq } from "drizzle-orm";
import type { PgAsyncTransaction } from "drizzle-orm/pg-core";
import type { NodePgQueryResultHKT } from "drizzle-orm/node-postgres";
import type { EmptyRelations } from "drizzle-orm";

export const insertStore = async (
    insertValues: storesInsertType,
    tx?: PgAsyncTransaction<NodePgQueryResultHKT, EmptyRelations>
) => {
    const connection = tx ? tx : db;
    return await connection.insert(stores).values(insertValues).returning();
};

export const selectStore = async (id: string) => {
    return await db.select().from(stores).where(eq(stores.id, id));
};

export const selectStoresList = async (organisationId: string) => {
    return await db.select().from(stores).where(eq(stores.organisationId, organisationId));
};

export const updateStore = async (id: string, updateValues: storesUpdateType) => {
    return db.update(stores).set(updateValues).where(eq(stores.id, id)).returning();
};

export const deleteStore = async (id: string) => {
    return await db.delete(stores).where(eq(stores.id, id)).returning();
};