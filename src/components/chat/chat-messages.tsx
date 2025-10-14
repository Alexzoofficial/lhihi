import React, { useEffect, useRef } from 'react';
import type { Message } from '@/lib/types';
import { ChatMessage } from './chat-message';
import { Skeleton } from '../ui/skeleton';
import { LhihiLogo } from '../icons';
import { Avatar, AvatarFallback } from '../ui/avatar';


interface ChatMessagesProps {
  messages: Message[];
  isResponding: boolean;
  onRegenerate: (messageIndex: number) => void;
}

export function ChatMessages({ messages, isResponding, onRegenerate }: ChatMessagesProps) {
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
            />
        ))}
        {isResponding && (
            <div className="flex items-start gap-4">
                <div className="flex flex-col gap-2 p-3 rounded-2xl bg-muted rounded-bl-none">
                    <div className="flex items-center gap-2">
                        <Skeleton className="h-4 w-4 rounded-full" />
                        <Skeleton className="h-4 w-16" />
                    </div>
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-4 w-32" />
                </div>
            </div>
        )}
        </div>
    </div>
  );
}
