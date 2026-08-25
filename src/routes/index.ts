import { Router } from "express";
import { authRouter } from "./auth.routes.js";
import { orgRouter } from "./organisations.routs.js";
import { storeRouter } from "./stores.routes.js";

export const router = Router();

router.use("/auth", authRouter);
router.use("/org", orgRouter);
router.use("/store", storeRouter);