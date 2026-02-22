import React from 'react';

export function TypingIndicator() {
    return (
        <div className="flex items-center gap-2 px-4 py-3">
            <div className="flex items-center gap-1.5 px-3 py-2 rounded-figma-6 bg-figma-bg border border-figma-border shadow-sm">
                <div className="flex gap-[3px] items-center">
                    <span className="typing-dot w-1.5 h-1.5 rounded-full bg-figma-text-secondary" style={{ animationDelay: '0ms' }} />
                    <span className="typing-dot w-1.5 h-1.5 rounded-full bg-figma-text-secondary" style={{ animationDelay: '150ms' }} />
                    <span className="typing-dot w-1.5 h-1.5 rounded-full bg-figma-text-secondary" style={{ animationDelay: '300ms' }} />
                </div>
                <span className="text-[10px] text-figma-text-tertiary ml-1">Generating design...</span>
            </div>
        </div>
    );
}
