// Phục vụ bản build (tests/.site-build) dưới /Start_up/ để giả lập GitHub Pages.
// Dùng bởi playwright.config.mjs (project "subpath-github-pages").
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { join, extname, normalize } from 'node:path';

const ROOT = join(process.cwd(), 'tests', '.site-build');
const PREFIX = '/Start_up/';
const PORT = Number(process.env.SUBPATH_PORT || 1314);
const TYPES = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.json': 'application/json',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp',
  '.gif': 'image/gif', '.ico': 'image/x-icon', '.woff': 'font/woff', '.woff2': 'font/woff2', '.ttf': 'font/ttf',
  '.xml': 'application/xml', '.txt': 'text/plain', '.ics': 'text/calendar',
};

createServer(async (req, res) => {
  const url = decodeURIComponent((req.url || '/').split('?')[0]);
  if (!url.startsWith(PREFIX)) { res.writeHead(404).end('Not found (outside /Start_up/)'); return; }
  let file = normalize(join(ROOT, url.slice(PREFIX.length)));
  if (!file.startsWith(ROOT)) { res.writeHead(403).end(); return; }
  try {
    if ((await stat(file)).isDirectory()) file = join(file, 'index.html');
    const body = await readFile(file);
    res.writeHead(200, { 'Content-Type': TYPES[extname(file).toLowerCase()] || 'application/octet-stream' }).end(body);
  } catch {
    res.writeHead(404).end('Not found');
  }
}).listen(PORT, () => console.log(`[subpath] http://localhost:${PORT}${PREFIX}`));
