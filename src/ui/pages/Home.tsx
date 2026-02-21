import React, { useState, useRef, useEffect } from 'react';
import { MessageBubble } from '@/components/chat/MessageBubble';
import { ChatInput, ModelType } from '@/components/chat/ChatInput';
import { generateUI } from '@/lib/services/gemini';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  model?: ModelType;
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hello! I\'m Nivo. Describe the UI you want to build, and I\'ll create it for you.'
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [selection, setSelection] = useState<{ id: string; name: string; type: string }[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const { type, selection: newSelection } = event.data.pluginMessage || {};
      if (type === 'selection-changed') {
        setSelection(newSelection);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

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
    // Add user message
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

      // Call Gemini API
      const uiStructure = await generateUI(content, model, context, designSystem);

      // Add assistant message
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: context
          ? `I've updated the design for "${content}" using ${model}.`
          : `I've generated a design for "${content}" using ${model}.`
      };
      setMessages(prev => [...prev, assistantMessage]);

      // Send generated structure to Figma
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
        if (msg.includes("API_KEY_INVALID") || msg.includes("API key not valid")) {
          errorDetail = "Your Gemini API key is invalid. Please update it in Settings or in your .env file.";
        } else if (msg.includes("429") || msg.includes("quota")) {
          errorDetail = "You've exceeded your Gemini API quota. Please wait a minute or upgrade your plan.";
        } else if (msg.includes("404") || msg.includes("not found")) {
          errorDetail = "The selected model is not available. Please try a different model.";
        } else {
          errorDetail = msg;
        }
      }
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `Sorry, I encountered an error: ${errorDetail}`
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-figma-bg">
      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto scroll-smooth p-2 flex flex-col gap-2">
        {messages.map((msg) => (
          <MessageBubble
            key={msg.id}
            role={msg.role}
            content={msg.content}
          />
        ))}
        {isLoading && (
          <div className="px-3 py-2 text-figma-11 text-figma-text-secondary italic">
            Generating...
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <ChatInput onSend={handleSendMessage} isLoading={isLoading} selection={selection} />
    </div>
  );
}