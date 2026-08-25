import type { Request, Response } from "express";
import { addStoreService, deleteStoreService, getStoreService, updateStoreService } from "./stores.service.js";
import type { AddStoreSchemaType, UpdateStoreSchemaType } from "./stores.schema.js";

export const addStoreController = async (req: Request<{}, {}, AddStoreSchemaType>, res: Response) => {
    res.status(200).json(await addStoreService(req.body));
};

export const getStoreController = async (req: Request, res: Response) => {
    res.status(201).json(await getStoreService(req.query.id as string));
};

export const updateStoreController = async (req: Request<{}, {}, UpdateStoreSchemaType>, res: Response) => {
    const { id, ...updateValues } = req.body;
    res.status(200).json(await updateStoreService(id!, updateValues));
};

export const deleteStoreController = async (req: Request<{ id: string }>, res: Response) => {
    res.status(200).json(await deleteStoreService(req.params.id));
};