import path from "path";
import { fileURLToPath } from "url";
import { client, db } from "../models/db.js";
import { ObjectId } from "mongodb";
import { clients as sseClients } from "../states/sse.js";
import { logs as logCache } from "../states/cache.js";

let __filename = fileURLToPath(import.meta.url);
let __dirname = path.dirname(__filename);

const controllers = {};

controllers.sse = async function (req, res, next) {
    // Set headers for SSE
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    // Add clients to the list
    sseClients.push(res);
    console.log("Client connected. Total clients:", sseClients.length);

    // Remove client when connection is closed
    req.on("close", () => {
        sseClients.splice(sseClients.indexOf(res), 1);
        console.log("Client disconnected. Total clients:", sseClients.length);
    })

    res.write(`data: ${JSON.stringify(logCache)}\n\n`);
};

export default controllers;