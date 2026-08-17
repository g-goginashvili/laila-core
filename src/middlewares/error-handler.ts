import type { NextFunction, Request, Response } from "express";
import { AppError } from "../utils/app-error.js";

export const errorHandler = (err: unknown, _req: Request, res: Response, _next: NextFunction) => {
    if (err instanceof AppError) {
        res.status(err.statusCode).json({ message: err.message });
        return;
    }

    console.error("Unexpected error", err);
    res.status(500).json({ message: "Internal server error." });
};