import { AppError } from "./app-error.js";

type ErrorMappingType = {
    statusCode: number;
    message: string;
};

export const FIREBASE_AUTH_ERRORS: Record<string, ErrorMappingType> = {
    "auth/email-already-exists": { statusCode: 409, message: "Email already in use" },
    "auth/phone-number-already-exists": { statusCode: 409, message: "Phone number already in use" },
    "auth/uid-already-exists": { statusCode: 409, message: "UID already in use" },
    
    "auth/invalid-email": { statusCode: 400, message: "Invalid email address" },
    "auth/invalid-password": { statusCode: 400, message: "Password must be at least 6 characters" },
    "auth/invalid-phone-number": { statusCode: 400, message: "Phone number must be in E.164 format" },
    "auth/invalid-display-name": { statusCode: 400, message: "Invalid display name" },
    "auth/invalid-uid": { statusCode: 400, message: "Invalid uid" },
    "auth/invalid-argument": { statusCode: 400, message: "Invalid argument" },
    
    "auth/user-not-found": { statusCode: 404, message: "User not found" },
    "auth/user-disabled": { statusCode: 403, message: "Account disabled" },
    "auth/operation-not-allowed": { statusCode: 403, message: "Sign-in provider is disabled" },

    "auth/id-token-expired": { statusCode: 401, message: "Session expired" },
    "auth/id-token-revoked": { statusCode: 401, message: "Session revoked" },
    "auth/invalid-id-token": { statusCode: 401, message: "Invalid credentials" },
    "auth/session-cookie-expired": { statusCode: 401, message: "Session expired" },
    "auth/session-cookie-revoked": { statusCode: 401, message: "Session revoked" },

    "auth/too-many-requests": { statusCode: 429, message: "Too many requests, try again later" },
};

export function authToAppError(error: unknown): never {
    const code = (error as { code?: string } | null)?.code;
    const mapping = code ? FIREBASE_AUTH_ERRORS[code] : undefined;

    if (mapping) {
        throw new AppError(mapping.statusCode, mapping.message);
    }

    throw error;
}
