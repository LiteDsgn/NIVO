import React from 'react';
import { cn } from '@/lib/utils';
import { User, Bot } from 'lucide-react';

interface MessageBubbleProps {
  role: 'user' | 'assistant';
  content: string;
}

export function MessageBubble({ role, content }: MessageBubbleProps) {
  const isUser = role === 'user';

  return (
    <div
      className={cn(
        "flex w-full gap-2",
        isUser ? "flex-row-reverse" : "flex-row"
      )}
    >
      <div className={cn(
        "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border",
        isUser
          ? "bg-figma-bg-brand border-figma-border-brand"
          : "bg-figma-bg-inverse border-figma-border-strong"
      )}>
        {isUser ? <User className="h-[14px] w-[14px] text-figma-icon-onbrand" /> : <Bot className="h-[14px] w-[14px] text-figma-icon-oninverse" />}
      </div>
      <div
        className={cn(
          "flex max-w-[85%] flex-col gap-1 rounded-figma-6 px-3 py-2 text-figma-11",
          isUser
            ? "bg-figma-bg-brand text-figma-text-onbrand"
            : "bg-figma-bg text-figma-text border border-figma-border shadow-sm"
        )}
      >
        <p className="whitespace-pre-wrap">{content}</p>
      </div>
    </div>
  );
}