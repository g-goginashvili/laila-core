import type { Request, Response } from "express";
import { getDinerAccount, updateDinerAccount } from "./account.service.js";
import type { UpdateDinerAccountType } from "./account.schema.js";
import { getAuth } from "../../../middlewares/authenticate.js";

export const getDinerAccountController = async (req: Request, res: Response) => {
    res.status(200).json(await getDinerAccount(getAuth(req).uid));
};

export const updateDinerAccountController = async (req: Request<{}, {}, UpdateDinerAccountType>, res: Response) => {
    res.status(200).json(await updateDinerAccount(getAuth(req).uid, req.body));
};
