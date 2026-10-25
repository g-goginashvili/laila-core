import { pgTable, varchar, text, integer, boolean, jsonb, timestamp, index } from "drizzle-orm/pg-core";
import { v7 as uuidv7 } from "uuid";
import { stores } from "./stores.js";

export type MenuComponentType = {
    name: string;
    allergen: boolean;
};

export const menuGroups = pgTable("menu_groups", {
    id: varchar({ length: 255 }).primaryKey().$defaultFn(uuidv7),
    storeId: varchar("store_id", { length: 255 }).notNull().references(() => stores.id, { onDelete: "cascade" }),
    name: varchar({ length: 100 }).notNull(),
    position: integer().notNull().default(0),
}, (table) => [index("menu_groups_store_idx").on(table.storeId)]);

export const menuItems = pgTable("menu_items", {
    id: varchar({ length: 255 }).primaryKey().$defaultFn(uuidv7),
    storeId: varchar("store_id", { length: 255 }).notNull().references(() => stores.id, { onDelete: "cascade" }),
    groupId: varchar("group_id", { length: 255 }).notNull().references(() => menuGroups.id, { onDelete: "cascade" }),
    name: varchar({ length: 150 }).notNull(),
    description: text().notNull().default(""),
    priceCents: integer("price_cents").notNull(),
    components: jsonb().$type<MenuComponentType[]>().notNull().default([]),
    // false = sold out: hidden from the guest menu but kept for the admin.
    available: boolean().notNull().default(true),
    position: integer().notNull().default(0),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [index("menu_items_group_idx").on(table.groupId)]);

export type menuGroupsSelectType = typeof menuGroups.$inferSelect;
export type menuItemsSelectType = typeof menuItems.$inferSelect;
