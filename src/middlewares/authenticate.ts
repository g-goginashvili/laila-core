import type { Request, Response, NextFunction } from "express";
import { auth } from "../lib/firebase.js";
import { AppError } from "../utils/app-error.js";
import { FIREBASE_AUTH_ERRORS } from "../utils/firebase-auth-error.js";

export type AuthContextType = {
    uid: string;
    role: string | null;
};

export const authenticate = async (req: Request, _res: Response, next: NextFunction) => {
    const header = req.headers.authorization;
    const token = header?.startsWith("Bearer ") ? header.slice("Bearer ".length).trim() : undefined;

    if (!token) return next(new AppError(401, "Missing access token."));

    try {
        const decoded = await auth.verifyIdToken(token, true);
        req.auth = {
            uid: decoded.uid,
            role: typeof decoded.role === "string" ? decoded.role : null,
        };
        next();
    } catch (error) {
        const code = (error as { code?: string } | null)?.code;
        // A valid token for a deleted account is an authentication failure, not a missing resource.
        if (code === "auth/user-not-found") return next(new AppError(401, "Invalid credentials"));
        const mapping = code ? FIREBASE_AUTH_ERRORS[code] : undefined;
        next(new AppError(mapping?.statusCode ?? 401, mapping?.message ?? "Invalid credentials"));
    }
};

export const requireRole = (role: string) =>
    (req: Request, _res: Response, next: NextFunction) => {
        if (req.auth?.role !== role) return next(new AppError(403, "Forbidden."));
        next();
    };

export const getAuth = (req: Request): AuthContextType => {
    if (!req.auth) throw new AppError(401, "Not authenticated.");
    return req.auth;
};
