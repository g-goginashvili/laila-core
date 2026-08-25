import { varchar } from "drizzle-orm/cockroach-core";
import { pgTable } from "drizzle-orm/pg-core";
import { v7 as uuidv7 } from "uuid";
import { users } from "./users.js";
import { organisations } from "./organisations.js";

export const stores = pgTable("stores", {
    id: varchar({ length: 255 }).notNull().primaryKey().$defaultFn(uuidv7),
    adminUserId: varchar("admin_user_id", { length: 255 }).notNull().references(() => users.id),
    organisationId: varchar("organisation_id", { length: 255 }).notNull().references(() => organisations.id),
    storeName: varchar("store_name", { length: 255 }).notNull(),
    storeManager: varchar("store_manager", { length: 255 }).notNull(),
    address: varchar({ length: 255 }).notNull(),
    email: varchar({ length: 255 }).notNull().unique(),
    phoneNumber: varchar("phone_number", { length: 255 }).notNull().unique(),
});

export type storesInsertType = Omit<typeof stores.$inferInsert, "id">;
export type storesSelectType = typeof stores.$inferSelect;
export type storesUpdateType = Partial<Omit<typeof stores.$inferInsert, "id" | "adminUserid" | "organisationId">>;
