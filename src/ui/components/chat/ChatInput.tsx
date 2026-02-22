import React, { useState, KeyboardEvent } from 'react';
import { Send, Loader2, ChevronDown, MousePointer2 } from 'lucide-react';

export type ModelType = 'gemini-2.5-flash' | 'gemini-3-flash-preview';

interface ChatInputProps {
  onSend: (message: string, model: ModelType) => void;
  isLoading?: boolean;
  selection?: { id: string; name: string; type: string }[];
}

export function ChatInput({ onSend, isLoading, selection = [] }: ChatInputProps) {
  const [input, setInput] = useState('');
  const [selectedModel, setSelectedModel] = useState<ModelType>('gemini-3-flash-preview');
  const [showModelMenu, setShowModelMenu] = useState(false);

  const handleSend = (text: string | any) => {
    // If text is an event (from onClick), use input state. Otherwise use the provided text.
    const messageToSend = typeof text === 'string' ? text : input;

    if (!messageToSend.trim() || isLoading) return;
    onSend(messageToSend, selectedModel);
    setInput('');
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend(input);
    }
  };

  const toggleModelMenu = () => {
    setShowModelMenu(!showModelMenu);
  };

  const selectModel = (model: ModelType) => {
    setSelectedModel(model);
    setShowModelMenu(false);
  };

  return (
    <div className="flex flex-col gap-1 p-2 bg-figma-bg rounded-xl border border-figma-border shadow-sm focus-within:border-figma-border-brand focus-within:ring-1 focus-within:ring-figma-border-brand/30 transition-all">
      {/* Selection Context */}
      {selection.length > 0 && (
        <div className="flex items-center gap-2 px-2.5 py-1.5 bg-figma-bg-secondary rounded-md mb-1 border border-figma-border">
          <MousePointer2 className="h-3.5 w-3.5 text-figma-text-brand shrink-0" />
          <div className="flex flex-col min-w-0">
            <span className="text-[11px] font-medium text-figma-text truncate leading-tight">
              {selection.length === 1 ? selection[0].name : `${selection.length} items selected`}
            </span>
            <span className="text-[10px] text-figma-text-tertiary leading-tight lowercase">
              {selection.length === 1 ? selection[0].type : 'Multiple objects'}
            </span>
          </div>
        </div>
      )}

      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Describe the UI you want to build..."
        className="max-h-32 min-h-[32px] w-full resize-none bg-transparent px-2 py-1.5 text-figma-11 text-figma-text placeholder:text-figma-text-tertiary focus:outline-none"
        rows={1}
      />

      <div className="flex items-center justify-between px-1 pb-1">
        {/* Model Selector */}
        <div className="relative">
          <button
            onClick={toggleModelMenu}
            className="flex items-center gap-1 text-figma-11 font-medium text-figma-text-secondary hover:text-figma-text px-1 py-1 rounded-sm transition-colors"
          >
            {selectedModel === 'gemini-2.5-flash' ? 'Gemini 2.5 Flash' : 'Gemini 3.0 Flash Preview'}
            <ChevronDown className="h-3 w-3" />
          </button>

          {showModelMenu && (
            <div className="absolute bottom-full left-0 mb-1 w-40 rounded-figma-2 border border-figma-border bg-figma-bg shadow-figma-menu py-1 z-20">
              <button
                onClick={() => selectModel('gemini-2.5-flash')}
                className={`w-full text-left px-3 py-1.5 text-figma-11 hover:bg-figma-bg-hover ${selectedModel === 'gemini-2.5-flash' ? 'text-figma-text-brand font-medium' : 'text-figma-text'}`}
              >
                Gemini 2.5 Flash
              </button>
              <button
                onClick={() => selectModel('gemini-3-flash-preview')}
                className={`w-full text-left px-3 py-1.5 text-figma-11 hover:bg-figma-bg-hover ${selectedModel === 'gemini-3-flash-preview' ? 'text-figma-text-brand font-medium' : 'text-figma-text'}`}
              >
                Gemini 3.0 Flash Preview
              </button>
            </div>
          )}
        </div>

        <button
          onClick={handleSend}
          disabled={!input.trim() || isLoading}
          className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-figma-bg-brand text-figma-text-onbrand shadow-sm transition-all duration-150 hover:bg-figma-bg-brand-hover active:scale-95 disabled:bg-figma-bg-pressed disabled:text-figma-text-secondary disabled:cursor-not-allowed disabled:active:scale-100 disabled:shadow-none"
        >
          {isLoading ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <Send className="h-3 w-3" />
          )}
        </button>
      </div>
    </div>
  );
}