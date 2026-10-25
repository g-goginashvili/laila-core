import { pgTable, varchar, text, smallint, date, timestamp, index } from "drizzle-orm/pg-core";
import { v7 as uuidv7 } from "uuid";
import { stores } from "./stores.js";
import { storeTables } from "./store-settings.js";

export const RESERVATION_STATUSES = ["unconfirmed", "confirmed", "seated", "finished", "no_show", "cancelled"] as const;
export type ReservationStatusType = typeof RESERVATION_STATUSES[number];

// Statuses that hold a table for their time slot.
export const ACTIVE_RESERVATION_STATUSES: ReservationStatusType[] = ["unconfirmed", "confirmed", "seated"];

export const reservations = pgTable("reservations", {
    id: varchar({ length: 255 }).primaryKey().$defaultFn(uuidv7),
    storeId: varchar("store_id", { length: 255 }).notNull().references(() => stores.id, { onDelete: "cascade" }),
    tableId: varchar("table_id", { length: 255 }).references(() => storeTables.id, { onDelete: "set null" }),
    // Service date and minutes from its midnight (after-midnight starts are > 1440).
    date: date({ mode: "string" }).notNull(),
    startMinutes: smallint("start_minutes").notNull(),
    durationMinutes: smallint("duration_minutes").notNull(),
    partySize: smallint("party_size").notNull(),
    guestName: varchar("guest_name", { length: 150 }).notNull(),
    phone: varchar({ length: 30 }).notNull(),
    email: varchar({ length: 255 }).notNull().default(""),
    notes: text().notNull().default(""),
    status: varchar({ length: 20 }).$type<ReservationStatusType>().notNull().default("confirmed"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [index("reservations_store_date_idx").on(table.storeId, table.date)]);

export type reservationsSelectType = typeof reservations.$inferSelect;
export type reservationsInsertType = Omit<typeof reservations.$inferInsert, "id" | "createdAt" | "updatedAt">;
