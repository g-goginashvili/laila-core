import type { Request, Response, NextFunction } from "express";
import type { ZodType } from "zod";
import { AppError } from "../utils/app-error.js";

export const validate = (schema: ZodType) => (req: Request, _res: Response, next: NextFunction) => {
    const output = schema.safeParse(req.body);

    if (!output.success) {
        const details = output.error.issues
            .map(issue => `${issue.path.join(".")}: ${issue.message}`).join("; ");
        return next(new AppError(400, details));
    }

    req.body = output.data;
    next();
};