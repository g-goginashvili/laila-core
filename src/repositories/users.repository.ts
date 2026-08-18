import { db } from "../lib/db.js"
import { users, type usersInsertType } from "../db/schema/users.js";

export const addAdminUser = async (insertValues: usersInsertType) => {
    await db.insert(users).values(insertValues);
};
