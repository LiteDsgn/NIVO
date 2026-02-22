import React, { useState, useRef, useEffect } from 'react';
import { MessageBubble } from '@/components/chat/MessageBubble';
import { ChatInput, ModelType } from '@/components/chat/ChatInput';
import { DraftControls } from '@/components/chat/DraftControls';
import { QuickActions } from '@/components/chat/QuickActions';
import { WelcomeState } from '@/components/chat/WelcomeState';
import { TypingIndicator } from '@/components/chat/TypingIndicator';
import { generateUI } from '@/lib/services/gemini';
import { useSettingsStore } from '@/lib/stores/settingsStore';
import { useBridge } from '@/hooks/useBridge';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  model?: ModelType;
}

export default function Home() {
  // Connect to MCP WebSocket bridge (Antigravity ↔ Nivo)
  useBridge();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [draftMode, setDraftMode] = useState(false);
  const [selection, setSelection] = useState<{ id: string; name: string; type: string }[]>([]);
  const { brandContext, enforceWCAG } = useSettingsStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const { type, selection: newSelection, status } = event.data.pluginMessage || {};

      if (type === 'selection-changed') {
        setSelection(newSelection);
      } else if (type === 'generation-complete') {
        if (status === 'success') {
          setDraftMode(true);
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const handleDraftAccept = () => {
    parent.postMessage({ pluginMessage: { type: 'accept-draft' } }, '*');
    setDraftMode(false);
  };

  const handleDraftDiscard = () => {
    parent.postMessage({ pluginMessage: { type: 'discard-draft' } }, '*');
    setDraftMode(false);
  };

  const getSelectionContext = (): Promise<{ context: { id: string } | null; designSystem: { paintStyles: unknown; textStyles: unknown; } | null }> => {
    return new Promise((resolve) => {
      const requestId = Date.now().toString();

      const handler = (event: MessageEvent) => {
        const { type, context, designSystem, requestId: responseId } = event.data.pluginMessage || {};
        if (type === 'selection-context-response' && responseId === requestId) {
          window.removeEventListener('message', handler);
          resolve({ context, designSystem });
        }
      };

      window.addEventListener('message', handler);
      parent.postMessage({ pluginMessage: { type: 'get-selection-context', requestId } }, '*');

      // Timeout fallback
      setTimeout(() => {
        window.removeEventListener('message', handler);
        resolve({ context: null, designSystem: null });
      }, 1000);
    });
  };

  const handleSendMessage = async (content: string, model: ModelType) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content,
      model
    };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      console.log(`Sending request to ${model} with prompt: ${content}`);

      const { context, designSystem } = await getSelectionContext();

      const uiStructure = await generateUI(content, model, context, designSystem, {
        brandContext,
        enforceWCAG,
      });

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: context
          ? `I've updated the design for "${content}".`
          : `I've generated a design for "${content}". Check your canvas!`
      };
      setMessages(prev => [...prev, assistantMessage]);

      parent.postMessage({
        pluginMessage: {
          type: 'generate-ui-from-json',
          structure: uiStructure,
          prompt: content,
          replaceNodeId: context ? context.id : undefined
        }
      }, '*');

    } catch (error) {
      console.error("Failed to generate UI:", error);
      let errorDetail = "An unknown error occurred.";
      if (error instanceof Error) {
        const msg = error.message;
        if (msg.includes("API_KEY_INVALID") || msg.includes("API key not valid") || msg.includes("Missing Gemini API Key")) {
          errorDetail = "Your API key is invalid or missing. Go to Settings to update it.";
        } else if (msg.includes("429") || msg.includes("quota")) {
          errorDetail = "API quota exceeded. Please wait a moment and try again.";
        } else if (msg.includes("404") || msg.includes("not found")) {
          errorDetail = "The selected model is unavailable. Try switching models.";
        } else {
          errorDetail = msg;
        }
      }
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `⚠️ ${errorDetail}`
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const hasMessages = messages.length > 0;

  return (
    <div className="flex flex-col h-full bg-figma-bg relative">
      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto scroll-smooth">
        {hasMessages ? (
          <div className="flex flex-col gap-0.5 p-2">
            {messages.map((msg) => (
              <MessageBubble
                key={msg.id}
                role={msg.role}
                content={msg.content}
              />
            ))}
            {isLoading && <TypingIndicator />}
            <div ref={messagesEndRef} />
          </div>
        ) : (
          <WelcomeState onSuggestionClick={(prompt) => handleSendMessage(prompt, 'gemini-3-flash-preview')} />
        )}
      </div>

      {/* Quick Actions (Floating above input tray) */}
      {!draftMode && selection.length > 0 && (
        <div className="px-3 pb-2 pt-1">
          <QuickActions
            selection={selection}
            onAction={(prompt) => handleSendMessage(prompt, 'gemini-3-flash-preview')}
          />
        </div>
      )}

      {/* Floating Input Area */}
      <div className={`px-3 pb-3 transition-all duration-200 bg-transparent ${draftMode ? 'pointer-events-none opacity-40' : ''}`}>
        <ChatInput onSend={handleSendMessage} isLoading={isLoading} selection={selection} />
      </div>
      {/* Draft Controls */}
      {draftMode && (
        <DraftControls onAccept={handleDraftAccept} onDiscard={handleDraftDiscard} />
      )}
    </div>
  );
}