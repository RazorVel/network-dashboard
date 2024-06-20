import path from "path";
import { fileURLToPath } from "url";
import LogParser from "../engine/logParser.js";
import { client, db } from "../models/db.js";
import { ObjectId } from "mongodb";

let __filename = fileURLToPath(import.meta.url);
let __dirname = path.dirname(__filename);

const controllers = {};
const parser = new LogParser();

controllers.logUpload = async function (req, res, next) {
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

        const result = await collection.bulkWrite(bulkOps);
        
        res.status(200).send({ message: "Log received by server", result });
    } catch (err) {
        res.status(500).send({ message: "Log collecting error", error: err.message });
    } finally {
        await client.close();
    }

}

controllers.getLog = async function (req, res, next) {
    try {
        req.query._id && (req.query._id = new ObjectId(req.query._id));

        await client.connect();
        const collection = db.collection("logs");

        let data = await (await collection.find(req.query)).toArray();

        res.status(200).send({ message: "Logs retrieved!", data });
    } catch (err) {
        res.status(500).send({ message: "Error retrieving log data", error: err.message });
    } finally {
        await client.close();
    }
};

export default controllers;