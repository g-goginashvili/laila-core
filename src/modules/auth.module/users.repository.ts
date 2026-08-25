import { db } from "../../lib/db.js"
import { users, type usersInsertType } from "../../db/schema/users.js";
import type { PgAsyncTransaction } from "drizzle-orm/pg-core";
import type { NodePgQueryResultHKT } from "drizzle-orm/node-postgres";
import type { EmptyRelations } from "drizzle-orm";

export const insertAdminUser = async (
    insertValues: usersInsertType,
    tx?: PgAsyncTransaction<NodePgQueryResultHKT, EmptyRelations>
) => {
    const connection = tx ? tx : db;
    await connection.insert(users).values(insertValues);
};
