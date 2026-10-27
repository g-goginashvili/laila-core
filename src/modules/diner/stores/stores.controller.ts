import type { Request, Response } from "express";
import { getListedStoresService } from "./stores.service.js";

export const getListedStoresController = async (_req: Request, res: Response) => {
    res.status(200).json(await getListedStoresService());
};
