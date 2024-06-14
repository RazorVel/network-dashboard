import path from "path";
import { fileURLToPath } from "url";
import parserControllers from "./parser.controller.js";
import logControllers from "./log.controller.js";
import fieldControllers from "./field.controller.js";

let __filename = fileURLToPath(import.meta.url);
let __dirname = path.dirname(__filename);

let controllers = {};

controllers.root = function (req, res, next) {
    res.send("Welcome to the root route");
}

controllers.default = function (req, res, next) {
    res.status(404).send("Resource not found");
}

controllers = {...controllers, ...parserControllers, ...fieldControllers, ...logControllers};

export default controllers;