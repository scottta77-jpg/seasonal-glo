const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3005;
const ROOT = __dirname;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.framercms': 'application/octet-stream',
};

const REDIRECTS = {
  '/pages/facials': '/facials',
  '/pages/massage': '/massage',
  '/pages/waxing': '/waxing',
  '/pages/contact': '/contact',
  '/collections/eyelash-collection': '/eyelashes',
  '/collections/colourful-lashes': '/eyelashes',
  '/collections/massage': '/massage',
  '/collections/frontpage': '/',
};

function resolveFilePath(urlPath) {
  const safePath = decodeURIComponent(urlPath.split('?')[0]);
  const cleanRel = safePath.replace(/^\/+/, '').replace(/\/+$/, '');

  if (!cleanRel) {
    return path.join(ROOT, 'index.html');
  }

  const exactPath = path.join(ROOT, cleanRel);
  if (!exactPath.startsWith(ROOT)) {
    return null;
  }

  if (fs.existsSync(exactPath) && fs.statSync(exactPath).isFile()) {
    return exactPath;
  }

  const htmlCandidate = `${exactPath}.html`;
  if (fs.existsSync(htmlCandidate) && fs.statSync(htmlCandidate).isFile()) {
    return htmlCandidate;
  }

  const indexCandidate = path.join(exactPath, 'index.html');
  if (fs.existsSync(indexCandidate) && fs.statSync(indexCandidate).isFile()) {
    return indexCandidate;
  }

  return null;
}

const server = http.createServer((req, res) => {
  const rawUrl = req.url || '/';
  const pathname = rawUrl.split('?')[0].replace(/\/+$/, '') || '/';

  if (REDIRECTS[pathname]) {
    res.writeHead(301, { Location: REDIRECTS[pathname] });
    res.end();
    return;
  }

  const filePath = resolveFilePath(rawUrl);
  if (filePath) {
    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    const stat = fs.statSync(filePath);
    res.writeHead(200, {
      'Content-Type': contentType,
      'Content-Length': stat.size,
      'Cache-Control': 'no-cache',
    });
    fs.createReadStream(filePath).pipe(res);
    return;
  }

  const notFoundPath = path.join(ROOT, '404.html');
  if (fs.existsSync(notFoundPath)) {
    res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
    fs.createReadStream(notFoundPath).pipe(res);
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('404 Not Found');
  }
});

server.listen(PORT, () => {
  console.log(`Seasonal Glo' server running at http://localhost:${PORT}`);
});
