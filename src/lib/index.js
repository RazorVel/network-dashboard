import server from "./server/index.js";
import express from "express"

export let app = express();

server(app);
