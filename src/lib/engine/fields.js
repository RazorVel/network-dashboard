import config from "../config.cjs";
import { MongoClient } from "mongodb";

export let mergeFields = function (patterns, format, derivatives) {
    let toNonCapturing = (pattern) => pattern.replace(/\\.|(\((?!\?))/g, (match, p1) => {
        // If it's an escaped character, return it as is
        if (match.startsWith("\\")) {
            return match;
        }
        // Otherwise, replace the capturing group with non-capturing group
        return p1 ? '(?:' : match;
    });
    
    let pattern = new RegExp(format.replace(/{(\d+)}/g, (match, number) => patterns[derivatives[number]] ? `(${toNonCapturing(patterns[derivatives[number]].pattern.source)})` : match ));
    
    return {pattern, derivatives};
};

export let fields = {};

export let reloadFields = async function () {
    const url = `mongodb://${config.get("database.host")}:${config.get("database.port")}`;
    const dbName = config.get("database.name");
    const client = new MongoClient(url);

    try {
        // Connect to the MongoDB server
        await client.connect();

        const db = client.db(dbName);
        const collection = db.collection("fields");

        fields = await (await collection.find()).toArray();
        fields = fields.reduce((fields, field) => {
            fields[field.name] = {pattern: field.pattern, derivatives: field.derivatives};
            return fields;
        }, {});

        console.log("reloaded {...fields}");
    }
    catch (err) {
        console.error(err);
    } 
    finally {
        // Ensure the client is closed even if an error occurs
        await client.close();
    }
}

await reloadFields();