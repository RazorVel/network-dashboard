import { Router, static as exStatic } from "express";
import { fileURLToPath } from "url";
import path from "path"
import parserRouter from "./parser.routes.js";
import logRouter from "./log.routes.js";
import fieldRouter from "./field.routes.js";
import controllers from "../controllers/general.controller.js";

//Helper to get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


export default function (app) {
    let router = Router();
    router.get("/", controllers.root);
    
    app.use(router);
    app.use("/parser", parserRouter);
    app.use("/field", fieldRouter);
    app.use("/log", logRouter);

    // serve static files from ../../app/dist
    app.use("/client", exStatic(path.join(__dirname, "../../app/dist")));
    // Redirect all /client requests to index.html
    app.get("/client/*", (req, res) => {
        res.sendFile(path.join(__dirname, "../../app/dist/index.html"));
    })

    app.use(controllers.default);
}