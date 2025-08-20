const fs = require("node:fs");

/**
 * Load environment variables from a file into process.env
 * @param {string} [path=".env.local.email"] - Path to the environment file
 * @returns {void} Modifies process.env directly
 */
function loadEnv(path = ".env.local.email") {
  if (!fs.existsSync(path)) return;
  const lines = fs.readFileSync(path, "utf8").split(/\r?\n/);
  for (const l of lines) {
    const m = /^([\w.-]+)=(.*)$/.exec(l.trim());
    if (m) process.env[m[1]] = m[2];
  }
}

module.exports = { loadEnv };