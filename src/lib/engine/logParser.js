import { fields } from "./fields.js";
import { parsers } from "./parsers.js";

// This is brain -FH
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