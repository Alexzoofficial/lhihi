'use client';

import React from 'react';
import { ChatSidebarContent } from './chat-sidebar';
import ChatPanel from './chat-panel';

export function ChatLayout() {
  return (
    <div className="flex h-screen bg-background text-foreground">
      <ChatSidebarContent />
      <div className="flex-1 flex flex-col">
        <ChatPanel />
      </div>
    </div>
  );
}