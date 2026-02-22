import { create } from 'zustand';

interface SettingsState {
    scanLocalVariables: boolean;
    swapComponents: boolean;
    enforceWCAG: boolean;
    brandContext: string;
    setSetting: <K extends keyof Omit<SettingsState, 'setSetting' | 'toggleSetting'>>(key: K, value: SettingsState[K]) => void;
    toggleSetting: (key: 'scanLocalVariables' | 'swapComponents' | 'enforceWCAG') => void;
}

export const useSettingsStore = create<SettingsState>((set) => ({
    scanLocalVariables: true,
    swapComponents: false,
    enforceWCAG: false,
    brandContext: '',
    setSetting: (key, value) => set({ [key]: value }),
    toggleSetting: (key) => set((state) => ({ [key]: !state[key] })),
}));
