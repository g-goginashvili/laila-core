import { db } from "../../lib/db.js"
import { organisations, type organisationsInsertType } from "../../db/schema/organisations.js";
import { eq } from "drizzle-orm";

export const addOrganisation = async (insertValues: organisationsInsertType) => {
    await db.insert(organisations).values(insertValues);
};

export const selectOrganisation = async (id: string) => {
    return await db.select().from(organisations).where(eq(organisations.id, id));
};