import { copyFileSync, mkdirSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');

const src = path.resolve(root, 'node_modules/sql.js/dist/sql-wasm-browser.wasm');
const destDir = path.resolve(root, 'static/sql');

if (!existsSync(destDir)) mkdirSync(destDir, { recursive: true });

if (existsSync(src)) {
  copyFileSync(src, path.resolve(destDir, 'sql-wasm-browser.wasm'));
  console.log('Copied sql-wasm-browser.wasm to static/sql/');
} else {
  console.warn('sql-wasm-browser.wasm not found at', src);
}
