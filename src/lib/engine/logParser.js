import { fields, reloadFields } from "./fields.js";
import { parsers, parse, reloadParsers } from "./parsers.js";

class LogParser {
    constructor() {
        this.parsers = parsers;
    }

    fields = fields;

    parse(logType, log) {
        if (this.parsers[logType]) {
            return this.parsers[logType](log);
        }
        else {
            throw new Error(`Unknown log type: ${logType}`);
        }
    }
}

export default LogParser;