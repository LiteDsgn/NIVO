import React from 'react';
import { Check, X } from 'lucide-react';

interface DraftControlsProps {
  onAccept: () => void;
  onDiscard: () => void;
}

export function DraftControls({ onAccept, onDiscard }: DraftControlsProps) {
  return (
    <div className="absolute bottom-[52px] left-2 right-2 z-50 animate-slide-up">
      <div className="bg-figma-bg-inverse text-figma-text-oninverse rounded-lg shadow-lg p-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2 ml-1">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-figma-11 font-medium">Draft ready</span>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={onDiscard}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-md hover:bg-white/10 text-figma-11 font-medium transition-all duration-150 active:scale-95"
          >
            <X size={12} />
            Discard
          </button>
          <button
            onClick={onAccept}
            className="flex items-center gap-1 px-3 py-1.5 bg-figma-bg-brand text-figma-text-onbrand rounded-md hover:bg-figma-bg-brand-hover text-figma-11 font-medium transition-all duration-150 shadow-sm active:scale-95"
          >
            <Check size={12} />
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}
