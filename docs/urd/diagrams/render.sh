#!/bin/bash
# Render all .mmd source files to PNG using mermaid-cli (mmdc)
set -e
SRC_DIR="$(dirname "$0")/sources"
OUT_DIR="$(dirname "$0")"
TOOL_DIR="$(dirname "$0")/../../userguides/tooling"

cd "$TOOL_DIR"

for mmd in "$SRC_DIR"/*.mmd; do
  name=$(basename "$mmd" .mmd)
  out="$OUT_DIR/$name.png"
  echo "[render] $name.png"
  npx mmdc -i "$mmd" -o "$out" -w 1600 -b white --quiet 2>&1 || echo "  ❌ Failed: $name"
done
echo "Done."
