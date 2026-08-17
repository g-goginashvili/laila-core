import type { Request, Response } from "express";
import { adminSignUp } from "../services/auth.service.js";
import type { AdminSignUpType } from "../validators/auth.schema.js";

export const adminSignUpController = async (req: Request<{}, {}, AdminSignUpType>, res: Response) => {
    res.status(201).json(await adminSignUp(req.body));
};