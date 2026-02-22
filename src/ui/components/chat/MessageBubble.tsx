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
        "flex w-full gap-2 py-1.5 px-1 animate-msg-in",
        isUser ? "flex-row-reverse" : "flex-row"
      )}
    >
      <div className={cn(
        "flex h-6 w-6 shrink-0 items-center justify-center rounded-full",
        isUser
          ? "bg-figma-bg-brand"
          : "bg-figma-bg-inverse"
      )}>
        {isUser
          ? <User className="h-3 w-3 text-figma-icon-onbrand" />
          : <Bot className="h-3 w-3 text-figma-icon-oninverse" />
        }
      </div>
      <div
        className={cn(
          "flex max-w-[80%] rounded-xl px-3 py-2 text-figma-11 leading-relaxed",
          isUser
            ? "bg-figma-bg-brand text-figma-text-onbrand rounded-tr-sm"
            : "bg-figma-bg-secondary text-figma-text border border-figma-border rounded-tl-sm"
        )}
      >
        <p className="whitespace-pre-wrap">{content}</p>
      </div>
    </div>
  );
}