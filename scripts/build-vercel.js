const { cpSync, mkdirSync, rmSync } = require("node:fs");

rmSync("dist", { recursive: true, force: true });
mkdirSync("dist");
cpSync("index.html", "dist/index.html");
cpSync("css", "dist/css", { recursive: true });
mkdirSync("dist/scripts");
cpSync("scripts/script.js", "dist/scripts/script.js");
