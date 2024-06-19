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

            if (!Array.isArray(parsers)) {
                throw new Error("Request payload must be an array");
            }

            // Validate parser properties
            for (let parser of parsers) {
                if (!(parser instanceof Object && parser.constructor == Object)) {
                    throw new Error("Parser must be an object");
                }

                if (parser._id !== undefined && typeof parser._id != "string") {
                    throw new Error("parser._id must be of type string, if defined");
                }
                if (typeof parser.type != "string") {
                    throw new Error("parser.type must be a string");
                }
                if (!(parser.jobs instanceof Array)) {
                    throw new Error("parser.jobs must be an array");
                }
                if (!(parser.lookups instanceof Array)) {
                    throw new Error("parser.lookups must be an array");
                }

                for (let lookup of parser.lookups) {
                    if (typeof lookup != "string") {
                        throw new Error("Lookup must be a string");
                    }
                }
                
                // Validate jobs
                const validActions = ["set", "tokenize", "flatten", "analyze", "derive", "return"];
                const fromDependants = validActions.slice(1);
                const valuePasser = validActions.slice(1, -1);
                for (let job of parser.jobs) {
                    if (!(job instanceof Object && job.constructor == Object)) {
                        throw new Error("Job must be an object");
                    }

                    if (!validActions.includes(job.action)) {
                        throw new Error(`Invalid action: ${job.action}`);
                    }

                    if (job.check && !(job.check instanceof Object && job.check.constructor == Object)) {
                        throw new Error("Check: conditions must be an object");
                    }
                    
                    if (job.action === "set" && !(job.values instanceof Object && job.values.constructor == Object)) {
                        throw new Error("Set: 'values' property must be an object");
                    }

                    if (fromDependants.includes(job.action)) {
                        if (!job.from) {
                            throw new Error(`${job.action}: requires 'from' property`);
                        }
                        if (typeof job.from != "string"){
                            throw new Error(`${job.action}: 'from' property must be a string`);
                        }
                    }

                    if (job.action === "tokenize" && !Array.isArray(job.delimiters)) {
                        throw new Error("Tokenize: 'delimiters' property must be an array");
                    }

                    if (job.action === "flatten" && job.infinity !== undefined && typeof job.infinity !== "boolean") {
                        throw new Error("Flatten: 'infinity' property must be a boolean, if defined");
                    }

                    if (job.action === "analyze") {
                        if (!Array.isArray(job.properties)) {
                            throw new Error("Analyze: 'properties' property must be an array");
                        }
                        for (let property of job.properties) {
                            if (typeof property != "string") {
                                throw new Error("Analyze: 'properties' must consists only of strings")
                            }
                        }
                    }

                    if (job.action === "derive" && typeof job.property != "string") {
                        throw new Error("Derive: 'property' property must be a string");
                    }

                    if (valuePasser.includes(job.action) && job.into !== undefined && typeof job.into != "string") {
                        throw new Error(`${job.action}: 'from' property must be a string, if defined`);
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