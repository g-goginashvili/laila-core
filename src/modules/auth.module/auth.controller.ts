import type { Request, Response } from "express";
import { adminSignUp, dinerSignUp, getOwnAccount } from "./auth.service.js";
import { getAuth } from "../../middlewares/authenticate.js";
import type { AdminSignUpType, DinerSignUpType } from "./auth.schema.js";

export const adminSignUpController = async (req: Request<{}, {}, AdminSignUpType>, res: Response) => {
    res.status(201).json(await adminSignUp(req.body));
};

export const dinerSignUpController = async (req: Request<{}, {}, DinerSignUpType>, res: Response) => {
    res.status(201).json(await dinerSignUp(req.body));
};

export const getAccountController = async (req: Request, res: Response) => {
    res.status(200).json(await getOwnAccount(getAuth(req).uid));
};
