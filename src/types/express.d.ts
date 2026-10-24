import type { AuthContextType } from "../middlewares/authenticate.js";

declare global {
    namespace Express {
        interface Request {
            auth?: AuthContextType;
        }
    }
}

export {};
