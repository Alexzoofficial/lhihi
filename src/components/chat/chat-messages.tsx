import React, { useEffect, useRef } from 'react';
import type { Message } from '@/lib/types';
import { ChatMessage } from './chat-message';
import { Skeleton } from '../ui/skeleton';
import { LhihiLogo } from '../icons';
import { Avatar, AvatarFallback } from '../ui/avatar';


interface ChatMessagesProps {
  messages: Message[];
  isResponding: boolean;
}

export function ChatMessages({ messages, isResponding }: ChatMessagesProps) {
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages, isResponding]);

  return (
    <div className="py-6 md:py-10">
        <div className="space-y-6 max-w-3xl mx-auto w-full px-4" ref={scrollAreaRef}>
        {messages.map((message) => (
            <ChatMessage key={message.id} {...message} />
        ))}
        {isResponding && (
            <div className="flex items-start gap-4 p-4">
                <Avatar className="w-8 h-8 border">
                    <AvatarFallback className='bg-primary/10'>
                        <LhihiLogo className="text-primary" />
                    </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-2 pt-1">
                    <p className="font-semibold text-sm">lhihi AI</p>
                    <div className="flex flex-col gap-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-4 w-48" />
                    </div>
                </div>
            </div>
        )}
        </div>
    </div>
  );
}