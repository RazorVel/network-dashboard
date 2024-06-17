import path from "path";
import { ObjectId } from "mongodb";
import { fileURLToPath } from "url";
import { client, db } from "../models/db.js";


let __filename = fileURLToPath(import.meta.url);
let __dirname = path.dirname(__filename);

const controllers = {};

controllers.parser = async function (req, res, next) {
    if (req.method === "GET") {
        const { option } = req.query;
    
        try {
            await client.connect();

            let collection = db.collection("parsers");
            let data = await (await collection.find()).toArray();

            if (option === "raw") {
                res.setHeader("Content-Type", "application/json").status(200).send(JSON.stringify(data));
            }
            else {
                res.status(200).send({ message: "Parsers retrieved!", data });
            }
        } catch (err) {
            res.status(500).send({ message: "Error reading JSON file", error: err.message });
        } finally {
            await client.close();
        }
    }
    else if (req.method === "POST") {
        try {
            await client.connect();
            let collection = db.collection("parsers");

            const parsers = req.body;

            let invalidReqBody = new Error("Request body should be an array of parser objects");
            if (!Array.isArray(parsers)) {
                throw invalidReqBody;
            }

            // Validate parser properties
            let invalidDescription = new Error("Invalid parser object description");
            for (let parser of parsers) {
                if (!(parser instanceof Object && parser.constructor == Object)) {
                    throw invalidReqBody;
                }

                if ((parser._id !== undefined && typeof parser._id != "string") || typeof parser.type != "string" || !(parser.jobs instanceof Array) || !(parser.lookups instanceof Array)) {
                    throw invalidDescription;
                }

                for (let job of parser.jobs) {
                    if (!(job instanceof Object && job.constructor == Object)) {
                        throw invalidDescription;
                    }
                }

                for (let lookup of parser.lookups) {
                    if (typeof lookup != "string") {
                        throw invalidDescription;
                    }
                }
            }

            const bulkOps = parsers.map(parser => ({
                updateOne: {
                    filter: {
                        $or: [
                            { type: parser.type },
                            { _id: new ObjectId(parser._id) }
                        ]
                    },
                    update: {
                        $set: {
                            type: parser.type,
                            jobs: parser.jobs,
                            lookups: parser.lookups
                        }
                    },
                    upsert: true
                }
            }));

            const result = await collection.bulkWrite(bulkOps);

            res.status(200).json({ message: "Parsers upserted successfully", result });
        } catch(err) {
            res.status(500).json({ message: "Error upserting parsers", error: err.message });
        } finally {
            await client.close();
        }
    }
    else if (req.method === "DELETE") {
        try {
            await client.connect();
            let collection = db.collection("parsers");

            let parsers = req.body;

            let invalidReqBody = new Error("Request body should be an array of parser objects");
            if (!Array.isArray(parsers)) {
                throw invalidReqBody;
            }

            for (let parser of parsers) {
                if (!(parser instanceof Object && parser.constructor == Object)) {
                    throw invalidReqBody;
                }

                if (typeof parser._id != "string") {
                    throw new Error("Invalid parser id(s)");
                }
            }

            const bulkOps = parsers.map(parser => ({
                deleteOne: {
                    filter: { _id: new ObjectId(parser._id) }
                }
            }))
            
            const result = await collection.bulkWrite(bulkOps);

            res.status(200).json({ message: "Parser(s) deleted successfully", result });
        } catch (err) {
            res.status(500).json({ message: "Error deleting parsers", error: err.message });
        } finally {
            await client.close();
        }
    }
};

export default controllers;