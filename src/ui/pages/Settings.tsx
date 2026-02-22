import React from 'react';
import { useSettingsStore } from '@/lib/stores/settingsStore';
import { useBridgeStore } from '@/lib/stores/bridgeStore';
import { Palette, Puzzle, ShieldCheck, Sparkles, Unplug } from 'lucide-react';

function ToggleSwitch({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      onClick={onChange}
      className={`w-[28px] h-[14px] flex items-center rounded-full transition-all duration-200 focus:outline-none border shrink-0 ${checked
        ? 'bg-figma-bg-brand border-figma-border-brand'
        : 'bg-transparent border-figma-border-strong'
        }`}
    >
      <div
        className={`w-[10px] h-[10px] rounded-full transform transition-transform duration-200 ${checked
          ? 'translate-x-[16px] bg-figma-icon-onbrand'
          : 'translate-x-[1px] bg-figma-icon'
          }`}
      />
    </button>
  );
}

function SettingRow({ icon, label, description, children }: {
  icon: React.ReactNode;
  label: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between py-2 gap-3">
      <div className="flex items-start gap-2.5 min-w-0">
        <div className="mt-0.5 text-figma-icon-secondary shrink-0">{icon}</div>
        <div className="flex flex-col min-w-0">
          <span className="text-figma-11 font-medium text-figma-text">{label}</span>
          <span className="text-[10px] text-figma-text-secondary leading-snug">{description}</span>
        </div>
      </div>
      {children}
    </div>
  );
}

export default function Settings() {
  const { scanLocalVariables, swapComponents, enforceWCAG, brandContext, toggleSetting, setSetting } = useSettingsStore();
  const { enabled, connected, toggleEnabled } = useBridgeStore();

  return (
    <div className="flex flex-col h-full bg-figma-bg overflow-y-auto">
      <div className="p-4 space-y-5">
        {/* MCP Bridge */}
        <section className="space-y-1">
          <h2 className="text-[10px] font-semibold text-figma-text-secondary uppercase tracking-wider px-0.5 mb-2">MCP Bridge</h2>
          <SettingRow
            icon={<Unplug size={13} />}
            label="External AI Bridge"
            description={
              !enabled
                ? 'Disabled — AI coding tools cannot connect'
                : connected
                  ? 'Connected — receiving commands'
                  : 'Waiting for connection…'
            }
          >
            <div className="flex items-center gap-2">
              {enabled && (
                <span
                  className={`w-[7px] h-[7px] rounded-full shrink-0 ${connected
                    ? 'bg-green-500 shadow-[0_0_4px_rgba(34,197,94,0.5)]'
                    : 'bg-amber-500 animate-pulse'
                    }`}
                />
              )}
              <ToggleSwitch checked={enabled} onChange={toggleEnabled} />
            </div>
          </SettingRow>
        </section>

        <div className="border-t border-figma-border" />

        {/* Design System */}
        <section className="space-y-1">
          <h2 className="text-[10px] font-semibold text-figma-text-secondary uppercase tracking-wider px-0.5 mb-2">Design System</h2>
          <div className="space-y-0.5">
            <SettingRow
              icon={<Palette size={13} />}
              label="Scan Local Variables"
              description="Use colors & fonts from this file"
            >
              <ToggleSwitch checked={scanLocalVariables} onChange={() => toggleSetting('scanLocalVariables')} />
            </SettingRow>

            <SettingRow
              icon={<Puzzle size={13} />}
              label="Swap Components"
              description="Use local components when matching"
            >
              <ToggleSwitch checked={swapComponents} onChange={() => toggleSetting('swapComponents')} />
            </SettingRow>
          </div>
        </section>

        <div className="border-t border-figma-border" />

        {/* Brand Context */}
        <section className="space-y-2">
          <div className="flex items-center gap-1.5 px-0.5">
            <Sparkles size={12} className="text-figma-icon-secondary" />
            <h2 className="text-[10px] font-semibold text-figma-text-secondary uppercase tracking-wider">Brand Context</h2>
          </div>
          <p className="text-[10px] text-figma-text-tertiary px-0.5">
            Persistent context applied to all generations.
          </p>
          <textarea
            value={brandContext}
            onChange={(e) => setSetting('brandContext', e.target.value)}
            placeholder="e.g. Use rounded corners (8px), serif headings, vibrant gradients, and a playful vibe."
            className="w-full h-24 text-figma-11 resize-none bg-figma-bg-secondary text-figma-text p-2.5 rounded-lg border border-transparent hover:border-figma-border outline-none focus:border-figma-border-brand focus:ring-1 focus:ring-figma-border-brand/30 transition-all placeholder:text-figma-text-tertiary"
          />
        </section>

        <div className="border-t border-figma-border" />

        {/* Accessibility */}
        <section className="space-y-1">
          <h2 className="text-[10px] font-semibold text-figma-text-secondary uppercase tracking-wider px-0.5 mb-2">Accessibility</h2>
          <SettingRow
            icon={<ShieldCheck size={13} />}
            label="Enforce WCAG AAA"
            description="Ensure high contrast ratios in generated designs"
          >
            <ToggleSwitch checked={enforceWCAG} onChange={() => toggleSetting('enforceWCAG')} />
          </SettingRow>
        </section>
      </div>
    </div>
  );
}