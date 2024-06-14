import config from "../config.cjs"
import { MongoClient } from "mongodb";

const URL = `mongodb://${config.get("database.host")}:${config.get("database.port")}`
export const client = new MongoClient(URL);

let dbName = config.get("database.name");
export const db = client.db(dbName);