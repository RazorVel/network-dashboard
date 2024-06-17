import path from "path";
import { fileURLToPath } from "url";
import { client, db } from "../models/db.js";
import { ObjectId } from "mongodb";
import { mergeFields, fieldsData, fields as fieldsMap, reloadFields } from "../engine/fields.js";

let __filename = fileURLToPath(import.meta.url);
let __dirname = path.dirname(__filename);

const controllers = {};

controllers.field = async function (req, res, next) {
    if (req.method === "GET") {
        const { option } = req.query;
    
        try {
            await client.connect();

            let collection = db.collection("fields");
            let data = await (await collection.find()).toArray();

            // Upon stringified, regex pattern will be empty object {}
            for (let field of data) {
                field.pattern = field.pattern.source;
            }

            if (option === "raw"){
                res.setHeader("Content-Type", "application/json").status(200).send(JSON.stringify(data));
            }
            else {
                res.status(200).send({ message: "Fields retrieved!", data })
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
            let collection = db.collection("fields");

            let fields = req.body;

            console.log(fields);

            let invalidReqBody = new Error("Request body should be an array of field objects");
            if (!Array.isArray(fields)) {
                throw invalidReqBody;
            }

            // Validate field properties
            let invalidDescription = new Error("Invalid field object description");
            for (let field of fields) {
                if (!(field instanceof Object && field.constructor == Object)) {
                    throw invalidReqBody;
                }

                if ((field._id !== undefined && typeof field._id != "string") || typeof field.name != "string" || !(field.derivatives instanceof Array) || typeof field.pattern != "string") {
                    throw invalidDescription;
                }

                for (let derivative of field.derivatives) {
                    if (typeof derivative != "string") {
                        throw invalidDescription;
                    }

                    if (field.name === derivative) {
                        throw new Error("Cannot use the same field name as derivative");
                    }

                    if (!fieldsData.some((data) => data.name === derivative)) {
                        throw new Error(`Derivative ${derivative} does not exist`);
                    }
                }
            }

            
            // if merge, then process macros
            fields = fields.map(field => {
                if (field.derivatives.length) {
                    return {
                        name: field.name,
                        ...mergeFields(fieldsMap, field.pattern, field.derivatives)
                    }
                }

                return field;
            });

            let bulkOps = [];
            
            // remove all fields that depends on field.name, if exist
            let addedForDeletions = [];
            for (let field of fields) {
                let affectedStack = fieldsData.filter((data) => data.name == field.name || data._id == field._id);

                while (affectedStack.length) {
                    let affected = affectedStack.shift();

                    bulkOps.unshift({
                        deleteOne: {
                            filter: {
                                _id: affected._id
                            }
                        }
                    });
                    
                    addedForDeletions.push(affected);

                    fieldsData
                        .filter((data) => !addedForDeletions.includes(data) && data.derivatives.includes(affected.name))
                        .forEach((data) => {affectedStack.push(data)});
                }
            }


            bulkOps = [...bulkOps, ...fields.map(field => ({
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
            }))];

            const result = await collection.bulkWrite(bulkOps);

            res.status(200).json({ message: "Fields upserted successfully", result });
        } catch(err) {
            res.status(500).json({ message: "Error upserting fields", error: err.message });
        } finally {
            await reloadFields()
            await client.close();
        }
    }
    else if (req.method === "DELETE") {
        try {
            await client.connect();
            let collection = db.collection("fields");

            let fields = req.body;

            let invalidReqBody = new Error("Request body should be an array of field objects");
            if (!Array.isArray(fields)) {
                throw invalidReqBody;
            }

            for (let field of fields) {
                if (!(field instanceof Object && field.constructor == Object)) {
                    throw invalidReqBody;
                }

                if (typeof field._id != "string") {
                    throw new Error("Invalid field id(s)");
                }
            }

            let bulkOps = [];

            // remove all fields that depends on deleted.name, if exist
            let addedForDeletions = [];
            for (let field of fields) {
                let affectedStack = fieldsData.filter((data) => data.name == field.name || data._id == field._id);

                while (affectedStack.length) {
                    let affected = affectedStack.shift();

                    bulkOps.unshift({
                        deleteOne: {
                            filter: {
                                _id: affected._id
                            }
                        }
                    });
                    
                    addedForDeletions.push(affected);

                    fieldsData
                        .filter((data) => !addedForDeletions.includes(data) && data.derivatives.includes(affected.name))
                        .forEach((data) => {affectedStack.push(data)});
                }
            }

            bulkOps = [...bulkOps, ...fields.map(field => ({
                deleteOne: {
                    filter: { _id: new ObjectId(field._id) }
                }
            }))];
            
            const result = await collection.bulkWrite(bulkOps);

            res.status(200).json({ message: "Field(s) deleted successfully", result });
        } catch (err) {
            res.status(500).json({ message: "Error deleting fields", error: err.message });
        } finally {
            await reloadFields();
            await client.close();
        }
    }
};

export default controllers;