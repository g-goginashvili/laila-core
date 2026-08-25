import { selectOrganisation } from "./organisations.repository.js"
import { AppError } from "../../utils/app-error.js";

export const selectOrganisationDetails = async (id: string) => {
    try {
        const details = await selectOrganisation(id)
        console.log(details)
        return details;
    } catch (error) {
        console.error(error);
        throw new AppError(500, "Internal server error");
    }
};