let old_cwd = process.cwd();

process.chdir(__dirname);
const config = require("config");
process.chdir(old_cwd);

module.exports = config;