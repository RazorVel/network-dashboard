import LogParser from "../lib/engine/logParser.js";

export default function (app) {
    try {
        // Example Usage
        const parser = new LogParser();
        
        // Test cases
        const logs = {
            syslog: '<34>May 26 11:28:00 mymachine su[12345]: \'su root\' failed for lonvick on /dev/pts/8',
            apache_access: '127.0.0.1 - - [26/May/2024:11:28:00 +0000] "GET /index.html HTTP/1.1" 200 1043',
            nginx_access: '127.0.0.1 - - [26/May/2024:11:28:00 +0000] "GET /index.html HTTP/1.1" 200 1043 "http://example.com" "Mozilla/5.0"',
            ftp: 'May 26 11:28:00 127.0.0.1 user1 RETR file.txt',
            dhcp: 'May 26 11:28:00 127.0.0.1 DHCPREQUEST message',
            dns: 'May 26 11:28:00 127.0.0.1 QUERY example.com',
            mysql: '2024-05-26 11:28:00 12345 Query SELECT * FROM users',
            ssh: 'May 26 11:28:00 mymachine sshd[12345]: Accepted password for user from 127.0.0.1 port 22 ssh2'
        };
        
        for (let type in logs) {
            console.log(`Parsing ${type} log:`);
        
            try {
                const parsedLog = parser.parse(type, logs[type]);
                console.log(JSON.stringify(parsedLog, null, 2));
            }
            catch (err){
                console.error("Error:", err);
            }
        }
    }
    catch (err) {
        app.emit("test-error", (err) => {
            console.error(err);
        })
    }
    finally {
        app.emit("test-complete", () => {
            console.log("test completed");
        })
    }
}