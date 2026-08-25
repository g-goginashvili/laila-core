import type { Request, Response } from "express";
import { adminSignUp } from "./auth.service.js";
import type { AdminSignUpType } from "./auth.schema.js";

export const adminSignUpController = async (req: Request<{}, {}, AdminSignUpType>, res: Response) => {
    res.status(201).json(await adminSignUp(req.body));
};