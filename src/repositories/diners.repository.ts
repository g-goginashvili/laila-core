import { db } from "../lib/db.js"
import { diners, type dinersInsertType } from "../db/schema/diners.js";

export const insertDiner = async (insertValues: dinersInsertType) => {
    await db.insert(diners).values(insertValues);
};
