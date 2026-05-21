// Minimal zero-dependency static file server.
// Run: node server.js     -> serves on http://localhost:3000
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { join, extname, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const PORT = Number(process.env.PORT) || 3000;
const ROOT = resolve(fileURLToPath(new URL(".", import.meta.url)));

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css":  "text/css; charset=utf-8",
  ".js":   "application/javascript; charset=utf-8",
  ".mjs":  "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg":  "image/svg+xml",
  ".png":  "image/png",
  ".jpg":  "image/jpeg",
  ".ico":  "image/x-icon",
  ".woff2":"font/woff2",
};

function safeJoin(root, urlPath) {
  const decoded = decodeURIComponent(urlPath.split("?")[0]);
  const target = resolve(join(root, decoded));
  if (!target.startsWith(root + sep) && target !== root) return null;
  return target;
}

const server = createServer(async (req, res) => {
  try {
    let urlPath = req.url || "/";
    if (urlPath === "/") urlPath = "/index.html";
    const filePath = safeJoin(ROOT, urlPath);
    if (!filePath) { res.writeHead(403); return res.end("Forbidden"); }

    let st;
    try { st = await stat(filePath); } catch { res.writeHead(404); return res.end("Not Found"); }
    if (st.isDirectory()) {
      return res.writeHead(302, { Location: urlPath.replace(/\/?$/, "/") + "index.html" }).end();
    }
    const data = await readFile(filePath);
    res.writeHead(200, {
      "Content-Type": MIME[extname(filePath).toLowerCase()] || "application/octet-stream",
      "Cache-Control": "no-store",
    });
    res.end(data);
  } catch (err) {
    res.writeHead(500);
    res.end("Server error: " + err.message);
  }
});

server.listen(PORT, () => {
  console.log(`Calculator dev server running at http://localhost:${PORT}`);
});
