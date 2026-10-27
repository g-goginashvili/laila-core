import { auth } from "../../../lib/firebase.js";
import { selectDinerById, updateDinerProfile } from "../../../repositories/diners.repository.js";
import { AppError } from "../../../utils/app-error.js";
import type { UpdateDinerAccountType } from "./account.schema.js";

type DinerProfileType = NonNullable<Awaited<ReturnType<typeof selectDinerById>>>;

export type DinerSetupStepType = "name" | "surname" | "phoneNumber" | "emailVerification";

// A diner may book only once every step is done; `missing` tells the app what to ask for.
const toAccount = (diner: DinerProfileType, emailVerified: boolean) => {
    const missing: DinerSetupStepType[] = [];
    if (!diner.name) missing.push("name");
    if (!diner.surname) missing.push("surname");
    if (!diner.phoneNumber) missing.push("phoneNumber");
    if (!emailVerified) missing.push("emailVerification");

    return { ...diner, emailVerified, missing, canBook: missing.length === 0 };
};

// Read from Firebase rather than the token, so a diner who just clicked the link is verified straight away.
const isEmailVerified = async (uid: string) => (await auth.getUser(uid)).emailVerified;

export const getDinerAccount = async (uid: string) => {
    const [diner, emailVerified] = await Promise.all([selectDinerById(uid), isEmailVerified(uid)]);
    if (!diner) throw new AppError(404, "Account not found.");
    return toAccount(diner, emailVerified);
};

export const updateDinerAccount = async (uid: string, values: UpdateDinerAccountType) => {
    const [diner, emailVerified] = await Promise.all([updateDinerProfile(uid, values), isEmailVerified(uid)]);
    if (!diner) throw new AppError(404, "Account not found.");
    return toAccount(diner, emailVerified);
};
