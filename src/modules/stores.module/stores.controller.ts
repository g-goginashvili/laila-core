import type { Request, Response } from "express";
import { addStoreService, deleteStoreService, getStoreService, getStoresListService, updateStoreService } from "./stores.service.js";
import type { AddStoreSchemaType, UpdateStoreSchemaType } from "./stores.schema.js";
import { getAuth } from "../../middlewares/authenticate.js";

type StoreParamsType = { id: string };

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
