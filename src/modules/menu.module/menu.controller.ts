import type { Request, Response } from "express";
import {
    addGroupService, addItemService, deleteGroupService, deleteItemService, getMenuService,
    reorderGroupsService, updateGroupService, updateItemService
} from "./menu.service.js";
import type {
    AddMenuItemSchemaType, MenuGroupOrderSchemaType, MenuGroupSchemaType, UpdateMenuItemSchemaType
} from "./menu.schema.js";
import { getAuth } from "../../middlewares/authenticate.js";

type StoreParamsType = { storeId: string };
type GroupParamsType = StoreParamsType & { groupId: string };
type ItemParamsType = StoreParamsType & { itemId: string };

export const getMenuController = async (req: Request<StoreParamsType>, res: Response) => {
    res.status(200).json(await getMenuService(getAuth(req).uid, req.params.storeId));
};

export const addGroupController = async (req: Request<StoreParamsType, {}, MenuGroupSchemaType>, res: Response) => {
    res.status(201).json(await addGroupService(getAuth(req).uid, req.params.storeId, req.body));
};

export const updateGroupController = async (req: Request<GroupParamsType, {}, MenuGroupSchemaType>, res: Response) => {
    res.status(200).json(await updateGroupService(getAuth(req).uid, req.params.storeId, req.params.groupId, req.body));
};

export const deleteGroupController = async (req: Request<GroupParamsType>, res: Response) => {
    res.status(200).json(await deleteGroupService(getAuth(req).uid, req.params.storeId, req.params.groupId));
};

export const reorderGroupsController = async (req: Request<StoreParamsType, {}, MenuGroupOrderSchemaType>, res: Response) => {
    res.status(200).json(await reorderGroupsService(getAuth(req).uid, req.params.storeId, req.body));
};

export const addItemController = async (req: Request<StoreParamsType, {}, AddMenuItemSchemaType>, res: Response) => {
    res.status(201).json(await addItemService(getAuth(req).uid, req.params.storeId, req.body));
};

export const updateItemController = async (req: Request<ItemParamsType, {}, UpdateMenuItemSchemaType>, res: Response) => {
    res.status(200).json(await updateItemService(getAuth(req).uid, req.params.storeId, req.params.itemId, req.body));
};

export const deleteItemController = async (req: Request<ItemParamsType>, res: Response) => {
    res.status(200).json(await deleteItemService(getAuth(req).uid, req.params.storeId, req.params.itemId));
};
