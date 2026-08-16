import 'dotenv/config';
import { app } from "./src/app.js";

app.listen(Number(process.env.PORT) || 8080, () => {
    console.log("Running");
});