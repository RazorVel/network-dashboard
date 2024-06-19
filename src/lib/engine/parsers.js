import { makeGetter, makeSetter } from "../../utils/objectHelper.js";
import { tokenize } from "./tokenizer.js";
import { analyze } from "./analyzer.js";
import { derive } from "./deriver.js";
import { client, db } from "../models/db.js";

export let parsers = {};

export let reloadParsers = async function () {
    try {
        await client.connect();

        const collection = db.collection("parsers");

        let data = await (await collection.find()).toArray();

        parsers = data.reduce((parsers, parser) => {
            parsers[parser.type] = parse.bind(undefined, parser);
            return parsers;
        }, {});

        console.log("reloaded {...parsers}");
    }
    catch (err) {
        console.error('Error:', err);
    } 
    finally {
        // Ensure the client is closed even if an error occurs
        await client.close();
    }
}

export let parse = function (parser, log) {
    let vault = {log, data: {others: []}};
    let get = makeGetter(vault);
    let set = makeSetter(vault);

    for (let job of parser.jobs) {
        let actionResult;

        if (job.check && !checkProperty(job.check)) {
            continue;
        } 

        if (job.action == "set") {
            for (let property of Object.getOwnPropertyNames(job.values || {})) {
                set(property, job.values[property]);
            }
        }
        else if (job.action == "tokenize") {
            actionResult = tokenize(get(job.from), job.delimiters)
        }
        else if (job.action == "flatten") {
            actionResult = get(job.from)?.flat(job.infinity ? Infinity : (job.depth || 1));
        }
        else if (job.action == "analyze") {
            actionResult = analyze(get(job.from), job.properties);
        }
        else if (job.action == "derive") {
            actionResult = derive(get(job.from), job.property);
        }
        else if (job.action == "return") {
            let value = get(job.from);
            if (isBaseObject(value)) {
                value = {others: [], ...value};
            }
            return value;
        }
        else {
            throw new Error("Invalid action:", job.action);
        }

        if (isBaseObject(actionResult) && isBaseObject(get(job.into))) {
            actionResult = {...get(job.into), ...actionResult};
        }

        set(job.into, actionResult);
    }

    return {};

    function checkProperty(conditions) {
        for (let descriptor in Object.getOwnPropertyNames(conditions)) {
            if (get(descriptor) != conditions[descriptor]) {
                return false;
            }
        }
    
        return true;
    }

    function isBaseObject(subject) {
        return subject instanceof Object && subject.constructor == Object;
    }
}

await reloadParsers();