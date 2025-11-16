
import React from 'react';
import { render } from '@testing-library/react';
import ChatPanel from '../chat-panel';
import { SidebarProvider } from '@/components/ui/sidebar';

describe('ChatPanel', () => {
  it('should render without crashing', () => {
    render(
      <SidebarProvider>
        <ChatPanel chatId={null} setChatId={() => {}} />
      </SidebarProvider>
    );
  });
});
