import { db } from "../../lib/db.js"
import { stores, type storesInsertType, type storesUpdateType } from "../../db/schema/stores.js";
import { eq } from "drizzle-orm";

export const insertStore = async (insertValues: storesInsertType) => {
    return await db.insert(stores).values(insertValues).returning();
};

export const selectStore = async (id: string) => {
    return await db.select().from(stores).where(eq(stores.id, id));
};

export const updateStore = async (id: string, updateValues: storesUpdateType) => {
    return db.update(stores).set(updateValues).where(eq(stores.id, id)).returning();
};

export const deleteStore = async (id: string) => {
    return await db.delete(stores).where(eq(stores.id, id)).returning();
};