import fs from "node:fs";

export function loadEnv(path = ".env.local.email") {
  if (!fs.existsSync(path)) return;
  const lines = fs.readFileSync(path, "utf8").split(/\r?\n/);
  for (const l of lines) {
    const m = /^([\w.-]+)=(.*)$/.exec(l.trim());
    if (m) process.env[m[1]] = m[2];
  }
}