import { create } from 'zustand';

interface SettingsState {
    scanLocalVariables: boolean;
    swapComponents: boolean;
    enforceWCAG: boolean;
    brandContext: string;
    localLibrary: {
        paintStyles: any[];
        textStyles: any[];
        effectStyles: any[];
        gridStyles: any[];
        variables: any[];
        components: any[];
    } | null;
    lastScanned: number | null;
    setSetting: <K extends keyof Omit<SettingsState, 'setSetting' | 'toggleSetting'>>(key: K, value: SettingsState[K]) => void;
    toggleSetting: (key: 'scanLocalVariables' | 'swapComponents' | 'enforceWCAG') => void;
}

export const useSettingsStore = create<SettingsState>((set) => ({
    scanLocalVariables: true,
    swapComponents: false,
    enforceWCAG: false,
    brandContext: '',
    localLibrary: null,
    lastScanned: null,
    setSetting: (key, value) => set({ [key]: value }),
    toggleSetting: (key) => set((state) => ({ [key]: !state[key] })),
}));
