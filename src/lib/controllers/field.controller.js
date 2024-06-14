import path from "path";
import { fileURLToPath } from "url";
import { client, db } from "../models/db.js";
import { ObjectId } from "mongodb";

let __filename = fileURLToPath(import.meta.url);
let __dirname = path.dirname(__filename);

const controllers = {};

controllers.field = async function (req, res, next) {
    if (req.method === "GET") {
        const { option } = req.query;
    
        if (option === "raw") {
            try {
                await client.connect();
    
                let collection = db.collection("fields");
                let data = await (await collection.find()).toArray();
    
                // Upon stringified, regex pattern will be empty object {}
                for (let field of data) {
                    field.pattern = field.pattern.source;
                }
    
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
            let collection = db.collection("fields");

            const fields = req.body;

            if (!Array.isArray(fields)) {
                throw new Error("Request body should be an array of field objects");
            }

            // Validate field properties
            let invalidDescription = new Error("Invalid field object description");
            for (let field of fields) {
                if (typeof field.name != "string" || !(field.derivatives instanceof Array) || typeof field.pattern != "string") {
                    throw invalidDescription;
                }

                for (let derivative of field.derivatives) {
                    if (typeof derivative != "string") {
                        throw invalidDescription;
                    }
                }

                field.pattern = new RegExp(field.pattern);
            }

            const bulkOps = fields.map(field => ({
                updateOne: {
                    filter: {
                        $or: [
                            { name: field.name },
                            { _id: new ObjectId(field._id) }
                        ]
                    },
                    update: {
                        $set: {
                            name: field.name,
                            derivatives: field.derivatives,
                            pattern: new RegExp(field.pattern)
                        }
                    },
                    upsert: true
                }
            }));

            const result = await collection.bulkWrite(bulkOps);

            res.status(200).json({ message: "Fields upserted successfully", result });
        } catch(err) {
            res.status(500).json({ message: "Error upserting fields", error: err.message });
        } finally {
            await client.close();
        }
    }
};

export default controllers;