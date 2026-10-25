import type { Request, Response } from "express";
import { getDashboardService } from "./dashboard.service.js";
import { getAuth } from "../../middlewares/authenticate.js";

export const getDashboardController = async (req: Request, res: Response) => {
    res.status(200).json(await getDashboardService(getAuth(req).uid));
};
