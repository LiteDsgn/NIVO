/**
 * Nivo MCP Server
 *
 * Bridges Antigravity (via stdio MCP) to a running Nivo Figma plugin (via WebSocket).
 *
 * Architecture:
 *   Antigravity  ←stdio→  McpServer  ←ws→  Nivo Plugin UI  ←postMessage→  Figma Sandbox
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { WebSocketServer, WebSocket } from "ws";
import { z } from "zod";

const WS_PORT = 9600;

// ─── WebSocket Relay ──────────────────────────────────────────────────────────

let pluginSocket: WebSocket | null = null;
const pendingRequests = new Map<
    string,
    { resolve: (value: unknown) => void; reject: (reason: Error) => void }
>();

const wss = new WebSocketServer({ port: WS_PORT });

wss.on("connection", (ws) => {
    pluginSocket = ws;
    console.error(`[nivo-mcp] Plugin connected via WebSocket on port ${WS_PORT}`);

    ws.on("message", (data) => {
        try {
            const msg = JSON.parse(data.toString());
            // Messages from plugin are responses to our requests
            if (msg.requestId && pendingRequests.has(msg.requestId)) {
                const pending = pendingRequests.get(msg.requestId)!;
                pendingRequests.delete(msg.requestId);
                pending.resolve(msg);
            }
        } catch {
            console.error("[nivo-mcp] Failed to parse plugin message");
        }
    });

    ws.on("close", () => {
        console.error("[nivo-mcp] Plugin disconnected");
        pluginSocket = null;
        // Reject all pending requests
        for (const [id, pending] of pendingRequests) {
            pending.reject(new Error("Plugin disconnected"));
            pendingRequests.delete(id);
        }
    });
});

console.error(`[nivo-mcp] WebSocket relay listening on ws://localhost:${WS_PORT}`);

/**
 * Send a command to the Nivo plugin and wait for a response.
 */
function sendToPlugin(command: Record<string, unknown>, timeoutMs = 30_000): Promise<unknown> {
    return new Promise((resolve, reject) => {
        if (!pluginSocket || pluginSocket.readyState !== WebSocket.OPEN) {
            return reject(
                new Error(
                    "Nivo plugin is not connected. Make sure Figma is open with the Nivo plugin running."
                )
            );
        }

        const requestId = `mcp_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
        const msg = { ...command, requestId };

        pendingRequests.set(requestId, { resolve, reject });
        pluginSocket.send(JSON.stringify(msg));

        // Timeout
        setTimeout(() => {
            if (pendingRequests.has(requestId)) {
                pendingRequests.delete(requestId);
                reject(new Error("Plugin response timed out after " + timeoutMs + "ms"));
            }
        }, timeoutMs);
    });
}

// ─── MCP Server ───────────────────────────────────────────────────────────────

const server = new McpServer({
    name: "nivo-figma",
    version: "1.0.0",
});

// Tool: create_design
server.registerTool(
    "create_design",
    {
        title: "Create Figma Design",
        description:
            "Push a Figma node JSON tree onto the canvas. The structure must follow the Nivo JSON schema (FRAME/TEXT/RECTANGLE/ELLIPSE nodes with fills, layoutMode, padding, etc.). The design will appear as a draft on the canvas.",
        inputSchema: {
            structure: z
                .any()
                .describe(
                    "A JSON object (single root node) or array of nodes following the Nivo schema. Each node has: type (FRAME|TEXT|RECTANGLE|ELLIPSE), name, width, height, fills [{type:'SOLID', color:{r,g,b}}], layoutMode (VERTICAL|HORIZONTAL), itemSpacing, padding {top,right,bottom,left}, cornerRadius, children[], characters (TEXT), fontSize (TEXT), fontWeight (TEXT: Regular|Medium|SemiBold|Bold|Light|Thin|ExtraLight|ExtraBold|Black)."
                ),
        },
    },
    async ({ structure }) => {
        try {
            const response = await sendToPlugin({
                type: "create",
                structure,
            });
            return {
                content: [
                    {
                        type: "text" as const,
                        text: `Design created successfully on the Figma canvas (as a draft). ${JSON.stringify(response)}`,
                    },
                ],
            };
        } catch (err) {
            return {
                content: [{ type: "text" as const, text: `Error: ${(err as Error).message}` }],
                isError: true,
            };
        }
    }
);

// Tool: modify_design
server.registerTool(
    "modify_design",
    {
        title: "Modify Selected Figma Design",
        description:
            "Replace the currently selected Figma node with a new design. The selected node will be hidden and the new design placed in its position as a draft.",
        inputSchema: {
            structure: z
                .any()
                .describe("The replacement node JSON structure (same schema as create_design)."),
        },
    },
    async ({ structure }) => {
        try {
            const response = await sendToPlugin({
                type: "modify",
                structure,
            });
            return {
                content: [
                    {
                        type: "text" as const,
                        text: `Design modified successfully. ${JSON.stringify(response)}`,
                    },
                ],
            };
        } catch (err) {
            return {
                content: [{ type: "text" as const, text: `Error: ${(err as Error).message}` }],
                isError: true,
            };
        }
    }
);

// Tool: get_selection
server.registerTool(
    "get_selection",
    {
        title: "Get Figma Selection",
        description:
            "Read the currently selected node(s) in Figma, serialized as JSON. Also returns the local design system (paint styles, text styles, components). Use this to understand the current context before creating or modifying designs.",
    },
    async () => {
        try {
            const response = (await sendToPlugin({
                type: "get_selection",
            })) as Record<string, unknown>;
            return {
                content: [
                    {
                        type: "text" as const,
                        text: JSON.stringify(response, null, 2),
                    },
                ],
            };
        } catch (err) {
            return {
                content: [{ type: "text" as const, text: `Error: ${(err as Error).message}` }],
                isError: true,
            };
        }
    }
);

// Tool: accept_draft
server.registerTool(
    "accept_draft",
    {
        title: "Accept Draft",
        description:
            "Accept the current draft design on the canvas, making it permanent. If the draft replaced an existing node, the original will be removed.",
    },
    async () => {
        try {
            const response = await sendToPlugin({ type: "accept_draft" });
            return {
                content: [
                    { type: "text" as const, text: `Draft accepted. ${JSON.stringify(response)}` },
                ],
            };
        } catch (err) {
            return {
                content: [{ type: "text" as const, text: `Error: ${(err as Error).message}` }],
                isError: true,
            };
        }
    }
);

// Tool: discard_draft
server.registerTool(
    "discard_draft",
    {
        title: "Discard Draft",
        description:
            "Discard the current draft design on the canvas. If it replaced an existing node, the original will be restored.",
    },
    async () => {
        try {
            const response = await sendToPlugin({ type: "discard_draft" });
            return {
                content: [
                    { type: "text" as const, text: `Draft discarded. ${JSON.stringify(response)}` },
                ],
            };
        } catch (err) {
            return {
                content: [{ type: "text" as const, text: `Error: ${(err as Error).message}` }],
                isError: true,
            };
        }
    }
);

// ─── Start ────────────────────────────────────────────────────────────────────

async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("[nivo-mcp] MCP server connected via stdio");
}

main().catch((err) => {
    console.error("[nivo-mcp] Fatal error:", err);
    process.exit(1);
});
