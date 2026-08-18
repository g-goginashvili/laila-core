import { integer, pgTable, varchar } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
	id: varchar({ length: 255 }).primaryKey(),
	name: varchar({ length: 255 }).notNull(),
	surname: varchar({ length: 255 }).notNull(),
	email: varchar({ length: 255 }).notNull().unique(),
	phoneNumber: varchar("phone_number", { length: 255 }).notNull().unique(),
	role: varchar({ length: 25 }).notNull(),
});

export type usersInsertType = typeof users.$inferInsert;
export type usersSelectType = typeof users.$inferSelect;