import React, { useState } from 'react';

interface SettingsState {
  scanLocalVariables: boolean;
  swapComponents: boolean;
  enforceWCAG: boolean;
  brandContext: string;
}

export default function Settings() {
  const [settings, setSettings] = useState<SettingsState>({
    scanLocalVariables: true,
    swapComponents: false,
    enforceWCAG: false,
    brandContext: '',
  });

  const toggleSetting = (key: keyof SettingsState) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, key: keyof SettingsState) => {
    setSettings(prev => ({ ...prev, [key]: e.target.value }));
  };

  return (
    <div className="flex flex-col h-full bg-figma-bg p-4 space-y-6 overflow-y-auto pb-8">

      <div className="space-y-2">
        <h2 className="text-figma-11 font-bold text-figma-text">Design System</h2>

        <div className="flex items-center justify-between py-2">
          <div className="flex flex-col">
            <span className="text-figma-11 font-medium text-figma-text">Scan Local Variables</span>
            <span className="text-figma-11 text-figma-text-secondary">Use colors & fonts from this file</span>
          </div>
          <button
            onClick={() => toggleSetting('scanLocalVariables')}
            className={`w-[28px] h-[14px] flex items-center rounded-full transition-colors duration-200 focus:outline-none border ${settings.scanLocalVariables ? 'bg-figma-bg-brand border-figma-border-brand' : 'bg-transparent border-figma-border-strong'}`}
          >
            <div className={`w-[10px] h-[10px] rounded-full transform transition-transform duration-200 ${settings.scanLocalVariables ? 'translate-x-[16px] bg-figma-icon-onbrand' : 'translate-x-[1px] bg-figma-icon'}`} />
          </button>
        </div>

        <div className="flex items-center justify-between py-2">
          <div className="flex flex-col">
            <span className="text-figma-11 font-medium text-figma-text">Swap Components</span>
            <span className="text-figma-11 text-figma-text-secondary">Use local components when matching</span>
          </div>
          <button
            onClick={() => toggleSetting('swapComponents')}
            className={`w-[28px] h-[14px] flex items-center rounded-full transition-colors duration-200 focus:outline-none border ${settings.swapComponents ? 'bg-figma-bg-brand border-figma-border-brand' : 'bg-transparent border-figma-border-strong'}`}
          >
            <div className={`w-[10px] h-[10px] rounded-full transform transition-transform duration-200 ${settings.swapComponents ? 'translate-x-[16px] bg-figma-icon-onbrand' : 'translate-x-[1px] bg-figma-icon'}`} />
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <h2 className="text-figma-11 font-bold text-figma-text">Brand Context</h2>
        <div className="relative">
          <textarea
            value={settings.brandContext}
            onChange={(e) => handleInputChange(e, 'brandContext')}
            placeholder="e.g. Use rounded corners (8px), serif headings, and a playful vibe."
            className="w-full h-32 text-figma-11 resize-none bg-figma-bg text-figma-text p-2 rounded-figma-2 border border-transparent hover:border-figma-border outline-none focus:border-figma-border-brand focus:ring-1 focus:ring-figma-border-brand transition-all"
          />
        </div>
      </div>

      <div className="space-y-2">
        <h2 className="text-figma-11 font-bold text-figma-text">Accessibility</h2>
        <div className="flex items-center justify-between py-2">
          <div className="flex flex-col">
            <span className="text-figma-11 font-medium text-figma-text">Enforce WCAG AAA</span>
            <span className="text-figma-11 text-figma-text-secondary">Ensure high contrast ratios</span>
          </div>
          <button
            onClick={() => toggleSetting('enforceWCAG')}
            className={`w-[28px] h-[14px] flex items-center rounded-full transition-colors duration-200 focus:outline-none border ${settings.enforceWCAG ? 'bg-figma-bg-brand border-figma-border-brand' : 'bg-transparent border-figma-border-strong'}`}
          >
            <div className={`w-[10px] h-[10px] rounded-full transform transition-transform duration-200 ${settings.enforceWCAG ? 'translate-x-[16px] bg-figma-icon-onbrand' : 'translate-x-[1px] bg-figma-icon'}`} />
          </button>
        </div>
      </div>
    </div>
  );
}