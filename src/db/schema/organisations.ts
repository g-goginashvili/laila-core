import { pgTable, varchar, boolean } from "drizzle-orm/pg-core";
import { users } from "./users.js";
import { v7 as uuidv7 } from "uuid";

export const organisations = pgTable("organisations", {
    id: varchar({ length: 255 }).primaryKey().$defaultFn(uuidv7),
    adminUserId: varchar("admin_user_id", { length: 255 }).notNull().references(() => users.id),
    orgName: varchar("org_name", { length: 255 }).notNull(),
    address: varchar({ length: 255 }).notNull(),
    signleLocation: boolean("single_location").notNull().default(true)
});

export type organisationsInsertType = Omit<typeof organisations.$inferInsert, "id">;
export type organisationsSelectType = typeof organisations.$inferSelect;