import React from 'react';
import { useSettingsStore } from '@/lib/stores/settingsStore';

export default function Settings() {
  const { scanLocalVariables, swapComponents, enforceWCAG, brandContext, toggleSetting, setSetting } = useSettingsStore();

  return (
    <div className="flex flex-col h-full bg-figma-bg p-4 space-y-6 overflow-y-auto pb-8">

      <div className="space-y-2">
        <h2 className="text-figma-11 font-bold text-figma-text">Design System</h2>

        <div className="flex items-center justify-between py-2">
          <div className="flex flex-col">
            <span className="text-figma-11 font-medium text-figma-text">Scan Local Variables</span>
            <span className="text-figma-11 text-figma-text-secondary">Use colors &amp; fonts from this file</span>
          </div>
          <button
            onClick={() => toggleSetting('scanLocalVariables')}
            className={`w-[28px] h-[14px] flex items-center rounded-full transition-colors duration-200 focus:outline-none border ${scanLocalVariables ? 'bg-figma-bg-brand border-figma-border-brand' : 'bg-transparent border-figma-border-strong'}`}
          >
            <div className={`w-[10px] h-[10px] rounded-full transform transition-transform duration-200 ${scanLocalVariables ? 'translate-x-[16px] bg-figma-icon-onbrand' : 'translate-x-[1px] bg-figma-icon'}`} />
          </button>
        </div>

        <div className="flex items-center justify-between py-2">
          <div className="flex flex-col">
            <span className="text-figma-11 font-medium text-figma-text">Swap Components</span>
            <span className="text-figma-11 text-figma-text-secondary">Use local components when matching</span>
          </div>
          <button
            onClick={() => toggleSetting('swapComponents')}
            className={`w-[28px] h-[14px] flex items-center rounded-full transition-colors duration-200 focus:outline-none border ${swapComponents ? 'bg-figma-bg-brand border-figma-border-brand' : 'bg-transparent border-figma-border-strong'}`}
          >
            <div className={`w-[10px] h-[10px] rounded-full transform transition-transform duration-200 ${swapComponents ? 'translate-x-[16px] bg-figma-icon-onbrand' : 'translate-x-[1px] bg-figma-icon'}`} />
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <h2 className="text-figma-11 font-bold text-figma-text">Brand Context</h2>
        <div className="relative">
          <textarea
            value={brandContext}
            onChange={(e) => setSetting('brandContext', e.target.value)}
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
            className={`w-[28px] h-[14px] flex items-center rounded-full transition-colors duration-200 focus:outline-none border ${enforceWCAG ? 'bg-figma-bg-brand border-figma-border-brand' : 'bg-transparent border-figma-border-strong'}`}
          >
            <div className={`w-[10px] h-[10px] rounded-full transform transition-transform duration-200 ${enforceWCAG ? 'translate-x-[16px] bg-figma-icon-onbrand' : 'translate-x-[1px] bg-figma-icon'}`} />
          </button>
        </div>
      </div>
    </div>
  );
}