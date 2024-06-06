import express from "express";
import config from "config";

const APP_PORT = config.get("backend-services.port")
const app = express();

app.listen(49152, () => {
    console.log(`Server is running on port ${APP_PORT}`);
})
