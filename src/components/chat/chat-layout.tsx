'use client';

import {
  SidebarProvider,
  Sidebar,
  SidebarInset,
} from '@/components/ui/sidebar';
import { ChatSidebarContent } from './chat-sidebar';
import ChatPanel from './chat-panel';
import React from 'react';

export function ChatLayout() {
  const [open, setOpen] = React.useState(() => {
    if (typeof window === 'undefined') {
      return true;
    }
    return document.cookie.includes('sidebar_state=true');
  });

  return (
    <SidebarProvider open={open} onOpenChange={setOpen}>
      <Sidebar variant="sidebar" collapsible="icon">
        <ChatSidebarContent />
      </Sidebar>
      <SidebarInset>
        <ChatPanel />
      </SidebarInset>
    </SidebarProvider>
  );
}
