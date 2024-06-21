import path from "path";
import { fileURLToPath } from "url";
import LogParser from "../engine/logParser.js";
import { client, db } from "../models/db.js";
import { ObjectId } from "mongodb";
import { clients as sseClients } from "../states/sse.js";
import { logs as logCache } from "../states/cache.js";

let __filename = fileURLToPath(import.meta.url);
let __dirname = path.dirname(__filename);

const controllers = {};
const parser = new LogParser();

controllers.logUpload = async function (req, res, next) {
    const timestamp = (new Date()).getTime();
    
    let result;
    try {
        const { type } = req.query;

        if (typeof req.body != "string") {
            throw new Error("Invalid payload data!");
        }

        let lines = req.body.split("\n");
        lines.pop();

        type && (lines = lines.map((line) => ({
            _type: type, 
            _log: line,
            _isActive: true,
            _timestamp: timestamp,
            ...parser.parse(type, line)
        })));

        await client.connect();

        const collection = db.collection("logs");

        // Create bulk operations for upserting logs
        const bulkOps = lines.map(line => ({
            updateOne: {
                filter: {_type: line._type, _log: line._log},
                update: { $setOnInsert: line },
                upsert: true
            }
        }));

        result = await collection.bulkWrite(bulkOps);
        
        res.status(200).send({ message: "Log received by server", result });
    } catch (err) {
        res.status(500).send({ message: "Log collecting error", error: err.message });
    } finally {
        await client.close();
    }

    (async() => {
        if (!result) return;

        try {
            await client.connect();

            const collection = db.collection("logs");

            // Extracting inserted document IDs
            const upsertedIds = Object.values(result.upsertedIds);

            // Querying the inserted documents
            const upsertedDocuments = await collection.find({ _id: { $in: upsertedIds } }).sort({_timestamp: -1, _id: -1}).toArray();

            for (let document of upsertedDocuments.slice().reverse()) {
                logCache.unshift(document);
            }

            for (let sseClient of sseClients) {
                sseClient.write(`data: ${JSON.stringify(upsertedDocuments)}\n\n`);
            }
        } catch (err) {
            console.error("Failure to cache / trigger SSE:");
            console.error(err);
        } finally {
            await client.close();
        }
    })();
}

controllers.getLog = async function (req, res, next) {
    try {
        req.query._id && (req.query._id = new ObjectId(req.query._id));

        await client.connect();
        const collection = db.collection("logs");

        if (req.query._isActive === undefined) {
            req.query._isActive = true;
        }

        if (req.query._isActive == "true") {
            req.query._isActive = true
        }

        if (req.query._isActive == "false") {
            req.query._isActive = false;
        }

        let data = await (await collection.find(req.query).sort({_timestamp: -1, _id: -1})).toArray();

        res.status(200).send({ message: "Logs retrieved!", data });
    } catch (err) {
        res.status(500).send({ message: "Error retrieving log data", error: err.message });
    } finally {
        await client.close();
    }
};

export default controllers;