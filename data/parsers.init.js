import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { client, db } from "../lib/models/db.js";
import path from "path"

let data = [];

let __filename = fileURLToPath(import.meta.url);
let __dirname = path.dirname(__filename);

try {
    const jsonFile = readFileSync((__dirname || "." ) + "/parsers.json", "utf8");
    data = JSON.parse(jsonFile);
}
catch (err) {
    console.error("Error reading file:", err);
}

await (async function insertData() {
    try {
        await client.connect();

        // Get the collection
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