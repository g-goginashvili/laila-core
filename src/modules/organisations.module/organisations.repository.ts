import { db } from "../../lib/db.js"
import { organisations, type organisationsInsertType } from "../../db/schema/organisations.js";
import { eq, type EmptyRelations } from "drizzle-orm";
import type { PgAsyncTransaction } from "drizzle-orm/pg-core";
import type { NodePgQueryResultHKT } from "drizzle-orm/node-postgres";

export const addOrganisation = async (
    insertValues: organisationsInsertType,
    tx?: PgAsyncTransaction<NodePgQueryResultHKT, EmptyRelations>
) => {
    const connection = tx ? tx : db;
    const [organisationDetails] = await connection.insert(organisations).values(insertValues).returning();
    return organisationDetails!;
};

export const selectOrganisation = async (id: string) => {
    return await db.select().from(organisations).where(eq(organisations.id, id));
};