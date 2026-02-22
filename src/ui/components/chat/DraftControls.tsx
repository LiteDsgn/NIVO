import React from 'react';
import { Check, X, RotateCcw } from 'lucide-react';

interface DraftControlsProps {
  onAccept: () => void;
  onDiscard: () => void;
}

export function DraftControls({ onAccept, onDiscard }: DraftControlsProps) {
  return (
    <div className="absolute bottom-2 left-2 right-2 bg-figma-bg-inverse text-figma-text-oninverse rounded-md shadow-lg p-2 flex items-center justify-between z-50">
      <div className="flex items-center gap-2">
        <span className="text-xs font-medium ml-1">Draft generated</span>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={onDiscard}
          className="flex items-center gap-1 px-2 py-1 rounded hover:bg-white/10 text-xs font-medium transition-colors"
        >
          <X size={14} />
          Discard
        </button>
        <button
          onClick={onAccept}
          className="flex items-center gap-1 px-3 py-1 bg-figma-bg-brand text-figma-text-onbrand rounded hover:bg-figma-bg-brand-hover text-xs font-medium transition-colors shadow-sm"
        >
          <Check size={14} />
          Accept
        </button>
      </div>
    </div>
  );
}
