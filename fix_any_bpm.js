const fs = require('fs');
const path = require('path');

function findFiles(dir, exts) {
  let results = [];
  const items = fs.readdirSync(dir, { withFileTypes: true });
  for (const item of items) {
    const full = path.join(dir, item.name);
    if (item.isDirectory()) {
      results = results.concat(findFiles(full, exts));
    } else if (exts.some(e => item.name.endsWith(e))) {
      results.push(full);
    }
  }
  return results;
}

const files = findFiles('src/pages/BPM', ['.ts', '.tsx']);
let totalReplacements = 0;

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  const original = content;

  // Process line by line to skip comments
  const lines = content.split('\n');
  const newLines = lines.map(line => {
    const trimmed = line.trim();
    // Skip comment lines
    if (trimmed.startsWith('//') || trimmed.startsWith('*') || trimmed.startsWith('/*')) {
      return line;
    }

    // Handle inline comments - only replace before //
    let commentIdx = -1;
    let inString = false;
    let stringChar = '';
    for (let i = 0; i < line.length - 1; i++) {
      const ch = line[i];
      if (inString) {
        if (ch === stringChar && line[i-1] !== '\\') inString = false;
      } else {
        if (ch === '"' || ch === "'" || ch === '`') {
          inString = true;
          stringChar = ch;
        } else if (ch === '/' && line[i+1] === '/') {
          commentIdx = i;
          break;
        }
      }
    }

    let codePart = commentIdx >= 0 ? line.substring(0, commentIdx) : line;
    const commentPart = commentIdx >= 0 ? line.substring(commentIdx) : '';

    // Apply replacements on code part only
    // 1. useState<any[]>
    codePart = codePart.replace(/useState<any\[\]>/g, 'useState<Record<string, unknown>[]>');
    // 2. useState<any>
    codePart = codePart.replace(/useState<any>/g, 'useState<Record<string, unknown>>');
    // 3. useRef<any>
    codePart = codePart.replace(/useRef<any>/g, 'useRef<Record<string, unknown>>');
    // 4. Record<string, any>
    codePart = codePart.replace(/Record<string, any>/g, 'Record<string, unknown>');
    // 5. ] as any))
    codePart = codePart.replace(/\] as any\)\)/g, '] as Record<string, unknown>[])');
    // 6. } as any)
    codePart = codePart.replace(/\} as any\)/g, '} as Record<string, unknown>)');
    // 7. as any)
    codePart = codePart.replace(/as any\)/g, 'as Record<string, unknown>)');
    // 8. as any,
    codePart = codePart.replace(/as any,/g, 'as Record<string, unknown>,');
    // 9. as any;
    codePart = codePart.replace(/as any;/g, 'as Record<string, unknown>;');
    // 10. <any> (generic)
    codePart = codePart.replace(/<any>/g, '<Record<string, unknown>>');
    // Fix double-nesting from useState/useRef already replaced
    codePart = codePart.replace(/useState<Record<string, unknown><Record<string, unknown>>>/g, 'useState<Record<string, unknown>>');
    codePart = codePart.replace(/useRef<Record<string, unknown><Record<string, unknown>>>/g, 'useRef<Record<string, unknown>>');
    // 11. : any[]
    codePart = codePart.replace(/: any\[\]/g, ': Record<string, unknown>[]');
    codePart = codePart.replace(/:any\[\]/g, ': Record<string, unknown>[]');
    // 12. : any;
    codePart = codePart.replace(/: any;/g, ': Record<string, unknown>;');
    // 13. : any)
    codePart = codePart.replace(/: any\)/g, ': Record<string, unknown>)');
    // 14. : any,
    codePart = codePart.replace(/: any,/g, ': Record<string, unknown>,');
    // 15. : any =
    codePart = codePart.replace(/: any =/g, ': Record<string, unknown> =');
    // 16. : any {
    codePart = codePart.replace(/: any \{/g, ': Record<string, unknown> {');
    // 17. : any |
    codePart = codePart.replace(/: any \|/g, ': Record<string, unknown> |');
    // 18. : any) => (already handled by : any) above, but check => pattern)
    // 19. as any at end of code
    codePart = codePart.replace(/as any\s*$/g, 'as Record<string, unknown>');
    // 20. as any[
    codePart = codePart.replace(/as any\[/g, 'as Record<string, unknown>[');
    // 21. as any.
    codePart = codePart.replace(/as any\./g, 'as Record<string, unknown>.');
    // 22. : any at end of code part (for things like `prop: any`)
    codePart = codePart.replace(/: any\s*$/g, ': Record<string, unknown>');
    // 23. (props: any) pattern - already handled by : any)
    // 24. any[] in middle of expression
    codePart = codePart.replace(/\bany\[\]/g, 'Record<string, unknown>[]');

    return codePart + commentPart;
  });

  content = newLines.join('\n');

  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
    const origAny = (original.match(/\bany\b/g) || []).length;
    const newAny = (content.match(/\bany\b/g) || []).length;
    const diff = origAny - newAny;
    if (diff > 0) {
      totalReplacements += diff;
      console.log(`${file}: ${diff} replacements`);
    }
  }
}

console.log('\nTotal any replacements: ' + totalReplacements);

// Count remaining
let remaining = 0;
const remainingFiles = [];
for (const file of files) {
  const content = fs.readFileSync(file, 'utf8');
  const lines = content.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();
    if (trimmed.startsWith('//') || trimmed.startsWith('*') || trimmed.startsWith('/*')) continue;
    if (/:\s*any\b|<any\b|any\[\]|as any\b/.test(line)) {
      remaining++;
      if (!remainingFiles.includes(file)) remainingFiles.push(file);
    }
  }
}
console.log('Remaining any type instances (approx): ' + remaining);
if (remainingFiles.length > 0) {
  console.log('Files with remaining any:');
  remainingFiles.forEach(f => console.log('  ' + f));
}
