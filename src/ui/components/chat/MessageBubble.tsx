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
      <div
        className={cn(
          "flex max-w-[80%] rounded-xl px-3 py-2 text-figma-11 leading-relaxed",
          isUser
            ? "bg-figma-bg-secondary text-figma-text border border-figma-border rounded-tr-sm"
            : "bg-transparent text-figma-text rounded-tl-sm pl-0"
        )}
      >
        <p className="whitespace-pre-wrap">{content}</p>
      </div>
    </div>
  );
}