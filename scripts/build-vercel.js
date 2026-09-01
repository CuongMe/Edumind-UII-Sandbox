const { cpSync, mkdirSync, rmSync } = require("node:fs");

rmSync("dist", { recursive: true, force: true });
mkdirSync("dist");
cpSync("index.html", "dist/index.html");
cpSync("css", "dist/css", { recursive: true });
cpSync("script", "dist/script", { recursive: true });
