import { auth } from "../lib/firebase.js"
import { addOrganisation } from "../repositories/organisations.repository.js";
import { addAdminUser } from "../repositories/users.repository.js";
import { authToAppError } from "../utils/firebase-auth-error.js";
import type { AdminSignUpType } from "../validators/auth.schema.js";

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

        await addAdminUser({
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