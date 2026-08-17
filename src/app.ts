import express, { type Express, type Request, type Response } from "express";
import cors from "cors";
import { config } from "./config/index.js";
import { router } from "./routes/index.js";
import { notFound } from "./middlewares/not-found.js";
import { errorHandler } from "./middlewares/error-handler.js";


export const app: Express = express();

app.use(cors({
    origin: config.cors.origins,
    methods: config.cors.methods,
}));

app.use(express.json({ limit: config.bodyLimit }));

app.use("/api", router);

app.use(notFound);
app.use(errorHandler);