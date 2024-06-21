import { client, db } from "../models/db.js";

export const logs = [];

while (true) {
    try {
        console.log("Caching logs...");
        await client.connect();
        const collection = db.collection("logs");

        let data = await (await collection.find({_isActive: true}).sort({_timestamp: -1, _id: -1})).toArray();

        for (let entry of data) {
            logs.push(entry);
        }
    } catch (err) {
        console.error("Error retrieving logs from the server");
        console.error(err);
        continue;
    } finally {
        await client.close();
    }

    break;
}

export default logs;