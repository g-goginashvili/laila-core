import { db } from "../lib/db.js"
import { organisations, type organisationsInsertType } from "../db/schema/organisations.js";

export const addOrganisation = async (insertValues: organisationsInsertType) => {
    await db.insert(organisations).values(insertValues);
};
