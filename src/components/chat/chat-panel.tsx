'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { generateResponse } from '@/ai/flows/generate-response';
import type { Message, Attachment } from '@/lib/types';
import { ChatMessages } from './chat-messages';
import { ChatInput } from './chat-input';
import { LhihiLogo } from '../icons';
import { Button } from '../ui/button';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { UserIcon } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const formSchema = z
  .object({
    message: z.string(),
    attachments: z.array(z.any()),
  })
  .refine((data) => data.message.length > 0 || data.attachments.length > 0, {
    message: 'Message or attachment cannot be empty.',
    path: ['message'],
  });

type FormValues = z.infer<typeof formSchema>;

export default function ChatPanel() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isResponding, setIsResponding] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      message: '',
      attachments: [],
    },
  });

  const onSubmit = async (data: FormValues) => {
    setIsResponding(true);
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: data.message,
      attachments: data.attachments,
    };

    setMessages((prev) => [...prev, userMessage]);
    form.reset();

    const conversationHistory = [...messages, userMessage]
      .map((msg) => `${msg.role}: ${msg.content}`)
      .join('\n');

    try {
      // TODO: Pass attachments to the AI flow
      const result = await generateResponse({
        conversationHistory: conversationHistory,
        userInput: data.message,
      });

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: result.response,
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error generating response:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsResponding(false);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const newAttachments = Array.from(files).map((file) => ({
        name: file.name,
        type: file.type,
        size: file.size,
        preview: URL.createObjectURL(file),
        file: file,
      }));
      const currentAttachments = form.getValues('attachments');
      form.setValue('attachments', [...currentAttachments, ...newAttachments]);
    }
  };

  const removeAttachment = (index: number) => {
    const currentAttachments = form.getValues('attachments');
    const newAttachments = currentAttachments.filter((_, i) => i !== index);
    form.setValue('attachments', newAttachments);
  };

  const exampleQueries = [
    'What is Genkit?',
    'Explain the importance of AI in modern applications.',
    'How do Next.js server components work?',
    'Write a poem about coding.',
  ];

  return (
    <main className="flex flex-col h-full max-h-screen">
      <header className="flex items-center justify-between p-2 border-b md:hidden">
        <SidebarTrigger />
        <h1 className="text-lg font-semibold">Alexzo Intelligence</h1>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <UserIcon className="size-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem>Settings</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Log out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>
      <div className="flex-1 overflow-y-auto">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full px-4">
            <div className="text-center">
              <div className="inline-block p-3 rounded-full bg-muted/70 mb-4">
                <LhihiLogo className="size-10 text-primary" />
              </div>
              <h1 className="text-2xl font-semibold mb-2">
                Alexzo Intelligence
              </h1>
              <p className="text-muted-foreground">
                Your smart and helpful assistant.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-3xl mt-12">
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
      <div className="p-4 md:p-6 bg-transparent">
        <ChatInput
          form={form}
          onSubmit={form.handleSubmit(onSubmit)}
          isResponding={isResponding}
          onFileChange={handleFileChange}
          removeAttachment={removeAttachment}
        />
        <p className="text-center text-xs text-muted-foreground mt-3">
          lhihi AI can make mistakes. Consider checking important information.
        </p>
      </div>
    </main>
  );
}
