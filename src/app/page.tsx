
'use client';
import { ChatLayout } from '@/components/chat/chat-layout';
import { FirebaseProvider } from '@/firebase/provider';

export default function Home() {
  return (
    <FirebaseProvider>
      <ChatLayout />
    </FirebaseProvider>
  );
}
