import { fields } from "./fields.js";
import { parseSyslog, parseApache, parseNginx, parseFTP, parseDHCP, parseDNS, parseMySQL, parseSSH } from "./parsers.js";

class LogParser {
    constructor() {
        this.parsers = {
            syslog: parseSyslog.bind(this),
            apache: parseApache.bind(this),
            nginx: parseNginx.bind(this),
            ftp: parseFTP.bind(this),
            dhcp: parseDHCP.bind(this),
            dns: parseDNS.bind(this),
            mysql: parseMySQL.bind(this),
            ssh: parseSSH.bind(this)
        };
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