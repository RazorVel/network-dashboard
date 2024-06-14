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
    
        if (option === "raw") {
            try {
                await client.connect();
    
                let collection = db.collection("parsers");
                let data = await (await collection.find()).toArray();
    
                res.setHeader("Content-Type", "application/json");
                res.send(JSON.stringify(data));
            } catch (err) {
                res.status(500).send({ message: "Error reading JSON file", error: err.message });
            } finally {
                await client.close();
            }
        } else {
            res.status(400).send("Invalid option");
        }
    }
    else if (req.method === "POST") {
        try {
            await client.connect();
            let collection = db.collection("parsers");

            const parsers = req.body;

            if (!Array.isArray(parsers)) {
                throw new Error("Request body should be an array of parser objects");
            }

            // Validate parser properties
            let invalidDescription = new Error("Invalid parser object description");
            for (let parser of parsers) {
                if (typeof parser.type != "string" || !(parser.jobs instanceof Array) || !(parser.lookups instanceof Array)) {
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
};

export default controllers;