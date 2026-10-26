import { pgTable, varchar, timestamp } from "drizzle-orm/pg-core";

// Diners sign up from the Gviano app with only an email and password; restaurant admins live in users.
export const diners = pgTable("diners", {
    // Firebase uid
    id: varchar({ length: 255 }).primaryKey(),
    email: varchar({ length: 255 }).notNull().unique(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type dinersInsertType = Omit<typeof diners.$inferInsert, "createdAt">;
