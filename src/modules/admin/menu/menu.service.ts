import {
    deleteGroup, deleteItem, insertGroup, insertItem, reorderGroups, selectGroup, selectGroups,
    selectItem, selectItems, updateGroup, updateItem
} from "../../../repositories/menu.repository.js";
import { getOwnedStore } from "../stores/stores.service.js";
import { AppError } from "../../../utils/app-error.js";
import type { menuItemsSelectType } from "../../../db/schema/menu.js";
import type {
    AddMenuItemSchemaType, MenuGroupOrderSchemaType, MenuGroupSchemaType, UpdateMenuItemSchemaType
} from "./menu.schema.js";

const toCents = (euros: number) => Math.round(euros * 100);

const toItemDto = ({ priceCents, ...item }: menuItemsSelectType) => ({ ...item, price: priceCents / 100 });

const orThrowNotFound = <T>(value: T | undefined, message: string) => {
    if (!value) throw new AppError(404, message);
    return value;
};

export const getMenuService = async (adminUserId: string, storeId: string) => {
    const store = await getOwnedStore(adminUserId, storeId);
    const [groups, items] = await Promise.all([selectGroups(storeId), selectItems(storeId)]);

    return {
        storeId,
        updatedAt: store.menuUpdatedAt,
        groups: groups.map(group => ({
            ...group,
            items: items.filter(item => item.groupId === group.id).map(toItemDto),
        })),
    };
};

export const addGroupService = async (adminUserId: string, storeId: string, { name }: MenuGroupSchemaType) => {
    await getOwnedStore(adminUserId, storeId);
    return await insertGroup(storeId, name);
};

export const updateGroupService = async (adminUserId: string, storeId: string, groupId: string, { name }: MenuGroupSchemaType) => {
    await getOwnedStore(adminUserId, storeId);
    return orThrowNotFound(await updateGroup(storeId, groupId, name), "Menu group not found.");
};

export const deleteGroupService = async (adminUserId: string, storeId: string, groupId: string) => {
    await getOwnedStore(adminUserId, storeId);
    const group = orThrowNotFound(await deleteGroup(storeId, groupId), "Menu group not found.");
    return { id: group.id };
};

export const reorderGroupsService = async (adminUserId: string, storeId: string, { groupIds }: MenuGroupOrderSchemaType) => {
    await getOwnedStore(adminUserId, storeId);
    const existing = new Set((await selectGroups(storeId)).map(group => group.id));
    if (groupIds.length !== existing.size || new Set(groupIds).size !== groupIds.length || groupIds.some(id => !existing.has(id))) {
        throw new AppError(400, "groupIds must list every menu group exactly once.");
    }
    await reorderGroups(storeId, groupIds);
    return await getMenuService(adminUserId, storeId);
};

export const addItemService = async (adminUserId: string, storeId: string, { price, ...values }: AddMenuItemSchemaType) => {
    await getOwnedStore(adminUserId, storeId);
    orThrowNotFound(await selectGroup(storeId, values.groupId), "Menu group not found.");
    return toItemDto(await insertItem(storeId, { ...values, priceCents: toCents(price) }));
};

export const updateItemService = async (
    adminUserId: string, storeId: string, itemId: string, { price, ...values }: UpdateMenuItemSchemaType
) => {
    await getOwnedStore(adminUserId, storeId);
    const current = orThrowNotFound(await selectItem(storeId, itemId), "Menu item not found.");
    const movesGroup = values.groupId !== undefined && values.groupId !== current.groupId;
    if (movesGroup) orThrowNotFound(await selectGroup(storeId, values.groupId!), "Menu group not found.");

    const item = await updateItem(storeId, itemId, {
        ...values,
        groupId: movesGroup ? values.groupId : undefined,
        ...(price !== undefined && { priceCents: toCents(price) }),
    });
    return toItemDto(orThrowNotFound(item, "Menu item not found."));
};

export const deleteItemService = async (adminUserId: string, storeId: string, itemId: string) => {
    await getOwnedStore(adminUserId, storeId);
    const item = orThrowNotFound(await deleteItem(storeId, itemId), "Menu item not found.");
    return { id: item.id };
};
