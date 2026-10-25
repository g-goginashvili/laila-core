import type { NextFunction, Request, Response } from "express";
import { AppError } from "../utils/app-error.js";
import { pgToAppError } from "../utils/pg-error.js";

const CLIENT_ERROR_MESSAGES: Record<number, string> = {
    413: "Request body too large.",
    415: "Unsupported content type.",
};

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

    // body-parser and Express raise client errors (oversized body, bad charset, undecodable URL) with a 4xx status.
    const status = (err as { status?: unknown } | null)?.status;
    if (typeof status === "number" && status >= 400 && status < 500) {
        res.status(status).json({ message: CLIENT_ERROR_MESSAGES[status] ?? "Bad request." });
        return;
    }

    console.error("Unexpected error", err);
    res.status(500).json({ message: "Internal server error." });
};
