import React, { useState, KeyboardEvent } from 'react';
import { Send, Loader2, ChevronDown } from 'lucide-react';

export type ModelType = 'gemini-2.5-flash' | 'gemini-2.5-pro';

interface ChatInputProps {
  onSend: (message: string, model: ModelType) => void;
  isLoading?: boolean;
}

export function ChatInput({ onSend, isLoading }: ChatInputProps) {
  const [input, setInput] = useState('');
  const [selectedModel, setSelectedModel] = useState<ModelType>('gemini-2.5-flash');
  const [showModelMenu, setShowModelMenu] = useState(false);

  const handleSend = () => {
    if (!input.trim() || isLoading) return;
    onSend(input, selectedModel);
    setInput('');
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
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
    <div className="border-t border-figma-border bg-figma-bg p-2 flex flex-col gap-1">
      {/* Model Selector */}
      <div className="relative">
        <button
          onClick={toggleModelMenu}
          className="flex items-center gap-1 text-figma-11 font-medium text-figma-text-secondary hover:text-figma-text px-1 py-1 rounded-sm transition-colors"
        >
          {selectedModel === 'gemini-2.5-flash' ? 'Gemini 2.5 Flash' : 'Gemini 2.5 Pro'}
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
              onClick={() => selectModel('gemini-2.5-pro')}
              className={`w-full text-left px-3 py-1.5 text-figma-11 hover:bg-figma-bg-hover ${selectedModel === 'gemini-2.5-pro' ? 'text-figma-text-brand font-medium' : 'text-figma-text'}`}
            >
              Gemini 2.5 Pro
            </button>
          </div>
        )}
      </div>

      <div className="relative flex items-end gap-1 rounded-figma-2 border border-transparent hover:border-figma-border bg-figma-bg focus-within:ring-1 focus-within:ring-figma-border-brand focus-within:border-figma-border-brand transition-all p-1">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Describe the UI you want to build..."
          className="max-h-32 min-h-[32px] w-full resize-none bg-transparent px-2 py-1.5 text-figma-11 text-figma-text placeholder:text-figma-text-tertiary focus:outline-none"
          rows={1}
        />
        <button
          onClick={handleSend}
          disabled={!input.trim() || isLoading}
          className="mb-[2px] inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-sm bg-figma-bg-brand text-figma-text-onbrand transition-colors hover:bg-figma-bg-brand-hover disabled:bg-figma-bg-pressed disabled:text-figma-text-secondary disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <Send className="h-3 w-3" />
          )}
        </button>
      </div>
      <div className="mt-1 text-[10px] text-figma-text-tertiary text-center">
        Press Enter to generate
      </div>
    </div>
  );
}