#!/usr/bin/env node
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIRS = [
  path.join(__dirname, "screenshots"),
  path.join(__dirname, "reports"),
];
const MAX_AGE_DAYS = 15;
const now = Date.now();
let deleted = 0;

for (const dir of DIRS) {
  if (!fs.existsSync(dir)) continue;
  for (const file of fs.readdirSync(dir)) {
    const fp = path.join(dir, file);
    const stat = fs.statSync(fp);
    const ageDays = (now - stat.mtimeMs) / 86400000;
    if (ageDays > MAX_AGE_DAYS) {
      fs.unlinkSync(fp);
      console.log(`Deleted (${Math.round(ageDays)}d old): ${fp}`);
      deleted++;
    }
  }
}
console.log(deleted ? `Cleaned ${deleted} files` : "No old files to clean");
