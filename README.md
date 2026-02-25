# Nivo - AI UI Designer for Figma

> 🚧 **Work In Progress**: This project is currently under active development and is purely experimental. It is being built and tested in real-time and is **not yet ready for production use**. Expect bugs, breaking changes, and incomplete features.

Nivo is an intelligent Figma plugin that generates production-grade, editable UI designs from natural language prompts. Powered by Gemini AI and integrated with a local MCP (Model Context Protocol) server, Nivo understands Figma's Auto Layout, design systems, and responsive constraints to deliver pixel-perfect results.

## 🚀 Key Features

- **Text-to-UI Generation**: Create complex components and layouts (cards, dashboards, forms) describing them in plain English.
- **Pixel-Perfect Auto Layout**: Generates designs with correct padding, gaps, and responsive sizing (`HUG` vs `FILL`).
- **Context-Aware**: Reads your current Figma selection to modify existing designs or create variations based on context.
- **Draft Mode**: Preview generated designs on the canvas before accepting them.
- **MCP Server Integration**: Connects to external tools and agents via a local WebSocket/HTTP server on port `9600`.
- **Real-time Status**: Visual feedback with generation stages (Thinking, Rendering) and timers.

## 🛠️ Architecture

The project consists of two main parts:

1.  **Figma Plugin** (`src/`): The frontend UI (React + Vite) and the plugin controller (TypeScript) that interacts with the Figma API.
2.  **MCP Server** (`mcp-server/`): A Node.js server that acts as a bridge between the plugin and external tools. It handles:
    - WebSocket connections to the plugin.
    - HTTP endpoints for external automation.
    - Relay of commands like "generate design" or "read selection".

## 📦 Installation & Setup

### Prerequisites
- Node.js (v18+)
- Figma Desktop App

### 1. Install Dependencies
```bash
npm install
```

### 2. Start the Development Server
This builds the plugin in watch mode.
```bash
npm run dev
```

### 3. Start the MCP Server
The server runs on port **9600** (handling both HTTP and WebSocket).
```bash
npm run mcp
```

### 4. Load in Figma
1.  Open Figma.
2.  Go to **Plugins > Development > Import plugin from manifest...**
3.  Select the `manifest.json` file in this project root.

## 🔌 MCP Server API (Port 9600)

The local server exposes endpoints to interact with Figma programmatically:

-   **POST** `/generate`: Generate UI on the canvas from a JSON structure.
    ```json
    { "type": "FRAME", "name": "My Card", ... }
    ```
-   **GET** `/selection`: Retrieve the JSON structure of the currently selected node in Figma.

## 💻 Development Workflow

1.  Run `npm run dev` to watch for plugin changes.
2.  Run `npm run mcp` to keep the bridge active.
3.  In Figma, run **Nivo**.
4.  If you change plugin code, use **Plugins > Development > Nivo > Reload** to apply changes.

## 🧩 Project Structure

-   `src/ui`: React frontend for the plugin UI.
-   `src/plugin`: Figma main thread controller logic.
-   `mcp-server`: Node.js server for external connectivity.
-   `manifest.json`: Plugin configuration.

## ✨ Recent Updates

-   **Unified Port**: MCP server now uses port **9600** for all traffic.
-   **Improved Rendering**: Enhanced Auto Layout logic for better responsiveness.
-   **Selection API**: Added ability to read Figma selection via HTTP.
