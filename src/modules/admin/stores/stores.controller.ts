import type { Request, Response } from "express";
import {
    addClosureService, addStoreService, deleteClosureService, deleteStoreService, getStoreService,
    getStoresListService, replaceHoursService, replaceTablesService, setTableOccupancyService, updateStoreService
} from "./stores.service.js";
import type {
    AddStoreSchemaType, StoreClosureSchemaType, StoreHoursSchemaType, StoreTablesSchemaType, TableOccupancySchemaType,
    UpdateStoreSchemaType
} from "./stores.schema.js";
import { getAuth } from "../../../middlewares/authenticate.js";

type StoreParamsType = { id: string };
type ClosureParamsType = { id: string, closureId: string };
type TableParamsType = { id: string, tableId: string };

export const addStoreController = async (req: Request<{}, {}, AddStoreSchemaType>, res: Response) => {
    res.status(201).json(await addStoreService(getAuth(req).uid, req.body));
};

export const getStoreController = async (req: Request<StoreParamsType>, res: Response) => {
    res.status(200).json(await getStoreService(getAuth(req).uid, req.params.id));
};

export const getStoresListController = async (req: Request, res: Response) => {
    res.status(200).json(await getStoresListService(getAuth(req).uid));
};

export const updateStoreController = async (req: Request<StoreParamsType, {}, UpdateStoreSchemaType>, res: Response) => {
    res.status(200).json(await updateStoreService(getAuth(req).uid, req.params.id, req.body));
};

export const deleteStoreController = async (req: Request<StoreParamsType>, res: Response) => {
    res.status(200).json(await deleteStoreService(getAuth(req).uid, req.params.id));
};

export const replaceHoursController = async (req: Request<StoreParamsType, {}, StoreHoursSchemaType>, res: Response) => {
    res.status(200).json(await replaceHoursService(getAuth(req).uid, req.params.id, req.body));
};

export const replaceTablesController = async (req: Request<StoreParamsType, {}, StoreTablesSchemaType>, res: Response) => {
    res.status(200).json(await replaceTablesService(getAuth(req).uid, req.params.id, req.body));
};

export const setTableOccupancyController = async (req: Request<TableParamsType, {}, TableOccupancySchemaType>, res: Response) => {
    res.status(200).json(await setTableOccupancyService(getAuth(req).uid, req.params.id, req.params.tableId, req.body));
};

export const addClosureController = async (req: Request<StoreParamsType, {}, StoreClosureSchemaType>, res: Response) => {
    res.status(201).json(await addClosureService(getAuth(req).uid, req.params.id, req.body));
};

export const deleteClosureController = async (req: Request<ClosureParamsType>, res: Response) => {
    res.status(200).json(await deleteClosureService(getAuth(req).uid, req.params.id, req.params.closureId));
};
