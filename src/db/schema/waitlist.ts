import { pgTable, varchar, timestamp } from "drizzle-orm/pg-core";
import { v7 as uuidv7 } from "uuid";

export const waitlist = pgTable("waitlist", {
    id: varchar({ length: 255 }).primaryKey().$defaultFn(uuidv7),
    email: varchar({ length: 255 }).notNull().unique(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type waitlistInsertType = Omit<typeof waitlist.$inferInsert, "id" | "createdAt">;
