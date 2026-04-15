#!/bin/bash
# Render all .mmd source files to PNG using mermaid-cli (mmdc)
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
SRC_DIR="$SCRIPT_DIR/sources"
OUT_DIR="$SCRIPT_DIR"
TOOL_DIR="$SCRIPT_DIR/../../userguides/tooling"

cd "$TOOL_DIR" || exit 1

shopt -s nullglob
for mmd in "$SRC_DIR"/*.mmd; do
  name=$(basename "$mmd" .mmd)
  out="$OUT_DIR/$name.png"
  echo "[render] $name.png"
  npx mmdc -i "$mmd" -o "$out" -w 1600 -b white --quiet 2>&1 || echo "  ❌ Failed: $name"
done
echo "Done."
