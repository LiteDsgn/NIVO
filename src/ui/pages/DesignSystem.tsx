import React, { useEffect, useState } from 'react';
import { useSettingsStore } from '@/lib/stores/settingsStore';
import { RefreshCw, Component as ComponentIcon, Type, Layers, Grid, Square, Spline } from 'lucide-react';

function formatDistanceToNow(timestamp: number) {
  const diffInMinutes = Math.floor((Date.now() - timestamp) / 60000);
  if (diffInMinutes < 1) return 'just now';
  if (diffInMinutes === 1) return '1 min';
  if (diffInMinutes < 60) return `${diffInMinutes} mins`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours === 1) return '1 hour';
  if (diffInHours < 24) return `${diffInHours} hours`;
  return `${Math.floor(diffInHours / 24)} days`;
}

type TabType = 'components' | 'variables';

export default function DesignSystem() {
  const { localLibrary, lastScanned, setSetting } = useSettingsStore();
  const [activeTab, setActiveTab] = useState<TabType>('components');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const scanLibrary = () => {
    setIsRefreshing(true);
    parent.postMessage({ pluginMessage: { type: 'get-local-library', requestId: Date.now().toString() } }, '*');
  };

  useEffect(() => {
    if (!localLibrary) {
      scanLibrary();
    }

    const handleMessage = (event: MessageEvent) => {
      const { type, designSystem } = event.data.pluginMessage || {};
      if (type === 'local-library-response') {
        setSetting('localLibrary', designSystem);
        setSetting('lastScanned', Date.now());
        setIsRefreshing(false);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const componentsCount = localLibrary?.components?.length || 0;
  const variablesCount =
    (localLibrary?.paintStyles?.length || 0) +
    (localLibrary?.textStyles?.length || 0) +
    (localLibrary?.effectStyles?.length || 0) +
    (localLibrary?.variables?.length || 0) +
    (localLibrary?.gridStyles?.length || 0);

  return (
    <div className="flex flex-col h-full bg-figma-bg overflow-y-auto">

      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-3 pb-2 sticky top-0 bg-figma-bg z-10">
        <div>
          <h1 className="text-figma-11 font-semibold text-figma-text">Local Library</h1>
          <p className="text-[10px] text-figma-text-secondary leading-snug mt-px">
            {lastScanned ? `Last scanned ${formatDistanceToNow(lastScanned)} ago` : 'Analyzing file…'}
          </p>
        </div>
        <button
          onClick={scanLibrary}
          disabled={isRefreshing}
          className="flex items-center gap-1 px-2.5 py-1 bg-figma-bg-brand hover:bg-figma-bg-brand-hover active:bg-figma-bg-brand-pressed text-figma-text-onbrand text-figma-11 font-medium rounded-figma-6 transition-colors disabled:opacity-50"
        >
          <RefreshCw size={11} className={isRefreshing ? 'animate-spin' : ''} />
          {isRefreshing ? 'Scanning…' : 'Rescan'}
        </button>
      </div>

      {/* Segmented Control */}
      <div className="px-4 pb-3">
        <div className="flex bg-figma-bg-secondary p-0.5 rounded-figma-6 border border-figma-border">
          <button
            onClick={() => setActiveTab('components')}
            className={`flex-1 py-1 text-figma-11 font-medium rounded-[4px] transition-all ${activeTab === 'components'
              ? 'bg-figma-bg text-figma-text shadow-sm border border-figma-border'
              : 'text-figma-text-secondary hover:text-figma-text border border-transparent'
              }`}
          >
            Components ({componentsCount})
          </button>
          <button
            onClick={() => setActiveTab('variables')}
            className={`flex-1 py-1 text-figma-11 font-medium rounded-[4px] transition-all ${activeTab === 'variables'
              ? 'bg-figma-bg text-figma-text shadow-sm border border-figma-border'
              : 'text-figma-text-secondary hover:text-figma-text border border-transparent'
              }`}
          >
            Variables ({variablesCount})
          </button>
        </div>
      </div>

      <div className="border-t border-figma-border" />

      {/* Content Area */}
      <div className="p-4 flex-1">
        {!localLibrary ? (
          <div className="flex flex-col items-center justify-center h-32 text-figma-text-secondary gap-2 opacity-60">
            <RefreshCw size={16} className="animate-spin" />
            <p className="text-figma-11">Analyzing local file…</p>
          </div>
        ) : activeTab === 'components' ? (
          <ComponentsView components={localLibrary.components || []} />
        ) : (
          <VariablesView library={localLibrary} />
        )}
      </div>

    </div>
  );
}

function ComponentsView({ components }: { components: any[] }) {
  if (components.length === 0) {
    return (
      <div className="text-center py-8 space-y-1.5">
        <ComponentIcon className="mx-auto text-figma-icon-secondary opacity-40" size={20} />
        <p className="text-figma-11 text-figma-text-secondary">No local components found.</p>
        <p className="text-[10px] text-figma-text-tertiary leading-snug">Create components in Figma and click Rescan.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-2">
      {components.map((comp) => (
        <div key={comp.id} className="bg-figma-bg-secondary border border-figma-border rounded-figma-6 py-3 px-2 flex flex-col items-center justify-center text-center gap-1.5 hover:bg-figma-bg-hover transition-colors cursor-default group">
          <ComponentIcon size={13} className="text-figma-icon-brand" />
          <p className="text-figma-11 font-medium text-figma-text truncate w-full">{comp.name}</p>
        </div>
      ))}
    </div>
  );
}

function VariablesView({ library }: { library: any }) {
  const { paintStyles, textStyles, effectStyles, variables, gridStyles } = library;

  const isEmpty =
    !paintStyles?.length &&
    !textStyles?.length &&
    !effectStyles?.length &&
    !variables?.length &&
    !gridStyles?.length;

  if (isEmpty) {
    return (
      <div className="text-center py-8 space-y-1.5">
        <Layers className="mx-auto text-figma-icon-secondary opacity-40" size={20} />
        <p className="text-figma-11 text-figma-text-secondary">No local variables or styles found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">

      {/* Colors */}
      {paintStyles?.length > 0 && (
        <VariablesSection title="COLORS">
          {paintStyles.map((style: any) => {
            const firstPaint = style.paints?.[0];
            let hex = "Mixed";
            let rgbaStr = "transparent";

            if (firstPaint && firstPaint.type === 'SOLID') {
              const r = Math.round(firstPaint.color.r * 255);
              const g = Math.round(firstPaint.color.g * 255);
              const b = Math.round(firstPaint.color.b * 255);
              hex = "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();
              rgbaStr = `rgb(${r}, ${g}, ${b})`;
            } else if (firstPaint?.type?.includes('GRADIENT')) {
              hex = "Gradient";
            }

            return (
              <VariableRow
                key={style.id}
                icon={<div className="w-3.5 h-3.5 rounded-full border border-figma-border shrink-0" style={{ background: rgbaStr }} />}
                name={style.name}
                value={hex}
              />
            );
          })}
        </VariablesSection>
      )}

      {/* Typography */}
      {textStyles?.length > 0 && (
        <VariablesSection title="TYPOGRAPHY">
          {textStyles.map((style: any) => (
            <VariableRow
              key={style.id}
              icon={<Type size={12} className="text-figma-icon-secondary shrink-0" />}
              name={style.name}
              value={style.fontName ? `${style.fontName.family} ${style.fontSize}px ${style.fontName.style}` : 'Mixed'}
            />
          ))}
        </VariablesSection>
      )}

      {/* Effects */}
      {effectStyles?.length > 0 && (
        <VariablesSection title="EFFECTS">
          {effectStyles.map((style: any) => (
            <VariableRow
              key={style.id}
              icon={<Spline size={12} className="text-figma-icon-secondary shrink-0" />}
              name={style.name}
              value={style.effects?.length ? `${style.effects.length} effect(s)` : 'None'}
            />
          ))}
        </VariablesSection>
      )}

      {/* Native Variables */}
      {variables?.length > 0 && (
        <VariablesSection title="NATIVE VARIABLES">
          {variables.map((v: any) => (
            <VariableRow
              key={v.id}
              icon={<Square size={12} className="text-figma-icon-secondary shrink-0" />}
              name={v.name}
              value={v.resolvedType}
            />
          ))}
        </VariablesSection>
      )}

      {/* Grids */}
      {gridStyles?.length > 0 && (
        <VariablesSection title="GRIDS">
          {gridStyles.map((style: any) => (
            <VariableRow
              key={style.id}
              icon={<Grid size={12} className="text-figma-icon-secondary shrink-0" />}
              name={style.name}
              value={style.layoutGrids?.length ? `${style.layoutGrids.length} grid(s)` : 'None'}
            />
          ))}
        </VariablesSection>
      )}

    </div>
  );
}

function VariablesSection({ title, children }: { title: string, children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <h2 className="text-[10px] font-semibold text-figma-text-secondary uppercase tracking-wider px-0.5 mb-1.5">{title}</h2>
      <div className="flex flex-col gap-0.5">
        {children}
      </div>
    </div>
  );
}

function VariableRow({ icon, name, value }: { icon: React.ReactNode, name: string, value: string }) {
  return (
    <div className="flex items-center justify-between py-2 px-2 rounded-figma-6 hover:bg-figma-bg-hover transition-colors group">
      <div className="flex items-center gap-2.5 min-w-0">
        {icon}
        <span className="text-figma-11 font-medium text-figma-text truncate">{name}</span>
      </div>
      <span className="text-[10px] text-figma-text-secondary ml-2 shrink-0 font-mono group-hover:text-figma-text transition-colors truncate max-w-[45%]">
        {value}
      </span>
    </div>
  );
}
