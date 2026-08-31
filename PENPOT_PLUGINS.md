# Penpot Plugin Toolkit

Use these manifest URLs in Penpot's Plugin Manager. They are useful for MCP, HTML/CSS translation, Tailwind handoff, tokens, accessibility, and icon work.

## Core MCP

- Built-in Penpot MCP: stored locally in `penpotmcp`
- Codex MCP config: `http://localhost:9001/mcp/stream?...`

## Code And Handoff

- Ultimate HTML to Penpot: `https://ultimate-html-penpot-ext.vercel.app/manifest.json`
- Tailwind Styles: `https://grafikart.github.io/penpot-plugins/tailwind-styles/manifest.json`
- Tailwind HTML: `https://grafikart.github.io/penpot-plugins/tailwind-html/manifest.json`
- Semantic Tagger: `https://penpot-semantic-tagger.pages.dev/manifest.json`

## Tokens And Systems

- Design Token Manager: `https://design-token-manager.pages.dev/manifest.json`
- Color styles to JSON file: `https://colors-to-tokens.plugins.penpot.app/assets/manifest.json`
- Create Palette from library: `https://create-palette.plugins.penpot.app/assets/manifest.json`
- Typescales: `https://typescales.netlify.app/manifest.json`

## UI Utilities

- Contrast: `https://contrast.plugins.penpot.app/assets/manifest.json`
- Tables: `https://table.plugins.penpot.app/assets/manifest.json`
- Iconify: `https://penpot.iconify.design/manifest.json`
- Feather Icons: `https://icons.plugins.penpot.app/assets/manifest.json`

## Install Notes

Penpot UI plugins install per user through Penpot's Plugin Manager. MCP can create and modify design content, but it does not provide a safe API for silently approving third-party plugin permissions.
