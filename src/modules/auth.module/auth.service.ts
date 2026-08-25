import { auth } from "../../lib/firebase.js"
import { addOrganisation } from "../organisations.module/organisations.repository.js";
import { insertAdminUser } from "./users.repository.js";
import { authToAppError } from "../../utils/firebase-auth-error.js";
import type { AdminSignUpType } from "../../modules/auth.module/auth.schema.js";
import { db } from "../../lib/db.js";
import { insertStore } from "../stores.module/stores.repository.js";



export const adminSignUp = async ({
    name, surname, email, password,
    phoneNumber, orgName, address, singleLocation
}: AdminSignUpType) => {
    try {
        const user = await auth.createUser({
            email,
            phoneNumber,
            password,
            displayName: `${name} ${surname}`,
        });

        try {
            await auth.setCustomUserClaims(user.uid, { role: "admin" });

            await db.transaction(async (tx) => {
                await insertAdminUser({
                    id: user.uid,
                    name,
                    surname,
                    email,
                    phoneNumber,
                    role: "admin"
                }, tx);

                const organisationDetails = await addOrganisation({
                    orgName,
                    address,
                    adminUserId: user.uid,
                    singleLocation
                }, tx);

                if (singleLocation) await insertStore({
                    email: email,
                    phoneNumber: phoneNumber,
                    address: address,
                    adminUserId: user.uid,
                    organisationId: organisationDetails.id,
                    storeName: orgName,
                    storeManager: `${name} ${surname}`
                }, tx)
            });
        } catch (error) {
            await auth.deleteUser(user.uid).catch((cleanupError) => {
                console.error("Failed to roll back Firebase user", user.uid, cleanupError);
            });
            throw error;
        }

        return { uid: user.uid };
    } catch (error) {
        authToAppError(error);
    }
};