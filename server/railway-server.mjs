/**
 * Railway production entrypoint for North Eastern Lawn.
 * Serves the Vite client build without loading development, OAuth, or database modules.
 */
import { createReadStream, existsSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { extname, resolve } from "node:path";

const publicDirectory = resolve(process.cwd(), "dist", "public");
const port = Number(process.env.PORT || "3000");
const mimeTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".webmanifest": "application/manifest+json",
  ".webp": "image/webp",
};

function serveFile(response, filePath) {
  response.writeHead(200, {
    "Content-Type": mimeTypes[extname(filePath)] || "application/octet-stream",
    "Cache-Control": filePath.endsWith("index.html") ? "no-cache" : "public, max-age=31536000, immutable",
  });
  createReadStream(filePath).pipe(response);
}

createServer((request, response) => {
  const requestUrl = new URL(request.url || "/", "http://localhost");
  const requestedPath = decodeURIComponent(requestUrl.pathname);
  const candidate = resolve(publicDirectory, `.${requestedPath}`);
  const isSafeFile = candidate.startsWith(publicDirectory) && existsSync(candidate) && statSync(candidate).isFile();

  if (isSafeFile) {
    serveFile(response, candidate);
    return;
  }

  serveFile(response, resolve(publicDirectory, "index.html"));
}).listen(port, "0.0.0.0", () => {
  console.log(`[Railway] Serving ${publicDirectory} on 0.0.0.0:${port}`);
});
