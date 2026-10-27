import { db } from "../lib/db.js"
import { diners, type dinersInsertType, type dinersProfileUpdateType } from "../db/schema/diners.js";
import { eq } from "drizzle-orm";

const profileColumns = {
    email: diners.email,
    name: diners.name,
    surname: diners.surname,
    phoneNumber: diners.phoneNumber,
};

export const insertDiner = async (insertValues: dinersInsertType) => {
    await db.insert(diners).values(insertValues);
};

export const selectDinerById = async (id: string) => {
    const [diner] = await db.select(profileColumns).from(diners).where(eq(diners.id, id));
    return diner;
};

export const updateDinerProfile = async (id: string, values: dinersProfileUpdateType) => {
    const [diner] = await db.update(diners)
        .set({ ...values, updatedAt: new Date() })
        .where(eq(diners.id, id))
        .returning(profileColumns);
    return diner;
};
