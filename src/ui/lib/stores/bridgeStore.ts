import { create } from 'zustand';

export type LogEntryType = 'command' | 'response' | 'status' | 'progress';

export interface BridgeLogEntry {
    id: string;
    timestamp: number;
    type: LogEntryType;
    /** Short label like "create_design" or "Connected" */
    label: string;
    /** Optional detail (e.g. the JSON structure, node names being created) */
    detail?: string;
    /** Status for progress entries */
    status?: 'pending' | 'success' | 'error';
}

interface BridgeState {
    /** Whether the bridge is enabled (user can toggle) */
    enabled: boolean;
    /** Whether the WebSocket is currently connected */
    connected: boolean;
    /** Activity log of recent bridge events */
    activityLog: BridgeLogEntry[];

    // Actions
    setEnabled: (enabled: boolean) => void;
    toggleEnabled: () => void;
    setConnected: (connected: boolean) => void;
    addLogEntry: (entry: Omit<BridgeLogEntry, 'id' | 'timestamp'>) => void;
    updateLogEntry: (id: string, updates: Partial<BridgeLogEntry>) => void;
    clearLog: () => void;
}

const MAX_LOG_ENTRIES = 100;

export const useBridgeStore = create<BridgeState>((set) => ({
    enabled: true,
    connected: false,
    activityLog: [],

    setEnabled: (enabled) => set({ enabled }),
    toggleEnabled: () => set((state) => ({ enabled: !state.enabled })),
    setConnected: (connected) => set({ connected }),

    addLogEntry: (entry) =>
        set((state) => ({
            activityLog: [
                {
                    ...entry,
                    id: `${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
                    timestamp: Date.now(),
                },
                ...state.activityLog,
            ].slice(0, MAX_LOG_ENTRIES),
        })),

    updateLogEntry: (id, updates) =>
        set((state) => ({
            activityLog: state.activityLog.map((entry) =>
                entry.id === id ? { ...entry, ...updates } : entry
            ),
        })),

    clearLog: () => set({ activityLog: [] }),
}));
