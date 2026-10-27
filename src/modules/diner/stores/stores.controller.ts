import type { Request, Response } from "express";
import { getAvailabilityService, getListedStoreDetailsService, getListedStoresService } from "./stores.service.js";
import { availabilityQuerySchema } from "./stores.schema.js";
import { AppError } from "../../../utils/app-error.js";

type StoreParamsType = { storeId: string };

export const getListedStoresController = async (_req: Request, res: Response) => {
    res.status(200).json(await getListedStoresService());
};

export const getListedStoreController = async (req: Request<StoreParamsType>, res: Response) => {
    res.status(200).json(await getListedStoreDetailsService(req.params.storeId));
};

export const getAvailabilityController = async (req: Request<StoreParamsType>, res: Response) => {
    const query = availabilityQuerySchema.safeParse(req.query);
    if (!query.success) throw new AppError(400, "Query must include date as YYYY-MM-DD and partySize.");
    res.status(200).json(await getAvailabilityService(req.params.storeId, query.data.date, query.data.partySize));
};
