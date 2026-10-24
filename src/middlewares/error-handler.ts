import type { NextFunction, Request, Response } from "express";
import { AppError } from "../utils/app-error.js";
import { pgToAppError } from "../utils/pg-error.js";

export const errorHandler = (err: unknown, _req: Request, res: Response, _next: NextFunction) => {
    const appError = err instanceof AppError ? err : pgToAppError(err);

    if (appError) {
        res.status(appError.statusCode).json({ message: appError.message });
        return;
    }

    if ((err as { type?: string } | null)?.type === "entity.parse.failed") {
        res.status(400).json({ message: "Malformed JSON body." });
        return;
    }

    console.error("Unexpected error", err);
    res.status(500).json({ message: "Internal server error." });
};
