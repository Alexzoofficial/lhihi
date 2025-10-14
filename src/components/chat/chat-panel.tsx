'use client';

import React, { useState, useEffect } from 'react';
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
import { ChevronDown, UserIcon } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useUser, useFirebase } from '@/firebase';
import { signInWithGoogle, signOutWithGoogle } from '@/firebase/auth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getAuth } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';
import { addDoc, collection, serverTimestamp, onSnapshot, query, where, orderBy, doc, getDoc } from 'firebase/firestore';

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
  const { user, loading } = useUser();
  const { toast } = useToast();
  const { firestore } = useFirebase();
  const [chatId, setChatId] = useState<string | null>(null);

  useEffect(() => {
    if (!firestore || !user || !chatId) {
      setMessages([]);
      return;
    };

    const messagesQuery = query(
      collection(firestore, `users/${user.uid}/chats/${chatId}/messages`),
      orderBy('createdAt')
    );

    const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
      const newMessages = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      } as Message));
      setMessages(newMessages);
    });

    return () => unsubscribe();
  }, [firestore, user, chatId]);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      message: '',
      attachments: [],
    },
  });

  const handleLogin = async () => {
    try {
      await signInWithGoogle();
      toast({
        title: 'Success',
        description: 'You have been logged in.',
      });
    } catch (error) {
      console.error('Error signing in with Google:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to log in. Please try again.',
      });
    }
  };

  const handleLogout = async () => {
    try {
      const auth = getAuth();
      await signOutWithGoogle(auth);
      setChatId(null);
      setMessages([]);
      toast({
        title: 'Success',
        description: 'You have been logged out.',
      });
    } catch (error) {
      console.error('Error signing out:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to log out. Please try again.',
      });
    }
  };

  const onSubmit = async (data: FormValues) => {
    if (!user || !firestore) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'You must be logged in to send a message.',
      });
      return;
    }
    
    setIsResponding(true);

    let currentChatId = chatId;
    // Create a new chat if one doesn't exist
    if (!currentChatId) {
      const chatRef = await addDoc(collection(firestore, `users/${user.uid}/chats`), {
        name: data.message.substring(0, 30),
        createdAt: serverTimestamp(),
      });
      currentChatId = chatRef.id;
      setChatId(currentChatId);
    }
    
    const userMessage: Omit<Message, 'id'> = {
      role: 'user',
      content: data.message,
      attachments: data.attachments,
      createdAt: serverTimestamp(),
    };

    const messagesCol = collection(firestore, `users/${user.uid}/chats/${currentChatId}/messages`);
    await addDoc(messagesCol, userMessage);
    
    form.reset();

    const conversationHistory = [...messages, {...userMessage, id: 'temp'}]
      .map((msg) => `${msg.role}: ${msg.content}`)
      .join('\n');

    try {
      const result = await generateResponse({
        conversationHistory: conversationHistory,
        userInput: data.message,
      });

      const assistantMessage: Omit<Message, 'id'> = {
        role: 'assistant',
        content: result.response,
        createdAt: serverTimestamp(),
      };
      await addDoc(messagesCol, assistantMessage);
    } catch (error) {
      console.error('Error generating response:', error);
      const errorMessage: Omit<Message, 'id'> = {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        createdAt: serverTimestamp(),
      };
      await addDoc(messagesCol, errorMessage);
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
  
  const onExampleQueryClick = (query: string) => {
    form.setValue('message', query);
    form.handleSubmit(onSubmit)();
  };

  return (
    <main className="flex flex-col h-full max-h-screen">
      <header className="flex items-center justify-between p-2 border-b md:hidden">
        <SidebarTrigger />
        <h1 className="text-lg font-semibold">Alexzo Intelligence</h1>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              {loading ? (
                <div className="h-5 w-5 rounded-full bg-gray-300 animate-pulse" />
              ) : user ? (
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user.photoURL ?? undefined} alt={user.displayName ?? ''} />
                  <AvatarFallback>
                    {user.displayName?.charAt(0) ?? <UserIcon className="size-5" />}
                  </AvatarFallback>
                </Avatar>
              ) : (
                <UserIcon className="size-5" />
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {user ? (
              <>
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Profile</DropdownMenuItem>
                <DropdownMenuItem>Settings</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>Log out</DropdownMenuItem>
              </>
            ) : (
              <DropdownMenuItem onClick={handleLogin}>Log in with Google</DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </header>
      <div className="flex-1 overflow-y-auto">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full px-4 text-center">
            
            <div className="text-center">
                <div className="inline-block p-3 rounded-full bg-muted/70 mb-4">
                  <LhihiLogo className="size-10 text-primary" />
                </div>
                 <h1 className="text-2xl font-semibold mb-2">
                  How can I help you today?
                </h1>
            </div>
             <div className="mt-4 mb-8">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="px-4 py-2 bg-muted hover:bg-muted/80">
                    Alexzo Intelligence
                    <ChevronDown className="ml-2 size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuLabel>Select a model</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>Alexzo Intelligence</DropdownMenuItem>
                  <DropdownMenuItem disabled>Coming Soon</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-3xl mt-12">
              {exampleQueries.map((query) => (
                <Button
                  key={query}
                  variant="outline"
                  className="p-4 h-auto text-left justify-start bg-background/50 hover:bg-white"
                  onClick={() => onExampleQueryClick(query)}
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
