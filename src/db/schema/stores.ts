import { pgTable, varchar, text, integer, date, timestamp } from "drizzle-orm/pg-core";
import { v7 as uuidv7 } from "uuid";
import { users } from "./users.js";
import { organisations } from "./organisations.js";

export const STORE_STATUSES = ["draft", "open", "temporarily_closed"] as const;
export type StoreStatusType = typeof STORE_STATUSES[number];

export const stores = pgTable("stores", {
    id: varchar({ length: 255 }).notNull().primaryKey().$defaultFn(uuidv7),
    adminUserId: varchar("admin_user_id", { length: 255 }).notNull().references(() => users.id),
    organisationId: varchar("organisation_id", { length: 255 }).notNull().references(() => organisations.id),
    storeName: varchar("store_name", { length: 255 }).notNull(),
    storeManager: varchar("store_manager", { length: 255 }).notNull(),
    // Street line; postcode, city, region and country are kept separately.
    address: varchar({ length: 255 }).notNull(),
    postcode: varchar({ length: 20 }).notNull().default(""),
    city: varchar({ length: 100 }).notNull().default(""),
    region: varchar({ length: 100 }).notNull().default(""),
    country: varchar({ length: 100 }).notNull().default(""),
    email: varchar({ length: 255 }).notNull(),
    phoneNumber: varchar("phone_number", { length: 255 }).notNull(),
    website: varchar({ length: 255 }).notNull().default(""),

    status: varchar({ length: 20 }).$type<StoreStatusType>().notNull().default("draft"),
    closureNote: varchar("closure_note", { length: 255 }).notNull().default(""),
    reopensOn: date("reopens_on", { mode: "string" }),
    timezone: varchar({ length: 64 }).notNull().default("Europe/Athens"),

    description: text().notNull().default(""),
    cuisine: varchar({ length: 100 }).notNull().default(""),
    priceRange: varchar("price_range", { length: 100 }).notNull().default(""),
    openedOn: date("opened_on", { mode: "string" }),
    floorAreaM2: integer("floor_area_m2"),

    minPartySize: integer("min_party_size").notNull().default(1),
    maxPartySize: integer("max_party_size").notNull().default(8),
    tableTimeMinutes: integer("table_time_minutes").notNull().default(120),
    lunchTableTimeMinutes: integer("lunch_table_time_minutes"),
    lastSeatingMinutes: integer("last_seating_minutes").notNull().default(60),

    bookingWindowDays: integer("booking_window_days").notNull().default(60),
    minNoticeHours: integer("min_notice_hours").notNull().default(2),
    depositPerGuestCents: integer("deposit_per_guest_cents").notNull().default(0),
    depositMinParty: integer("deposit_min_party"),
    cancellationHours: integer("cancellation_hours").notNull().default(24),
    gracePeriodMinutes: integer("grace_period_minutes").notNull().default(15),

    menuUpdatedAt: timestamp("menu_updated_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type storesInsertType = Omit<typeof stores.$inferInsert, "id">;
export type storesSelectType = typeof stores.$inferSelect;
type storesEditableType = Omit<typeof stores.$inferInsert, "id" | "adminUserId" | "organisationId" | "createdAt">;
export type storesUpdateType = { [K in keyof storesEditableType]?: storesEditableType[K] | undefined };
