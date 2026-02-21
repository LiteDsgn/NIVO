import React from 'react';
import { Zap, Moon, Type, Layout, Copy, Wand2 } from 'lucide-react';

interface QuickActionsProps {
  selection: { id: string; name: string; type: string }[];
  onAction: (prompt: string) => void;
}

export function QuickActions({ selection, onAction }: QuickActionsProps) {
  if (selection.length === 0) return null;

  const nodeType = selection[0].type;
  
  // Define actions based on selection type
  const getActions = () => {
    // Common actions for all types
    const commonActions = [
      { label: 'Variations', icon: <Wand2 size={12} />, prompt: 'Generate 3 distinct design variations of this selected element.' },
    ];

    if (nodeType === 'TEXT') {
      return [
        { label: 'Shorten', icon: <Type size={12} />, prompt: 'Rewrite this text to be more concise and punchy.' },
        { label: 'Fix Grammar', icon: <Type size={12} />, prompt: 'Fix any grammar or spelling errors in this text.' },
        { label: 'Translate', icon: <Type size={12} />, prompt: 'Translate this text to Spanish.' },
        ...commonActions
      ];
    }

    if (nodeType === 'FRAME' || nodeType === 'COMPONENT' || nodeType === 'INSTANCE') {
      return [
        { label: 'Dark Mode', icon: <Moon size={12} />, prompt: 'Convert this design to dark mode, ensuring proper contrast.' },
        { label: 'Auto Layout', icon: <Layout size={12} />, prompt: 'Apply Auto Layout to this frame with proper padding and spacing.' },
        { label: 'Responsive', icon: <Layout size={12} />, prompt: 'Make this layout responsive for mobile screens.' },
        ...commonActions
      ];
    }

    // Default for other types (RECTANGLE, etc)
    return commonActions;
  };

  const actions = getActions();

  return (
    <div className="flex flex-wrap gap-1.5 px-2 pb-2">
      {actions.map((action, index) => (
        <button
          key={index}
          onClick={() => onAction(action.prompt)}
          className="flex items-center gap-1.5 px-2 py-1 bg-figma-bg-secondary hover:bg-figma-bg-hover border border-figma-border rounded-full transition-colors text-[10px] text-figma-text font-medium"
        >
          {action.icon}
          {action.label}
        </button>
      ))}
    </div>
  );
}
