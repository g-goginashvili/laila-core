import { Router } from "express";
import { authenticate, requireRole } from "../middlewares/authenticate.js";
import { orgRouter } from "./admin/organisations.routes.js";
import { storeRouter } from "./admin/stores.routes.js";
import { dashboardRouter } from "./admin/dashboard.routes.js";
import { accountRouter } from "./admin/account.routes.js";

export const adminRouter = Router();

adminRouter.use(authenticate, requireRole("admin"));

adminRouter.use("/org", orgRouter);
adminRouter.use("/stores", storeRouter);
adminRouter.use("/dashboard", dashboardRouter);
adminRouter.use("/account", accountRouter);
