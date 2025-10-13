'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { generateResponse } from '@/ai/flows/generate-response';
import type { Message } from '@/lib/types';
import { ChatMessages } from './chat-messages';
import { ChatInput } from './chat-input';
import { LhihiLogo } from '../icons';
import { Button } from '../ui/button';

const formSchema = z.object({
  message: z.string().min(1, 'Message cannot be empty.'),
});

type FormValues = z.infer<typeof formSchema>;

export default function ChatPanel() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isResponding, setIsResponding] = useState(false);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      message: '',
    },
  });

  const onSubmit = async (data: FormValues) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: data.message,
    };
    
    setMessages(prev => [...prev, userMessage]);
    setIsResponding(true);
    form.reset();

    const conversationHistory = [...messages, userMessage]
      .map(msg => `${msg.role}: ${msg.content}`)
      .join('\n');
      
    try {
      const result = await generateResponse({
        conversationHistory: conversationHistory,
        userInput: data.message,
      });

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: result.response,
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error generating response:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsResponding(false);
    }
  };

  const exampleQueries = [
    "What is Genkit?",
    "Explain the importance of AI in modern applications.",
    "How do Next.js server components work?",
    "Write a poem about coding.",
  ];

  return (
    <main className="flex flex-col h-full max-h-screen">
      <div className="flex-1 overflow-y-auto">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full px-4">
            <div className="p-4 rounded-full bg-primary/10 mb-4 mt-16">
              <LhihiLogo className="size-12 text-primary" />
            </div>
            <h1 className="text-2xl font-semibold mb-6 text-center">How can I help you today?</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-3xl">
              {exampleQueries.map((query) => (
                <Button 
                  key={query}
                  variant="outline" 
                  className="p-4 h-auto text-left justify-start bg-background/50 hover:bg-white"
                  onClick={() => form.setValue('message', query)}
                >
                  {query}
                </Button>
              ))}
            </div>
          </div>
        ) : (
          <ChatMessages messages={messages} isResponding={isResponding} />
        )}
      </div>
      <div className="p-4 md:p-6 bg-transparent border-t-0">
        <ChatInput
          form={form}
          onSubmit={form.handleSubmit(onSubmit)}
          isResponding={isResponding}
        />
        <p className="text-center text-xs text-muted-foreground mt-3">
            lhihi AI can make mistakes. Consider checking important information.
        </p>
      </div>
    </main>
  );
}
