import { db, type DbTransactionType } from "../../lib/db.js"
import { users, type usersInsertType } from "../../db/schema/users.js";

export const insertAdminUser = async (
    insertValues: usersInsertType,
    tx?: DbTransactionType
) => {
    const connection = tx ?? db;
    await connection.insert(users).values(insertValues);
};
