const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".png": "image/png",
  ".woff2": "font/woff2",
  ".map": "application/json; charset=utf-8",
};

/**
 * Serve a built directory over http://127.0.0.1 on a random free port. This is
 * how the Electron window loads the app: a local static file server for the
 * app's own bundle, bound to loopback only. No framework, no outbound network,
 * no listening on a public interface. It exists because loading a Vite ESM
 * build over file:// is CORS-blocked by Chromium; http://localhost is not.
 *
 * @param {string} root absolute path of the directory to serve (dist/)
 * @returns {Promise<{ origin: string, close: () => void }>}
 */
function serveStatic(root) {
  const server = http.createServer((req, res) => {
    // Path only, no query; decoded; backslashes normalised.
    let rel = decodeURIComponent((req.url || "/").split("?")[0]);
    if (rel === "/") rel = "/index.html";

    // Resolve inside root and refuse anything that escapes it.
    const filePath = path.join(root, path.normalize(rel));
    if (filePath !== root && !filePath.startsWith(root + path.sep)) {
      res.writeHead(403).end("Forbidden");
      return;
    }

    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.writeHead(404).end("Not found");
        return;
      }
      const type = TYPES[path.extname(filePath).toLowerCase()] || "application/octet-stream";
      res.writeHead(200, { "Content-Type": type }).end(data);
    });
  });

  return new Promise((resolve, reject) => {
    server.on("error", reject);
    // Port 0 = OS picks a free port; 127.0.0.1 = loopback only.
    server.listen(0, "127.0.0.1", () => {
      const { port } = server.address();
      resolve({ origin: `http://127.0.0.1:${port}`, close: () => server.close() });
    });
  });
}

module.exports = { serveStatic };
