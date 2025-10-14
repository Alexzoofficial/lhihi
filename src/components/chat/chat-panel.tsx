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
import { ChevronDown, UserIcon, Check } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { useUser, useFirebase } from '@/firebase';
import { signInWithGoogle, signOutWithGoogle } from '@/firebase/auth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getAuth } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';
import { addDoc, collection, serverTimestamp, onSnapshot, query, orderBy } from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { GoogleIcon } from '../icons';
import Image from 'next/image';


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
  const [isLoginDialogOpen, setIsLoginDialogOpen] = useState(false);
  const [model, setModel] = useState('alexzo-intelligence');


  useEffect(() => {
    if (!currentChatId) {
      setMessages([]);
    }
  
    if (!firestore || !user || !currentChatId) {
      if (!user && !currentChatId) setMessages([]); // Clear messages if user logs out or starts a new chat
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
      setIsLoginDialogOpen(false);
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

  const generateImage = async (prompt: string): Promise<string> => {
    try {
      const response = await fetch('https://alexzo.vercel.app/api/generate', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer alexzo_1h5r0ouy12jeyun6f83cda',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          prompt: prompt,
          width: 512,
          height: 512
        })
      });
  
      if (!response.ok) {
        throw new Error(`Image generation failed with status: ${response.status}`);
      }
  
      const data = await response.json();
      if (data && data.data && data.data[0] && data.data[0].url) {
        return data.data[0].url;
      }
      throw new Error('Invalid response from image generation API');
    } catch (error) {
      console.error('Error generating image:', error);
      throw error;
    }
  };
  
  const isImagePrompt = (prompt: string) => {
      const imageKeywords = ['generate an image', 'create an image', 'draw', 'sketch', 'picture of'];
      const lowercasedPrompt = prompt.toLowerCase();
      return imageKeywords.some(keyword => lowercasedPrompt.includes(keyword));
  }

  const onSubmit = async (data: FormValues) => {
    if (data.attachments.length > 0 && !user) {
      setIsLoginDialogOpen(true);
      return;
    }
    
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

      try {
        await addDoc(collection(firestore, `users/${user.uid}/chats/${activeChatId}/messages`), {
            ...userMessage,
            createdAt: serverTimestamp()
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
      let assistantMessage: Message;

      if (isImagePrompt(data.message)) {
        const imageUrl = await generateImage(data.message);
        assistantMessage = {
          id: uuidv4(),
          role: 'assistant',
          content: `Here is the image you requested for: "${data.message}"`,
          attachments: [{
            name: 'generated-image.png',
            type: 'image/png',
            size: 0, 
            preview: imageUrl,
            file: null as any
          }],
          createdAt: new Date(),
        };
      } else {
        const result = await generateResponse({
          conversationHistory: conversationHistory,
          userInput: data.message,
        });

        assistantMessage = {
          id: uuidv4(),
          role: 'assistant',
          content: result.response,
          createdAt: new Date(),
        };
      }


      setMessages(prev => [...prev, assistantMessage]);

      if (user && firestore && activeChatId) {
        await addDoc(collection(firestore, `users/${user.uid}/chats/${activeChatId}/messages`), {
            ...assistantMessage,
            attachments: assistantMessage.attachments ? assistantMessage.attachments.map(a => ({...a, file: null})) : [], // Don't save file object to Firestore
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
    if (!user) {
      setIsLoginDialogOpen(true);
      return;
    }
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
    'Write a story about a lost star',
    'Explain quantum computing simply',
    'Plan a 3-day trip to Tokyo',
    'Write a python script for web scraping',
  ];
  
  const onExampleQueryClick = (query: string) => {
    form.setValue('message', query);
    form.handleSubmit(onSubmit)();
  };

  return (
    <>
    <main className="flex flex-col h-full max-h-screen">
      <header className="flex items-center justify-between p-2 border-b">
        <div className="flex items-center gap-2">
          <SidebarTrigger className="md:hidden" />
        </div>
        <div className="flex-1 flex justify-center">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2">
                  <span className="text-lg font-semibold">Alexzo Intelligence</span>
                  <ChevronDown className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuRadioGroup value={model} onValueChange={setModel}>
                  <DropdownMenuRadioItem value="alexzo-intelligence">
                    Alexzo Intelligence
                    <Check className="ml-auto size-4 text-primary" />
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="model-2" disabled>
                    Coming Soon
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="model-3" disabled>
                    Coming Soon
                  </DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
        </div>
        <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                 <Button variant="ghost" size="icon" onClick={() => !user && !loading && setIsLoginDialogOpen(true)}>
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
              {user && (
                <DropdownMenuContent align="end">
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem disabled>Profile</DropdownMenuItem>
                    <DropdownMenuItem disabled>Settings</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}>Log out</DropdownMenuItem>
                </DropdownMenuContent>
              )}
            </DropdownMenu>
        </div>
      </header>
      <div className="flex-1 overflow-y-auto">
        {messages.length === 0 && !currentChatId ? (
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

    <Dialog open={isLoginDialogOpen} onOpenChange={setIsLoginDialogOpen}>
        <DialogContent className="sm:max-w-md bg-background rounded-2xl">
          <DialogHeader className="text-center space-y-4">
            <div className="inline-block mx-auto p-3 rounded-full bg-primary/10">
              <LhihiLogo className="size-12 text-primary" />
            </div>
            <DialogTitle className="text-2xl font-bold">Welcome to lhihi AI</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Log in to save your chat history and unlock more features.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Button onClick={handleLogin} variant="outline" className="w-full h-12 text-base">
              <GoogleIcon className="mr-3 size-6" />
              Continue with Google
            </Button>
          </div>
        </DialogContent>
    </Dialog>
    </>
  );
}
