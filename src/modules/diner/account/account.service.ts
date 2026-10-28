import { selectDinerById, updateDinerProfile } from "../../../repositories/diners.repository.js";
import { AppError } from "../../../utils/app-error.js";
import type { UpdateDinerAccountType } from "./account.schema.js";

type DinerProfileType = NonNullable<Awaited<ReturnType<typeof selectDinerById>>>;

export type DinerSetupStepType = "name" | "surname" | "phoneNumber";

// A diner may book only once every step is done; `missing` tells the app what to ask for.
const toAccount = (diner: DinerProfileType) => {
    const missing: DinerSetupStepType[] = [];
    if (!diner.name) missing.push("name");
    if (!diner.surname) missing.push("surname");
    if (!diner.phoneNumber) missing.push("phoneNumber");

    return { ...diner, missing, canBook: missing.length === 0 };
};

export const getDinerAccount = async (uid: string) => {
    const diner = await selectDinerById(uid);
    if (!diner) throw new AppError(404, "Account not found.");
    return toAccount(diner);
};

export const updateDinerAccount = async (uid: string, values: UpdateDinerAccountType) => {
    const diner = await updateDinerProfile(uid, values);
    if (!diner) throw new AppError(404, "Account not found.");
    return toAccount(diner);
};
