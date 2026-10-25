import { pgTable, varchar, smallint, integer, date, index, unique, timestamp } from "drizzle-orm/pg-core";
import { v7 as uuidv7 } from "uuid";
import { stores } from "./stores.js";

// Minutes from midnight of the service day. Closing times up to 06:00 the next
// morning are stored past 1440 (e.g. 01:00 => 1500), so an interval never wraps.
export const storeHours = pgTable("store_hours", {
    id: varchar({ length: 255 }).primaryKey().$defaultFn(uuidv7),
    storeId: varchar("store_id", { length: 255 }).notNull().references(() => stores.id, { onDelete: "cascade" }),
    weekday: smallint().notNull(), // 0 = Monday … 6 = Sunday
    opensMinutes: smallint("opens_minutes").notNull(),
    closesMinutes: smallint("closes_minutes").notNull(),
}, (table) => [index("store_hours_store_idx").on(table.storeId)]);

export const storeTables = pgTable("store_tables", {
    id: varchar({ length: 255 }).primaryKey().$defaultFn(uuidv7),
    storeId: varchar("store_id", { length: 255 }).notNull().references(() => stores.id, { onDelete: "cascade" }),
    label: varchar({ length: 20 }).notNull(),
    seats: smallint().notNull(),
    area: varchar({ length: 50 }).notNull().default(""),
    position: integer().notNull().default(0),
    // Set while guests sit at the table (walk-ins included); null when it's free.
    // An occupied table can't take new bookings.
    occupiedSince: timestamp("occupied_since", { withTimezone: true }),
}, (table) => [unique("store_tables_store_label_key").on(table.storeId, table.label)]);

// Whole days a store doesn't take reservations (holidays, private events).
export const storeClosures = pgTable("store_closures", {
    id: varchar({ length: 255 }).primaryKey().$defaultFn(uuidv7),
    storeId: varchar("store_id", { length: 255 }).notNull().references(() => stores.id, { onDelete: "cascade" }),
    date: date({ mode: "string" }).notNull(),
    note: varchar({ length: 255 }).notNull().default(""),
}, (table) => [unique("store_closures_store_date_key").on(table.storeId, table.date)]);

export type storeHoursSelectType = typeof storeHours.$inferSelect;
export type storeTablesSelectType = typeof storeTables.$inferSelect;
export type storeClosuresSelectType = typeof storeClosures.$inferSelect;
