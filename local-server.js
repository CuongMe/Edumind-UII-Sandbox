const http = require("node:http");
const { readFile } = require("node:fs/promises");
const { existsSync, readFileSync } = require("node:fs");
const path = require("node:path");
const { generateGemini } = require("./api/gemini-core");

const root = __dirname;
const port = Number(process.env.PORT || 4174);
const types = { ".html": "text/html", ".css": "text/css", ".js": "text/javascript" };

loadEnv();

http.createServer(async (req, res) => {
  try {
    if (req.method === "OPTIONS") return cors(res, 204);
    const url = new URL(req.url, `http://${req.headers.host}`);
    if (req.method === "GET" && url.pathname === "/config") return json(res, 200, {
      hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
    });
    if (req.method === "POST" && url.pathname === "/api/gemini") return gemini(req, res);
    if (req.method !== "GET") return json(res, 405, { error: "Method not allowed" });
    return staticFile(url.pathname, res);
  } catch (error) {
    return json(res, 500, { error: error.message });
  }
}).listen(port, "127.0.0.1", () => {
  console.log(`AI EduMind running at http://127.0.0.1:${port}`);
});

function loadEnv() {
  const file = path.join(root, ".env");
  if (!existsSync(file)) return;
  for (const line of readFileSync(file, "utf8").split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (!match || process.env[match[1]]) continue;
    process.env[match[1]] = match[2].replace(/^["']|["']$/g, "");
  }
}

async function staticFile(urlPath, res) {
  const clean = urlPath === "/" ? "/index.html" : decodeURIComponent(urlPath);
  const file = path.normalize(path.join(root, clean));
  const relative = path.relative(root, file);
  if (relative.startsWith("..") || path.isAbsolute(relative)) return json(res, 403, { error: "Forbidden" });
  if (!existsSync(file)) return json(res, 404, { error: "Not found" });
  const body = await readFile(file);
  res.writeHead(200, { "Content-Type": types[path.extname(file)] || "application/octet-stream" });
  res.end(body);
}

async function gemini(req, res) {
  const body = await readJson(req);
  const result = await generateGemini(body, process.env.GEMINI_API_KEY);
  return json(res, result.status, result.body);
}

function readJson(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
      if (body.length > 8000000) {
        reject(new Error("Request body too large"));
        req.destroy();
      }
    });
    req.on("end", () => {
      try { resolve(JSON.parse(body || "{}")); } catch { reject(new Error("Invalid JSON")); }
    });
    req.on("error", reject);
  });
}

function json(res, status, body) {
  res.writeHead(status, {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  });
  res.end(JSON.stringify(body));
}

function cors(res, status) {
  res.writeHead(status, {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  });
  res.end();
}
