import React from 'react';
import { Moon, Layout, Wand2, Type } from 'lucide-react';

interface QuickActionsProps {
  selection: { id: string; name: string; type: string }[];
  onAction: (prompt: string) => void;
}

export function QuickActions({ selection, onAction }: QuickActionsProps) {
  if (selection.length === 0) return null;

  const nodeType = selection[0].type;

  const getActions = () => {
    const commonActions = [
      { label: 'Variations', icon: <Wand2 size={11} />, prompt: 'Generate 3 distinct design variations of this selected element.' },
    ];

    if (nodeType === 'TEXT') {
      return [
        { label: 'Shorten', icon: <Type size={11} />, prompt: 'Rewrite this text to be more concise and punchy.' },
        { label: 'Translate', icon: <Type size={11} />, prompt: 'Translate this text to Spanish.' },
        ...commonActions
      ];
    }

    if (nodeType === 'FRAME' || nodeType === 'COMPONENT' || nodeType === 'INSTANCE') {
      return [
        { label: 'Dark Mode', icon: <Moon size={11} />, prompt: 'Convert this design to dark mode, ensuring proper contrast.' },
        { label: 'Responsive', icon: <Layout size={11} />, prompt: 'Make this layout responsive for mobile screens.' },
        ...commonActions
      ];
    }

    return commonActions;
  };

  const actions = getActions();

  return (
    <div className="flex flex-wrap gap-1 px-0.5">
      {actions.map((action, index) => (
        <button
          key={index}
          onClick={() => onAction(action.prompt)}
          className="group flex items-center gap-1 px-2 py-1 bg-figma-bg hover:bg-figma-bg-hover border border-figma-border hover:border-figma-border-brand/30 rounded-full transition-all duration-150 text-[10px] text-figma-text-secondary hover:text-figma-text font-medium"
        >
          <span className="text-figma-icon-secondary group-hover:text-figma-icon-brand transition-colors">{action.icon}</span>
          {action.label}
        </button>
      ))}
    </div>
  );
}
