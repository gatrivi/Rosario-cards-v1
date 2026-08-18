const fs = require('fs');
const path = require('path');

const SRC_ROOT = path.resolve(__dirname, '..');
const SELF = path.basename(__filename);
const CODE_EXTENSIONS = new Set(['.js', '.jsx', '.ts', '.tsx']);

function listCodeFiles(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) return listCodeFiles(fullPath);
    if (!CODE_EXTENSIONS.has(path.extname(entry.name))) return [];
    if (entry.name === SELF) return [];
    return [fullPath];
  });
}

function findForbiddenDialogCalls(source) {
  const matches = [];
  const lines = source.split(/\r?\n/);
  const nativeWindowCall = /\bwindow\.(alert|confirm|prompt)\s*\(/;
  const bareCall = /(^|[^\w.])(alert|confirm|prompt)\s*\(/;

  lines.forEach((line, index) => {
    if (nativeWindowCall.test(line) || bareCall.test(line)) {
      matches.push({ line: index + 1, text: line.trim() });
    }
  });

  return matches;
}

test('src never uses native browser alert/confirm/prompt dialogs', () => {
  const violations = [];

  listCodeFiles(SRC_ROOT).forEach((file) => {
    const source = fs.readFileSync(file, 'utf8');
    findForbiddenDialogCalls(source).forEach((match) => {
      violations.push(
        `${path.relative(SRC_ROOT, file)}:${match.line} ${match.text}`
      );
    });
  });

  expect(violations).toEqual([]);
});
