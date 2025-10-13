'use client';

import React from 'react';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarTrigger,
  SidebarContent,
  SidebarInset,
} from '@/components/ui/sidebar';
import { ChatSidebarContent } from './chat-sidebar';
import ChatPanel from './chat-panel';

export function ChatLayout() {
  return (
    <SidebarProvider>
      <div className="flex h-screen bg-background text-foreground">
        <Sidebar>
          <ChatSidebarContent />
        </Sidebar>
        <SidebarInset>
          <ChatPanel />
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
