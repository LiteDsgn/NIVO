import { useBridgeStore, type BridgeLogEntry } from '@/lib/stores/bridgeStore';
import { Unplug, Trash2, Loader2, CheckCircle2, XCircle, ArrowDownToLine, ArrowUpFromLine, Radio } from 'lucide-react';

function formatTime(timestamp: number): string {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

function StatusIcon({ status }: { status?: BridgeLogEntry['status'] }) {
    switch (status) {
        case 'pending':
            return <Loader2 size={11} className="text-figma-text-brand animate-spin shrink-0" />;
        case 'success':
            return <CheckCircle2 size={11} className="text-green-500 shrink-0" />;
        case 'error':
            return <XCircle size={11} className="text-red-400 shrink-0" />;
        default:
            return null;
    }
}

function TypeIcon({ type }: { type: BridgeLogEntry['type'] }) {
    switch (type) {
        case 'command':
            return <ArrowDownToLine size={10} className="text-blue-400 shrink-0" />;
        case 'response':
            return <ArrowUpFromLine size={10} className="text-figma-text-secondary shrink-0" />;
        case 'status':
            return <Radio size={10} className="text-figma-text-tertiary shrink-0" />;
        case 'progress':
            return <Loader2 size={10} className="text-figma-text-brand animate-spin shrink-0" />;
        default:
            return null;
    }
}

function LogEntry({ entry }: { entry: BridgeLogEntry }) {
    return (
        <div className="flex items-start gap-2 px-3 py-2 border-b border-figma-border/40 last:border-b-0 animate-msg-in">
            {/* Status indicator */}
            <div className="pt-0.5">
                <StatusIcon status={entry.status} />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                    <TypeIcon type={entry.type} />
                    <span className="text-figma-11 font-medium text-figma-text truncate">
                        {entry.label}
                    </span>
                </div>
                {entry.detail && (
                    <p className="text-[10px] text-figma-text-secondary mt-0.5 leading-relaxed">
                        {entry.detail}
                    </p>
                )}
            </div>

            {/* Timestamp */}
            <span className="text-[9px] text-figma-text-tertiary font-mono shrink-0 pt-0.5">
                {formatTime(entry.timestamp)}
            </span>
        </div>
    );
}

export default function McpTab() {
    const { enabled, connected, activityLog, clearLog } = useBridgeStore();

    return (
        <div className="flex flex-col h-full bg-figma-bg">
            {/* Header bar */}
            <div className="flex items-center justify-between px-3 py-2.5 border-b border-figma-border shrink-0">
                <div className="flex items-center gap-2">
                    <Unplug size={13} className="text-figma-icon-secondary" />
                    <span className="text-figma-11 font-semibold text-figma-text">MCP Bridge</span>
                    {/* Live status pill */}
                    <span
                        className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-medium ${!enabled
                                ? 'bg-figma-bg-secondary text-figma-text-tertiary'
                                : connected
                                    ? 'bg-green-500/15 text-green-500'
                                    : 'bg-amber-500/15 text-amber-500'
                            }`}
                    >
                        <span
                            className={`w-[5px] h-[5px] rounded-full ${!enabled
                                    ? 'bg-figma-text-tertiary'
                                    : connected
                                        ? 'bg-green-500'
                                        : 'bg-amber-500 animate-pulse'
                                }`}
                        />
                        {!enabled ? 'Off' : connected ? 'Live' : 'Waiting'}
                    </span>
                </div>
                {activityLog.length > 0 && (
                    <button
                        onClick={clearLog}
                        className="text-figma-text-tertiary hover:text-figma-text-secondary transition-colors p-1 rounded hover:bg-figma-bg-hover"
                        title="Clear log"
                    >
                        <Trash2 size={11} />
                    </button>
                )}
            </div>

            {/* Activity feed */}
            <div className="flex-1 overflow-y-auto">
                {!enabled ? (
                    <div className="flex flex-col items-center justify-center h-full gap-2 px-6 text-center">
                        <Unplug size={24} className="text-figma-text-tertiary" />
                        <p className="text-figma-11 text-figma-text-secondary font-medium">Bridge Disabled</p>
                        <p className="text-[10px] text-figma-text-tertiary leading-relaxed">
                            Enable the Antigravity Bridge in Settings to see live activity here.
                        </p>
                    </div>
                ) : activityLog.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full gap-2 px-6 text-center">
                        <div className="relative">
                            <Radio size={24} className="text-figma-text-tertiary" />
                            {connected && (
                                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                            )}
                        </div>
                        <p className="text-figma-11 text-figma-text-secondary font-medium">
                            {connected ? 'Listening…' : 'Connecting…'}
                        </p>
                        <p className="text-[10px] text-figma-text-tertiary leading-relaxed">
                            {connected
                                ? 'Waiting for commands from Antigravity. Activity will appear here in real-time.'
                                : 'Trying to connect to the MCP relay server on port 9600…'
                            }
                        </p>
                    </div>
                ) : (
                    <div>
                        {activityLog.map((entry) => (
                            <LogEntry key={entry.id} entry={entry} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
