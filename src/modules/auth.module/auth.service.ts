import { auth } from "../../lib/firebase.js"
import { addOrganisation } from "../organisations.module/organisations.repository.js";
import { insertAdminUser } from "./users.repository.js";
import { authToAppError } from "../../utils/firebase-auth-error.js";
import type { AdminSignUpType } from "../../modules/auth.module/auth.schema.js";

export const adminSignUp = async ({
    name, surname, email, password,
    phoneNumber, orgName, address
}: AdminSignUpType) => {
    try {
        const user = await auth.createUser({
            email,
            phoneNumber,
            password,
            displayName: `${name} ${surname}`,
        });

        await auth.setCustomUserClaims(user.uid, { role: "admin" });

        await insertAdminUser({
            id: user.uid,
            name,
            surname,
            email,
            phoneNumber,
            role: "admin"
        });

        await addOrganisation({
            orgName,
            address,
            adminUserId: user.uid
        });

        return {
            uid: user.uid,
            email: user.email,
            emailVerified: user.emailVerified
        };
    } catch (error) {
        authToAppError(error);
    }
};