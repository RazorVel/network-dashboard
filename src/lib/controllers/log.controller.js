import path from "path";
import { fileURLToPath } from "url";
import LogParser from "../engine/logParser.js";
import { client, db } from "../models/db.js";

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
        const result = await collection.insertMany(lines);
        
        res.status(200).send({ message: "Log received by server", result });
    } catch (err) {
        res.status(500).send({ message: "Log collecting error", error: err.message });
    } finally {
        await client.close();
    }

}

export default controllers;