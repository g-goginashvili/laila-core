import { selectOrganisationByAdmin } from "../../../repositories/organisations.repository.js"
import { AppError } from "../../../utils/app-error.js";

export const getOwnOrganisation = async (adminUserId: string) => {
    const organisation = await selectOrganisationByAdmin(adminUserId);
    if (!organisation) throw new AppError(404, "Organisation not found.");
    return organisation;
};
