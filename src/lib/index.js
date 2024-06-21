import express from "express" 
import server from "./server/index.js";

export let app = express();

server(app);
