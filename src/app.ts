import express, { type Express, type Request, type Response } from "express";
import cors from "cors";
import { initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

initializeApp();
export const auth = getAuth();

export const app: Express = express();

app.use(cors({
    origin: ["http://localhost:5173", "https://laila.web.app", "https://laila.firebaseapp.com"],
    methods: ["GET", "POST", "PATCH", "DELETE"],
}));

app.use(express.json({ limit: "10kb" }));

app.post(
    "/api/auth/sign-up",
    async (req: Request, res: Response) => {
        const { email, password } = req.body;

        try {
            const user = await auth.createUser({ email, password });

            res.status(201).json({
                uid: user.uid,
                email: user.email,
                emailVerified: user.emailVerified,
            });
        } catch (error) {
            console.error("sign-up failed:", error);
            res.status(400).json({ error: "user not created" });
        }
    },
);

app.use((_req: Request, res: Response) => {
    res.status(404).json({ error: "not found" });
});
