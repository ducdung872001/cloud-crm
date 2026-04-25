// Scans routes.tsx, App.tsx, layout.tsx for imports of `pages/*` or `@/pages/*`
// and creates stub .tsx files for any path that doesn't exist on disk.
// Temporary dev helper while legacy CRM routes are being ported to MentorHub.
const fs = require("fs");
const path = require("path");

const projectRoot = path.resolve(__dirname, "..");
const srcRoot = path.resolve(projectRoot, "src");
const exts = [".tsx", ".ts", ".jsx", ".js", ".json"];

const filesToScan = [
  path.join(srcRoot, "configs", "routes.tsx"),
  path.join(srcRoot, "App.tsx"),
  path.join(srcRoot, "pages", "layout.tsx"),
];

const importRegex = /(?:from|import\()\s*["']([^"']+)["']/g;

function resolveToFile(rawId) {
  let relative = null;
  if (rawId.startsWith("@/pages/")) relative = rawId.slice(2);
  else if (rawId.startsWith("pages/")) relative = rawId;
  else if (rawId.startsWith("./") || rawId.startsWith("../")) return null;
  else return null;

  const abs = path.resolve(srcRoot, relative);
  for (const ext of exts) if (fs.existsSync(abs + ext)) return { path: abs + ext, exists: true };
  for (const ext of exts) {
    const idx = path.join(abs, "index" + ext);
    if (fs.existsSync(idx)) return { path: idx, exists: true };
  }
  return { path: abs + ".tsx", exists: false };
}

function componentNameFromPath(rawId) {
  const last = rawId.split("/").pop() || "Stub";
  return last.replace(/[^A-Za-z0-9_]/g, "") || "Stub";
}

function stubSource(rawId) {
  const name = componentNameFromPath(rawId);
  return `import React from "react";

export default function ${name}(_props: Record<string, unknown>) {
  return (
    <div style={{ padding: 24, fontFamily: "monospace", color: "#b45309", background: "#fffbeb", borderRadius: 8, margin: 16 }}>
      [stub] page not ported: ${rawId}
    </div>
  );
}
`;
}

const created = [];
const alreadyExist = [];
const seen = new Set();

for (const file of filesToScan) {
  if (!fs.existsSync(file)) continue;
  const content = fs.readFileSync(file, "utf8");
  let m;
  while ((m = importRegex.exec(content))) {
    const rawId = m[1];
    if (!rawId.startsWith("pages/") && !rawId.startsWith("@/pages/")) continue;
    if (seen.has(rawId)) continue;
    seen.add(rawId);
    const resolved = resolveToFile(rawId);
    if (!resolved) continue;
    if (resolved.exists) {
      alreadyExist.push(rawId);
      continue;
    }
    fs.mkdirSync(path.dirname(resolved.path), { recursive: true });
    fs.writeFileSync(resolved.path, stubSource(rawId));
    created.push({ rawId, file: path.relative(projectRoot, resolved.path) });
  }
}

console.log(`Scanned ${filesToScan.length} files.`);
console.log(`Already existed: ${alreadyExist.length}`);
console.log(`Created ${created.length} stub(s):`);
for (const c of created) console.log(`  + ${c.rawId}  →  ${c.file}`);
