import { selectUserById } from "../../../repositories/users.repository.js";
import { AppError } from "../../../utils/app-error.js";

export const getOwnAccount = async (uid: string) => {
    const account = await selectUserById(uid);
    if (!account) throw new AppError(404, "Account not found.");
    return account;
};
