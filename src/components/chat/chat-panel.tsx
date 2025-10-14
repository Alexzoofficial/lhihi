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
import { Check, ChevronDown, UserIcon } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from '@/components/ui/dropdown-menu';
import { useUser, useFirebase } from '@/firebase';
import { signInWithGoogle, signOutWithGoogle } from '@/firebase/auth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getAuth } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';
import { addDoc, collection, serverTimestamp, onSnapshot, query, orderBy } from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';


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

export default function ChatPanel({ chatId: currentChatId, setChatId: setCurrentChatId }: { chatId: string | null, setChatId: (id: string | null) => void }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isResponding, setIsResponding] = useState(false);
  const { user, loading } = useUser();
  const { toast } = useToast();
  const { firestore } = useFirebase();
  const [model, setModel] = useState('alexzo');

  useEffect(() => {
    if (!firestore || !user || !currentChatId) {
      setMessages([]);
      return;
    };

    const messagesQuery = query(
      collection(firestore, `users/${user.uid}/chats/${currentChatId}/messages`),
      orderBy('createdAt', 'asc')
    );

    const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
      const newMessages: Message[] = [];
      snapshot.forEach((doc) => {
        newMessages.push({
          id: doc.id,
          ...doc.data(),
        } as Message);
      });
      setMessages(newMessages);
    }, (error) => {
        console.error("Error fetching messages:", error);
        toast({
            variant: "destructive",
            title: "Error",
            description: "Could not fetch chat history.",
        });
    });

    return () => unsubscribe();
  }, [firestore, user, currentChatId, toast]);

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
      setCurrentChatId(null);
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
    setIsResponding(true);

    const userMessage: Message = {
      id: uuidv4(),
      role: 'user',
      content: data.message,
      attachments: data.attachments,
      createdAt: new Date(),
    };

    const currentMessages = [...messages, userMessage];
    setMessages(currentMessages);
    form.reset();

    let activeChatId = currentChatId;

    if (user && firestore) {
      if (!activeChatId) {
        try {
          const chatRef = await addDoc(collection(firestore, `users/${user.uid}/chats`), {
            name: data.message.substring(0, 30),
            createdAt: serverTimestamp(),
          });
          activeChatId = chatRef.id;
          setCurrentChatId(activeChatId);
        } catch (error) {
            console.error("Error creating new chat:", error);
            toast({ variant: 'destructive', title: 'Error', description: 'Could not create new chat.' });
            setIsResponding(false);
            return;
        }
      }
    }

    if (user && firestore && activeChatId) {
        try {
            await addDoc(collection(firestore, `users/${user.uid}/chats/${activeChatId}/messages`), {
                ...userMessage,
                createdAt: serverTimestamp() // Use server timestamp for Firestore
            });
        } catch (error) {
            console.error("Error saving user message:", error);
            toast({ variant: 'destructive', title: 'Error', description: 'Could not save your message.' });
        }
    }

    const conversationHistory = currentMessages
      .map((msg) => `${msg.role}: ${msg.content}`)
      .join('\n');

    try {
      const result = await generateResponse({
        conversationHistory: conversationHistory,
        userInput: data.message,
      });

      const assistantMessage: Message = {
        id: uuidv4(),
        role: 'assistant',
        content: result.response,
        createdAt: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);

      if (user && firestore && activeChatId) {
        await addDoc(collection(firestore, `users/${user.uid}/chats/${activeChatId}/messages`), {
            ...assistantMessage,
            createdAt: serverTimestamp() // Use server timestamp for Firestore
        });
      }
    } catch (error) {
      console.error('Error generating response:', error);
      const errorMessage: Message = {
        id: uuidv4(),
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        createdAt: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
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
    'Create a futuristic story about AI and humanity',
    'Explain quantum computing like I\'m five',
    'Plan a 3-day itinerary for a trip to Tokyo',
    'Write a Python script to scrape a website',
  ];
  
  const onExampleQueryClick = (query: string) => {
    form.setValue('message', query);
    form.handleSubmit(onSubmit)();
  };

  return (
    <main className="flex flex-col h-full max-h-screen">
      <header className="flex items-center justify-between p-2 border-b">
        <div className="flex items-center gap-2">
            <SidebarTrigger className="md:hidden" />
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="px-4 py-2 text-lg font-semibold bg-muted hover:bg-muted/80">
                        Alexzo Intelligence
                        <ChevronDown className="ml-2 size-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                    <DropdownMenuRadioGroup value={model} onValueChange={setModel}>
                        <DropdownMenuRadioItem value="alexzo">
                            Alexzo Intelligence
                        </DropdownMenuRadioItem>
                        <DropdownMenuItem disabled>Coming Soon</DropdownMenuItem>
                    </DropdownMenuRadioGroup>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              {loading ? (
                <div className="h-8 w-8 rounded-full bg-gray-300 animate-pulse" />
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
                <DropdownMenuItem disabled>Profile</DropdownMenuItem>
                <DropdownMenuItem disabled>Settings</DropdownMenuItem>
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

    