import { MongoClient } from "mongodb";
import { readFileSync } from "fs";
import config from "../lib/config.cjs";
import path from "path"

let data = [];

try {
    const jsonFile = readFileSync((path.dirname(import.meta.url).substring(7) || "./" ) + "/parsers.json", "utf8");
    data = JSON.parse(jsonFile);
}
catch (err) {
    console.error("Error reading file:", err);
}

await (async function insertData() {
    const url = `mongodb://${config.get("database.host")}:${config.get("database.port")}`;
    const dbName = config.get("database.name");
    const client = new MongoClient(url);

    try {
        // Connect to the MongoDB server
        await client.connect();

        // Get the database and collection
        const db = client.db(dbName);
        const collection = db.collection('parsers');

        // Prepare bulk operations
        const bulkOps = data.map(entry => ({
            updateOne: {
                filter: { type: entry.type },
                update: { $set: entry },
                upsert: true
            }
        }));

        // Execute bulk operations
        await collection.bulkWrite(bulkOps);
        console.log('Populated [...parsers]');
    } catch (err) {
        console.error('Error:', err);
    } finally {
        // Ensure the client is closed even if an error occurs
        await client.close();
    }
})(); 