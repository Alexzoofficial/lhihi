
import React, { useEffect, useRef } from 'react';
import type { Message } from '@/lib/types';
import { ChatMessage } from './chat-message';
import { Skeleton } from '../ui/skeleton';

interface ChatMessagesProps {
  messages: Message[];
  isResponding: boolean;
  onRegenerate: (messageIndex: number) => void;
  onSelectQuery: (query: string) => void;
  onAudioGenerated: (messageId: string, audioUrl: string) => void;
  onEditMessage: (messageId: string, newContent: string) => void;
}

export function ChatMessages({ messages, isResponding, onRegenerate, onSelectQuery, onAudioGenerated, onEditMessage }: ChatMessagesProps) {
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages, isResponding]);

  return (
    <div className="py-6 md:py-10">
        <div className="space-y-4 max-w-3xl mx-auto w-full px-4" ref={scrollAreaRef}>
        {messages.map((message, index) => (
            <ChatMessage
              key={message.id}
              {...message}
              onRegenerate={message.role === 'assistant' ? () => onRegenerate(index) : undefined}
              onSelectQuery={onSelectQuery}
              onAudioGenerated={onAudioGenerated}
              onEdit={message.role === 'user' ? (newContent: string) => onEditMessage(message.id, newContent) : undefined}
            />
        ))}
        {isResponding && (
            <div className="flex items-start gap-4">
                <div className="flex flex-col gap-2 p-3 rounded-2xl rounded-bl-none w-full max-w-[85%]">
                    <div className="flex items-center gap-2 font-semibold text-sm">
                        Thinking...
                    </div>
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-4/5" />
                </div>
            </div>
        )}
        </div>
    </div>
  );
}
