import { db } from "../lib/db.js"
import { menuGroups, menuItems, type MenuComponentType } from "../db/schema/menu.js";
import { and, asc, eq, max } from "drizzle-orm";
import { touchMenuUpdatedAt } from "./stores.repository.js";

type NewMenuItemType = {
    groupId: string;
    name: string;
    description: string;
    priceCents: number;
    components: MenuComponentType[];
    available: boolean;
};

type MenuItemValuesType = {
    groupId?: string | undefined;
    name?: string | undefined;
    description?: string | undefined;
    priceCents?: number | undefined;
    components?: MenuComponentType[] | undefined;
    available?: boolean | undefined;
};

export const selectGroups = async (storeId: string) => {
    return await db.select().from(menuGroups).where(eq(menuGroups.storeId, storeId)).orderBy(asc(menuGroups.position), asc(menuGroups.id));
};

export const selectItems = async (storeId: string) => {
    return await db.select().from(menuItems).where(eq(menuItems.storeId, storeId)).orderBy(asc(menuItems.position), asc(menuItems.id));
};

export const selectGroup = async (storeId: string, groupId: string) => {
    const [group] = await db.select().from(menuGroups).where(and(eq(menuGroups.id, groupId), eq(menuGroups.storeId, storeId)));
    return group;
};

export const selectItem = async (storeId: string, itemId: string) => {
    const [item] = await db.select().from(menuItems).where(and(eq(menuItems.id, itemId), eq(menuItems.storeId, storeId)));
    return item;
};

export const insertGroup = async (storeId: string, name: string) => {
    return await db.transaction(async (tx) => {
        const [last] = await tx.select({ value: max(menuGroups.position) }).from(menuGroups).where(eq(menuGroups.storeId, storeId));
        const [group] = await tx.insert(menuGroups).values({ storeId, name, position: (last?.value ?? -1) + 1 }).returning();
        await touchMenuUpdatedAt(storeId, tx);
        return group!;
    });
};

export const updateGroup = async (storeId: string, groupId: string, name: string) => {
    return await db.transaction(async (tx) => {
        const [group] = await tx.update(menuGroups).set({ name })
            .where(and(eq(menuGroups.id, groupId), eq(menuGroups.storeId, storeId))).returning();
        await touchMenuUpdatedAt(storeId, tx);
        return group;
    });
};

export const deleteGroup = async (storeId: string, groupId: string) => {
    return await db.transaction(async (tx) => {
        const [group] = await tx.delete(menuGroups)
            .where(and(eq(menuGroups.id, groupId), eq(menuGroups.storeId, storeId))).returning();
        await touchMenuUpdatedAt(storeId, tx);
        return group;
    });
};

export const reorderGroups = async (storeId: string, groupIds: string[]) => {
    await db.transaction(async (tx) => {
        for (const [position, id] of groupIds.entries()) {
            await tx.update(menuGroups).set({ position }).where(and(eq(menuGroups.id, id), eq(menuGroups.storeId, storeId)));
        }
        await touchMenuUpdatedAt(storeId, tx);
    });
};

export const insertItem = async (storeId: string, values: NewMenuItemType) => {
    return await db.transaction(async (tx) => {
        const [last] = await tx.select({ value: max(menuItems.position) }).from(menuItems).where(eq(menuItems.groupId, values.groupId));
        const [item] = await tx.insert(menuItems).values({ ...values, storeId, position: (last?.value ?? -1) + 1 }).returning();
        await touchMenuUpdatedAt(storeId, tx);
        return item!;
    });
};

export const updateItem = async (storeId: string, itemId: string, values: MenuItemValuesType) => {
    return await db.transaction(async (tx) => {
        let position: number | undefined;
        if (values.groupId) {
            const [last] = await tx.select({ value: max(menuItems.position) }).from(menuItems).where(eq(menuItems.groupId, values.groupId));
            position = (last?.value ?? -1) + 1;
        }
        const [item] = await tx.update(menuItems).set({ ...values, ...(position !== undefined && { position }), updatedAt: new Date() })
            .where(and(eq(menuItems.id, itemId), eq(menuItems.storeId, storeId))).returning();
        await touchMenuUpdatedAt(storeId, tx);
        return item;
    });
};

export const deleteItem = async (storeId: string, itemId: string) => {
    return await db.transaction(async (tx) => {
        const [item] = await tx.delete(menuItems).where(and(eq(menuItems.id, itemId), eq(menuItems.storeId, storeId))).returning();
        await touchMenuUpdatedAt(storeId, tx);
        return item;
    });
};
