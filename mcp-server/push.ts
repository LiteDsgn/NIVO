import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import fs from "fs";

async function main() {
    const serverPath = "c:\\Users\\adeba\\OneDrive\\Documents\\Plugin\\Nivo\\mcp-server\\server.ts";
    const designPath = "c:\\Users\\adeba\\.gemini\\antigravity\\brain\\c49739bd-0c77-49db-b016-ebfe65f8ef64\\design.json";

    console.log("Starting bridge...");
    const transport = new StdioClientTransport({
        command: "npx",
        args: ["tsx", serverPath],
    });

    const client = new Client({
        name: "pusher",
        version: "1.0.0"
    }, { capabilities: {} });

    await client.connect(transport);
    console.log("Connected to bridge via MCP.");

    const structure = JSON.parse(fs.readFileSync(designPath, 'utf8'));

    // Figma usually reconnects within 1-2 seconds
    console.log("Waiting for Figma connection (5s)...");
    await new Promise(r => setTimeout(r, 5000));

    console.log("Pushing design to Figma...");
    const result = await client.callTool({
        name: "create_design",
        arguments: { structure }
    });

    console.log("Result:", JSON.stringify(result, null, 2));

    // Keep running for a bit to ensure Figma gets the message fully
    await new Promise(r => setTimeout(r, 2000));
    process.exit(0);
}

main().catch(err => {
    console.error(err);
    process.exit(1);
});
