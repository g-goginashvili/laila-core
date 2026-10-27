import type { Request, Response } from "express";
import { getOwnAccount } from "./account.service.js";
import { getAuth } from "../../../middlewares/authenticate.js";

export const getAccountController = async (req: Request, res: Response) => {
    res.status(200).json(await getOwnAccount(getAuth(req).uid));
};
