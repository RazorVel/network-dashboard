export function fieldBuilder() {
    // The logic for building patterns and merging fields
    let patterns = {};

    const mergeFields = function (format, derivatives) {
        let toNonCapturing = (pattern) => pattern.replace(/\\.|(\((?!\?))/g, (match, p1) => {
            // If it's an escaped character, return it as is
            if (match.startsWith("\\")) {
                return match;
            }
            // Otherwise, replace the capturing group with non-capturing group
            return p1 ? '(?:' : match;
        });

        let pattern = new RegExp(format.replace(/{(\d+)}/g, (match, number) => patterns[derivatives[number]] ? `(${toNonCapturing(patterns[derivatives[number]].pattern.source)})` : match ));
        
        return {pattern, derivatives};
    };

    // Define patterns here...
    //level 1
    patterns.number = {pattern: /\d+/, derivatives: []};
    patterns.version = {pattern: /(?![.])\d+(?<![.])/, derivatives: []};
    patterns.month_alphabetic_short = {pattern: /Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec/, derivatives: []};
    patterns.http_request_protocol = {pattern: /GET|POST|PUT|DELETE|PATCH|HEAD|OPTIONS|CONNECT|TRACE/, derivatives: []};
    patterns.url_pathname = {pattern: /\/?(?:[^\/\s]+\/?)+(?<!\/)/, derivatives: []};
    patterns.http_version = {pattern: /HTTP\/[0-9]\.[0-9](?:\.[0-9])?/, derivatives: []};
    patterns.day = {pattern: /[0-2]\d|3[0-1]/, derivatives: []};
    patterns.month = {pattern: /0\d|1[0-2]/, derivatives: []};
    patterns.year_short = {pattern: /\d{2}/, derivatives: []};
    patterns.year = {pattern: /\d{4}/, derivatives: []};
    patterns.hour = {pattern: /[0-1]\d|2[0-4]/, derivatives: []};
    patterns.minute = {pattern: /[0-5]\d/, derivatives: []};
    patterns.second = {pattern: /[0-5]\d/, derivatives: []};
    patterns.utc_offset = {pattern: /[+-](?:\d{2}:?(?:\d{2})?)?/, derivatives: []};
    patterns.hostname = {pattern: /(?![.-])[\w.-]*(?<![.-])/, derivatives: []};
    patterns.application = {pattern: /\w+/, derivatives: []};
    patterns.process_id = {pattern: /\d+/, derivatives: []};
    patterns.message = {pattern: /.+/, derivatives: []};
    patterns.ip_address = {pattern: /(?:(?:[0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])\.){3}(?:[0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])/, derivatives: []};
    patterns.status = {pattern: /\d{3}/, derivatives: []};
    patterns.byte = {pattern: /\d+/, derivatives: []};
    patterns.username = {pattern: /[a-z_](?:[a-z0-9_-]{0,31}|[a-z0-9_-]{0,30}\$)/, derivatives: []};
    patterns.user_agent = {pattern: /(?!\s)(?:(?<![\d\w.\/])(?:(?:[\w\d,]+\/(?!\.)[\d\.]+\+?(?<!\.))|(?:\((?:[\d\w\s\.\/-](?:;\s)?)+\))|(?:))\s?)+(?<!\s)/, derivatives: []};
    patterns.dhcp_event_type = {pattern: /DHCP[A-Z]+/, derivatives: []};
    patterns.domain_name = {pattern: /(?:(?:www\.)?|(?:[a-zA-Z0-9-]+\.)+)?[a-zA-Z0-9-]{2,}(?:\.[a-zA-Z]{2,}){1,2}/, derivatives: []};
    patterns.all_capital_letters = {pattern: /[A-Z]+/, derivatives: []};
    patterns.initial_capital_letters = {pattern: /[A-Z][a-z]*/, derivatives: []};

    //aliases
    patterns.priority = patterns.number;
    patterns.remote_logname = patterns.username;
    patterns.remote_user = patterns.username; 
    patterns.pathname = patterns.url_pathname;
    patterns.dns_query_type = patterns.all_capital_letters;
    patterns.ftp_command = patterns.all_capital_letters;
    patterns.sql_query = patterns.message;
    patterns.thread_id = patterns.number;
    patterns.mysql_event_type = patterns.initial_capital_letters;

    //level 2
    patterns.time = mergeFields("{0}:{1}:{2}", ["hour", "minute", "second"]);
    patterns.process = mergeFields("{0}\\[{1}\\]", ["application", "process_id"]);
    patterns.apache_http_header = mergeFields("{0} {1} {2}", ["http_request_protocol", "url_pathname", "http_version"]);
    patterns.utc_timestamp = mergeFields("{0}/{1}/{2}:{3}:{4}:{5} {6}", ["day", "month_alphabetic_short", "year", "hour", "minute", "second", "utc_offset"]);
    patterns.http_url = mergeFields("(?:https?:\\/\\/)?{0}(?:\\/[a-zA-Z0-9\\.-]{2,})*", ["domain_name"]);
    patterns.dhcp_event_type = mergeFields("DHCP{0}", ["all_capital_event_type"]);
    patterns.iso8601_datepart = mergeFields("{0}-{1}-{2}", ["year", "month", "day"]);
    patterns.iso8601_timepart = mergeFields("{0}:{1}:{2}", ["hour", "minute", "second"]);

    //level 3
    patterns.datetime = mergeFields("{0} {1} {2}", ["month_alphabetic_short", "day", "time"]);
    patterns.application_log = mergeFields("{0}: {1}", ["process", "message"]);
    patterns.iso8601_datetime = mergeFields("{0} {1}", ["iso8601_datepart", "iso8601_timepart"]); 

    //level 4
    patterns.syslog = mergeFields("<{0}>{1} {2} {3}", ["priority", "datetime", "hostname", "application_log"]);
    patterns.ssh_log = mergeFields("{0} {1} {2}", ["datetime", "hostname", "application_log"]);

    return patterns;
}