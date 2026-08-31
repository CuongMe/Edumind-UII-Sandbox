const http = require("node:http");
const { readFile } = require("node:fs/promises");
const { existsSync, readFileSync } = require("node:fs");
const path = require("node:path");

const root = __dirname;
const port = Number(process.env.PORT || 4174);
const types = { ".html": "text/html", ".css": "text/css", ".js": "text/javascript" };
const allowedModels = new Set(["gemini-3.7-flash", "gemini-3.6-flash", "gemini-3.5-flash", "gemini-3.5-flash-lite", "gemini-3.1-flash-lite"]);

loadEnv();

http.createServer(async (req, res) => {
  try {
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
  if (!process.env.GEMINI_API_KEY) return json(res, 500, { error: "Missing GEMINI_API_KEY in .env" });

  const body = await readJson(req);
  const model = allowedModels.has(body.model) ? body.model : "gemini-3.6-flash";
  const prompt = String(body.prompt || "").trim();
  if (!prompt) return json(res, 400, { error: "Prompt is required" });
  const parts = [{ text: prompt }];
  if (body.image?.data) {
    const mimeType = String(body.image.mimeType || "image/jpeg");
    if (!["image/jpeg", "image/png", "image/webp"].includes(mimeType)) return json(res, 400, { error: "Unsupported image type" });
    parts.push({ inlineData: { mimeType, data: String(body.image.data) } });
  }

  let response;
  try {
    response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": process.env.GEMINI_API_KEY },
      body: JSON.stringify({
        contents: [{ role: "user", parts }],
        generationConfig: { temperature: 0.55, maxOutputTokens: 900 },
      }),
    });
  } catch (error) {
    return json(res, 502, { error: `Could not reach Gemini API: ${error.message}` });
  }
  const data = await readResponseBody(response);
  if (!response.ok) return json(res, response.status, { error: data?.error?.message || "Gemini request failed" });
  const text = data?.candidates?.[0]?.content?.parts?.map((part) => part.text || "").join("").trim();
  return json(res, 200, { text });
}

async function readResponseBody(response) {
  const text = await response.text();
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch {
    return { error: { message: text } };
  }
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
  res.writeHead(status, { "Content-Type": "application/json" });
  res.end(JSON.stringify(body));
}
