import { auth } from "../lib/firebase.js"
import { authToAppError } from "../utils/firebase-auth-error.js";
import type { AdminSignUpType } from "../validators/auth.schema.js";

export const adminSignUp = async ({
    firstName, lastName, email, password,
    phoneNumber, orgName, address
}: AdminSignUpType) => {
    try {
        const user = await auth.createUser({
            email,
            phoneNumber,
            password,
            displayName: `${firstName} ${lastName}`,
        });

        await auth.setCustomUserClaims(user.uid, { role: "admin" });

        // TODO: Later will add user information to db 

        return {
            uid: user.uid,
            email: user.email,
            emailVerified: user.emailVerified
        };
    } catch (error) {
        authToAppError(error);
    }
};