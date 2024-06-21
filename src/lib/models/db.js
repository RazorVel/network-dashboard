import config from "../config.cjs";
import { MongoClient } from "mongodb";

const URL = `mongodb://${config.get("database.host")}:${config.get("database.port")}`;
const dbName = config.get("database.name");

let client = new MongoClient(URL);

let db = client.db(dbName);
let activeConnections = 0;
let isConnected = false;

// Patch the connect method
const originalConnect = client.connect.bind(client);
client.connect = async function (...args) {
    if (!isConnected) {
        await originalConnect(...args);
        isConnected = true;
    }
    activeConnections++;
};

// Patch the close method
const originalClose = client.close.bind(client);
client.close = async function (...args) {
    activeConnections--;
    if (activeConnections <= 0 && isConnected) {
        await originalClose(...args);
        isConnected = false;
    }
};

export { client, db };
