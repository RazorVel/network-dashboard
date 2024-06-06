import { tokenize } from "./tokenizer.js";
import { analyze } from "./analyzer.js";
import { derive } from "./deriver.js";

export function parseSyslog(log) {
    let data = {};

    data = {...data, ...derive(log, "syslog")};

    return data;
}

export function parseApache(log) {
    let tokens = tokenize(log, [
        [],
        [" ", ["[", "]"], ["\"", "\""]]
    ]).flat(Infinity);

    let data = analyze(tokens, ["ip_address", "remote_logname", "remote_user", "utc_timestamp", "apache_http_header", "status", "byte"]);

    data = {...data, ...derive(data.apache_http_header, "apache_http_header")};

    return data;
}

export function parseNginx(log) {
    let tokens = tokenize(log, [
        [],
        [" ", ["[", "]"], ["\"", "\""]]
    ]).flat(Infinity);

    let data = analyze(tokens, ["ip_address", "remote_logname", "remote_user", "utc_timestamp", "apache_http_header", "status", "byte", "http_url", "user_agent"]);

    data = {...data, ...derive(data.apache_http_header, "apache_http_header")};

    return data;
}

export function parseFTP(log) {
    let tokens = tokenize(log, [
        [],
        [" "]
    ]).flat(Infinity);

    let data = analyze(tokens, ["month_alphabetic_short", "day", "time", "ip_address", "username", "ftp_command"]);

    if (data.ftp_command == "RETR") {
        data = {...data, ...analyze(data.others, ["pathname"])};    
    }

    return data;
}

export function parseDHCP(log) {
    let tokens = tokenize(log, [
        [],
        [" "]
    ]).flat(Infinity);

    let data = analyze(tokens, ["month_alphabetic_short", "day", "time", "ip_address", "dhcp_event_type"]);

    if (data.dhcp_event_type == "DHCPREQUEST") {
        data = {...data, ...analyze(data.others, ["message/ "])};
    }

    return data;
}

export function parseDNS(log) {
    let tokens = tokenize(log, [
        [],
        [" "]
    ]).flat(Infinity);

    let data = analyze(tokens, ["month_alphabetic_short", "day", "time", "ip_address", "dns_query_type"]);

    if (data.dns_query_type == "QUERY") {
        data = {...data, ...analyze(data.others, ["domain_name"])};
    }

    return data;
}

export function parseMySQL(log) {
    let tokens = tokenize(log, [
        [],
        [" "]
    ]);

    let data = analyze(tokens, ["iso8601_datepart", "iso8601_timepart", "thread_id", "mysql_event_type"]);

    if (data.mysql_event_type == "Query") {
        data = {...data, ...analyze(data.others, ["sql_query/ "])};
    }

    return data;
}

export function parseSSH(log) {
    let data = {};

    data = {...data, ...derive(log, "ssh_log")};

    return data;
}