'use client';

import React, { useState } from 'react';
import {
  SidebarProvider,
  Sidebar,
} from '@/components/ui/sidebar';
import { ChatSidebarContent } from './chat-sidebar';
import ChatPanel from './chat-panel';

export function ChatLayout() {
  const [chatId, setChatId] = useState<string | null>(null);
  
  const handleNewChat = () => {
    setChatId(null);
  }

  return (
    <SidebarProvider>
      <div className="flex h-screen bg-background text-foreground">
        <Sidebar>
          <ChatSidebarContent onChatSelect={setChatId} currentChatId={chatId} onNewChat={handleNewChat} />
        </Sidebar>
        <div className="flex-1">
          <ChatPanel chatId={chatId} setChatId={setChatId} />
        </div>
      </div>
    </SidebarProvider>
  );
}
