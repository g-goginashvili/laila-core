import { db, type DbTransactionType } from "../../lib/db.js"
import { organisations, type organisationsInsertType } from "../../db/schema/organisations.js";
import { eq } from "drizzle-orm";

export const addOrganisation = async (
    insertValues: organisationsInsertType,
    tx?: DbTransactionType
) => {
    const connection = tx ?? db;
    const [organisationDetails] = await connection.insert(organisations).values(insertValues).returning();
    return organisationDetails!;
};

export const selectOrganisationByAdmin = async (adminUserId: string) => {
    const [organisation] = await db.select().from(organisations).where(eq(organisations.adminUserId, adminUserId));
    return organisation;
};

export const setOrganisationSingleLocation = async (
    id: string,
    singleLocation: boolean,
    tx?: DbTransactionType
) => {
    const connection = tx ?? db;
    await connection.update(organisations).set({ singleLocation }).where(eq(organisations.id, id));
};
