import { db, type DbTransactionType } from "../../lib/db.js"
import { users, type usersInsertType } from "../../db/schema/users.js";
import { eq } from "drizzle-orm";

export const insertAdminUser = async (
    insertValues: usersInsertType,
    tx?: DbTransactionType
) => {
    const connection = tx ?? db;
    await connection.insert(users).values(insertValues);
};

export const selectUserById = async (id: string) => {
    const [user] = await db.select({
        name: users.name,
        surname: users.surname,
        email: users.email,
        phoneNumber: users.phoneNumber,
        role: users.role,
    }).from(users).where(eq(users.id, id));
    return user;
};
