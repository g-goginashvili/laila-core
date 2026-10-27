import type { Request, Response } from "express";
import { adminSignUp, dinerSignUp } from "./auth.service.js";
import type { AdminSignUpType, DinerSignUpType } from "./auth.schema.js";

export const adminSignUpController = async (req: Request<{}, {}, AdminSignUpType>, res: Response) => {
    res.status(201).json(await adminSignUp(req.body));
};

export const dinerSignUpController = async (req: Request<{}, {}, DinerSignUpType>, res: Response) => {
    res.status(201).json(await dinerSignUp(req.body));
};
