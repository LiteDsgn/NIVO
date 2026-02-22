import { useEffect, useRef, useCallback } from "react";
import { useBridgeStore } from "@/lib/stores/bridgeStore";

/**
 * WebSocket bridge that connects the Nivo plugin UI to the MCP server relay.
 *
 * Listens for commands from the MCP server (via WebSocket) and bridges them
 * to the Figma plugin sandbox (via parent.postMessage). Sends responses back
 * to the MCP server so tool calls can resolve.
 *
 * Respects the `enabled` flag from the bridge store — when disabled, the
 * WebSocket is closed and no reconnection attempts are made.
 */

const WS_URL = "ws://localhost:9600";
const RECONNECT_INTERVAL = 3000;

interface BridgeCommand {
    type: string;
    requestId: string;
    structure?: unknown;
}

export function useBridge() {
    const wsRef = useRef<WebSocket | null>(null);
    const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const enabled = useBridgeStore((s) => s.enabled);
    const setConnected = useBridgeStore((s) => s.setConnected);
    const addLogEntry = useBridgeStore((s) => s.addLogEntry);
    const updateLogEntry = useBridgeStore((s) => s.updateLogEntry);

    /**
     * Send a response back to the MCP server over WebSocket.
     */
    const sendResponse = useCallback(
        (requestId: string, data: Record<string, unknown>) => {
            if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
                wsRef.current.send(JSON.stringify({ requestId, ...data }));
            }
        },
        []
    );

    /**
     * Handle an incoming command from the MCP server.
     */
    const handleCommand = useCallback(
        (cmd: BridgeCommand) => {
            // Create a log entry for this command (with pending status)
            const logId = `${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;

            switch (cmd.type) {
                case "create": {
                    // Count nodes to show progress
                    const nodeCount = countNodes(cmd.structure);
                    addLogEntry({
                        type: "command",
                        label: "Creating design",
                        detail: `Rendering ${nodeCount} node${nodeCount !== 1 ? 's' : ''} on canvas…`,
                        status: "pending",
                    });

                    const createHandler = (event: MessageEvent) => {
                        const msg = event.data?.pluginMessage;
                        if (!msg) return;
                        if (msg.type === "generation-complete") {
                            window.removeEventListener("message", createHandler);
                            // Find and update the pending entry
                            const entries = useBridgeStore.getState().activityLog;
                            const pendingEntry = entries.find(
                                (e) => e.label === "Creating design" && e.status === "pending"
                            );
                            if (pendingEntry) {
                                updateLogEntry(pendingEntry.id, {
                                    status: "success",
                                    detail: `${nodeCount} node${nodeCount !== 1 ? 's' : ''} rendered ✓`,
                                });
                            }
                            sendResponse(cmd.requestId, {
                                status: msg.status || "success",
                            });
                        } else if (msg.type === "generation-error") {
                            window.removeEventListener("message", createHandler);
                            const entries = useBridgeStore.getState().activityLog;
                            const pendingEntry = entries.find(
                                (e) => e.label === "Creating design" && e.status === "pending"
                            );
                            if (pendingEntry) {
                                updateLogEntry(pendingEntry.id, {
                                    status: "error",
                                    detail: msg.message || "Failed to create design",
                                });
                            }
                            sendResponse(cmd.requestId, {
                                status: "error",
                                error: msg.message,
                            });
                        }
                    };
                    window.addEventListener("message", createHandler);

                    parent.postMessage(
                        {
                            pluginMessage: {
                                type: "generate-ui-from-json",
                                structure: cmd.structure,
                            },
                        },
                        "*"
                    );

                    setTimeout(() => {
                        window.removeEventListener("message", createHandler);
                    }, 30_000);
                    break;
                }

                case "modify": {
                    addLogEntry({
                        type: "command",
                        label: "Modifying selection",
                        detail: "Fetching current selection…",
                        status: "pending",
                    });

                    const selRequestId = `bridge_sel_${Date.now()}`;

                    const selHandler = (event: MessageEvent) => {
                        const msg = event.data?.pluginMessage;
                        if (!msg) return;
                        if (
                            msg.type === "selection-context-response" &&
                            msg.requestId === selRequestId
                        ) {
                            window.removeEventListener("message", selHandler);

                            if (!msg.context) {
                                const entries = useBridgeStore.getState().activityLog;
                                const pendingEntry = entries.find(
                                    (e) => e.label === "Modifying selection" && e.status === "pending"
                                );
                                if (pendingEntry) {
                                    updateLogEntry(pendingEntry.id, {
                                        status: "error",
                                        detail: "No node selected in Figma",
                                    });
                                }
                                sendResponse(cmd.requestId, {
                                    status: "error",
                                    error: "No node selected in Figma. Select a node first.",
                                });
                                return;
                            }

                            // Update log to show we're now replacing
                            const entries1 = useBridgeStore.getState().activityLog;
                            const pendingEntry1 = entries1.find(
                                (e) => e.label === "Modifying selection" && e.status === "pending"
                            );
                            if (pendingEntry1) {
                                updateLogEntry(pendingEntry1.id, {
                                    detail: `Replacing "${msg.context.name || 'selection'}"…`,
                                });
                            }

                            const modifyHandler = (event2: MessageEvent) => {
                                const msg2 = event2.data?.pluginMessage;
                                if (!msg2) return;
                                if (msg2.type === "generation-complete") {
                                    window.removeEventListener("message", modifyHandler);
                                    const entries2 = useBridgeStore.getState().activityLog;
                                    const pe = entries2.find(
                                        (e) => e.label === "Modifying selection" && e.status === "pending"
                                    );
                                    if (pe) {
                                        updateLogEntry(pe.id, {
                                            status: "success",
                                            detail: `Replaced "${msg.context.name || 'selection'}" ✓`,
                                        });
                                    }
                                    sendResponse(cmd.requestId, {
                                        status: msg2.status || "success",
                                    });
                                } else if (msg2.type === "generation-error") {
                                    window.removeEventListener("message", modifyHandler);
                                    const entries2 = useBridgeStore.getState().activityLog;
                                    const pe = entries2.find(
                                        (e) => e.label === "Modifying selection" && e.status === "pending"
                                    );
                                    if (pe) {
                                        updateLogEntry(pe.id, {
                                            status: "error",
                                            detail: msg2.message || "Failed",
                                        });
                                    }
                                    sendResponse(cmd.requestId, {
                                        status: "error",
                                        error: msg2.message,
                                    });
                                }
                            };
                            window.addEventListener("message", modifyHandler);

                            parent.postMessage(
                                {
                                    pluginMessage: {
                                        type: "generate-ui-from-json",
                                        structure: cmd.structure,
                                        replaceNodeId: msg.context.id,
                                    },
                                },
                                "*"
                            );

                            setTimeout(() => {
                                window.removeEventListener("message", modifyHandler);
                            }, 30_000);
                        }
                    };
                    window.addEventListener("message", selHandler);

                    parent.postMessage(
                        {
                            pluginMessage: {
                                type: "get-selection-context",
                                requestId: selRequestId,
                            },
                        },
                        "*"
                    );

                    setTimeout(() => {
                        window.removeEventListener("message", selHandler);
                    }, 5_000);
                    break;
                }

                case "get_selection": {
                    addLogEntry({
                        type: "command",
                        label: "Reading selection",
                        status: "pending",
                    });

                    const gsRequestId = `bridge_gs_${Date.now()}`;

                    const gsHandler = (event: MessageEvent) => {
                        const msg = event.data?.pluginMessage;
                        if (!msg) return;
                        if (
                            msg.type === "selection-context-response" &&
                            msg.requestId === gsRequestId
                        ) {
                            window.removeEventListener("message", gsHandler);
                            const entries = useBridgeStore.getState().activityLog;
                            const pe = entries.find(
                                (e) => e.label === "Reading selection" && e.status === "pending"
                            );
                            if (pe) {
                                updateLogEntry(pe.id, {
                                    status: "success",
                                    detail: msg.context
                                        ? `Selected: "${msg.context.name}" (${msg.context.type})`
                                        : "No selection",
                                });
                            }
                            sendResponse(cmd.requestId, {
                                status: "success",
                                context: msg.context,
                                designSystem: msg.designSystem,
                            });
                        }
                    };
                    window.addEventListener("message", gsHandler);

                    parent.postMessage(
                        {
                            pluginMessage: {
                                type: "get-selection-context",
                                requestId: gsRequestId,
                            },
                        },
                        "*"
                    );

                    setTimeout(() => {
                        window.removeEventListener("message", gsHandler);
                        sendResponse(cmd.requestId, {
                            status: "success",
                            context: null,
                            designSystem: null,
                        });
                    }, 3_000);
                    break;
                }

                case "accept_draft": {
                    parent.postMessage(
                        { pluginMessage: { type: "accept-draft" } },
                        "*"
                    );
                    addLogEntry({
                        type: "command",
                        label: "Draft accepted",
                        status: "success",
                    });
                    sendResponse(cmd.requestId, { status: "success" });
                    break;
                }

                case "discard_draft": {
                    parent.postMessage(
                        { pluginMessage: { type: "discard-draft" } },
                        "*"
                    );
                    addLogEntry({
                        type: "command",
                        label: "Draft discarded",
                        status: "success",
                    });
                    sendResponse(cmd.requestId, { status: "success" });
                    break;
                }

                default:
                    addLogEntry({
                        type: "response",
                        label: `Unknown: ${cmd.type}`,
                        status: "error",
                    });
                    sendResponse(cmd.requestId, {
                        status: "error",
                        error: `Unknown command type: ${cmd.type}`,
                    });
            }
        },
        [sendResponse, addLogEntry, updateLogEntry]
    );

    /**
     * Connect to the WebSocket relay server.
     */
    const connect = useCallback(() => {
        if (wsRef.current) {
            wsRef.current.close();
            wsRef.current = null;
        }

        try {
            const ws = new WebSocket(WS_URL);
            wsRef.current = ws;

            ws.onopen = () => {
                setConnected(true);
                addLogEntry({
                    type: "status",
                    label: "Connected",
                    detail: "MCP relay bridge active",
                    status: "success",
                });
            };

            ws.onmessage = (event) => {
                try {
                    const cmd = JSON.parse(event.data as string) as BridgeCommand;
                    if (cmd.requestId && cmd.type) {
                        handleCommand(cmd);
                    }
                } catch {
                    console.error("[nivo-bridge] Failed to parse command");
                }
            };

            ws.onclose = () => {
                setConnected(false);
                wsRef.current = null;
                if (useBridgeStore.getState().enabled) {
                    reconnectTimerRef.current = setTimeout(connect, RECONNECT_INTERVAL);
                }
            };

            ws.onerror = () => { };
        } catch {
            if (useBridgeStore.getState().enabled) {
                reconnectTimerRef.current = setTimeout(connect, RECONNECT_INTERVAL);
            }
        }
    }, [handleCommand, setConnected, addLogEntry]);

    /**
     * Disconnect from the WebSocket relay.
     */
    const disconnect = useCallback(() => {
        if (reconnectTimerRef.current) {
            clearTimeout(reconnectTimerRef.current);
            reconnectTimerRef.current = null;
        }
        if (wsRef.current) {
            wsRef.current.close();
            wsRef.current = null;
        }
        setConnected(false);
        addLogEntry({
            type: "status",
            label: "Disconnected",
            detail: "Bridge disabled",
        });
    }, [setConnected, addLogEntry]);

    // React to enabled state changes
    useEffect(() => {
        if (enabled) {
            connect();
        } else {
            disconnect();
        }

        return () => {
            if (reconnectTimerRef.current) {
                clearTimeout(reconnectTimerRef.current);
            }
            if (wsRef.current) {
                wsRef.current.close();
            }
        };
    }, [enabled, connect, disconnect]);
}

/**
 * Recursively count the number of nodes in a Figma JSON structure.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function countNodes(structure: any): number {
    if (!structure) return 0;
    if (Array.isArray(structure)) {
        return structure.reduce((sum, node) => sum + countNodes(node), 0);
    }
    let count = 1;
    if (structure.children && Array.isArray(structure.children)) {
        count += structure.children.reduce(
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (sum: number, child: any) => sum + countNodes(child),
            0
        );
    }
    return count;
}
