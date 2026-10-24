import { AppError } from "./app-error.js";

type PgErrorType = {
    code?: string;
    constraint?: string;
};

const CONSTRAINT_MESSAGES: Record<string, string> = {
    users_email_key: "Email already in use",
    users_phone_number_key: "Phone number already in use",
    organisations_admin_user_id_key: "This account already has an organisation",
    waitlist_email_key: "Email already on the waitlist",
};

// Drizzle wraps driver errors in DrizzleQueryError, keeping the pg error as `cause`.
const findPgError = (error: unknown): PgErrorType | undefined => {
    let current: unknown = error;
    for (let depth = 0; current && depth < 3; depth++) {
        const candidate = current as PgErrorType & { cause?: unknown };
        if (typeof candidate.code === "string" && /^[0-9A-Z]{5}$/.test(candidate.code)) return candidate;
        current = candidate.cause;
    }
    return undefined;
};

export const pgToAppError = (error: unknown): AppError | undefined => {
    const pgError = findPgError(error);
    if (!pgError) return undefined;

    switch (pgError.code) {
        case "23505":
            return new AppError(409, CONSTRAINT_MESSAGES[pgError.constraint ?? ""] ?? "Resource already exists");
        case "23503":
            return new AppError(409, "Resource is referenced by other records");
        case "22001":
            return new AppError(400, "Value too long");
        default:
            return undefined;
    }
};
