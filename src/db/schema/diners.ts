import { pgTable, varchar, timestamp } from "drizzle-orm/pg-core";

// Diners sign up from the Gviano app with only an email and password; restaurant admins live in users.
// The profile (name, surname, phone) is filled in later from account settings and is required to book.
// Whether the email is verified is not stored here: Firebase owns it.
export const diners = pgTable("diners", {
    // Firebase uid
    id: varchar({ length: 255 }).primaryKey(),
    email: varchar({ length: 255 }).notNull().unique(),
    name: varchar({ length: 255 }),
    surname: varchar({ length: 255 }),
    phoneNumber: varchar("phone_number", { length: 255 }).unique(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type dinersInsertType = Pick<typeof diners.$inferInsert, "id" | "email">;
export type dinersProfileUpdateType = Partial<Pick<typeof diners.$inferInsert, "name" | "surname" | "phoneNumber">>;
