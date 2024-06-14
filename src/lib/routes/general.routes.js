import { Router } from "express";
import parserRouter from "./parser.routes.js";
import logRouter from "./log.routes.js";
import fieldRouter from "./field.routes.js";
import controllers from "../controllers/general.controller.js";

export default function (app) {
    let router = Router();

    router.get("/", controllers.root);
    
    app.use(router);
    app.use("/parser", parserRouter);
    app.use("/field", fieldRouter);
    app.use("/log", logRouter);

    app.use(controllers.default);
}