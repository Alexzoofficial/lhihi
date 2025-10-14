'use client';
import { Button } from '@/components/ui/button';
import { LhihiLogo, UserIcon } from '@/components/icons';
import { Edit, LogOut, Settings, Trash2 } from 'lucide-react';
import {
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
} from '@/components/ui/sidebar';
import { useUser, useFirebase } from '@/firebase';
import { signInWithGoogle, signOutWithGoogle } from '@/firebase/auth';
import { getAuth } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useEffect, useState } from 'react';
import { collection, query, onSnapshot, orderBy, doc, deleteDoc } from 'firebase/firestore';

interface Chat {
    id: string;
    name: string;
}

export function ChatSidebarContent({ onChatSelect, currentChatId, onNewChat }: { onChatSelect: (id: string) => void; currentChatId: string | null; onNewChat: () => void; }) {
  const { user, loading } = useUser();
  const { toast } = useToast();
  const { firestore } = useFirebase();
  const [chats, setChats] = useState<Chat[]>([]);
  
  useEffect(() => {
    if (!firestore || !user) {
        setChats([]);
        return;
    };

    const chatsQuery = query(
      collection(firestore, `users/${user.uid}/chats`),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(chatsQuery, (snapshot) => {
      const newChats = snapshot.docs.map((doc) => ({
        id: doc.id,
        name: doc.data().name,
      }));
      setChats(newChats);
    });

    return () => unsubscribe();
  }, [firestore, user]);

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
      onNewChat();
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
  
  const deleteChat = async (chatIdToDelete: string) => {
      if (!firestore || !user) return;
      
      const messagesQuery = query(collection(firestore, `users/${user.uid}/chats/${chatIdToDelete}/messages`));
      const messagesSnapshot = await getDocs(messagesQuery);
      const batch = writeBatch(firestore);
      messagesSnapshot.forEach(doc => {
          batch.delete(doc.ref);
      });
      await batch.commit();

      await deleteDoc(doc(firestore, `users/${user.uid}/chats`, chatIdToDelete));
      toast({ title: 'Chat deleted' });
      if (currentChatId === chatIdToDelete) {
        onNewChat();
      }
  };

  return (
    <>
      <SidebarHeader className="border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <LhihiLogo className="size-8 text-sidebar-primary" />
            <span className="text-lg font-semibold">lhihi AI</span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <Button variant="ghost" className="w-full justify-start mt-4 bg-sidebar-accent" onClick={onNewChat}>
          <Edit className="mr-2 size-4" />
          New Chat
        </Button>
        <div className="flex-1 mt-4 overflow-y-auto">
          {user && chats.length > 0 ? (
             <div className="space-y-2">
                {chats.map((chat) => (
                    <div key={chat.id} className="flex items-center group">
                        <Button
                            variant={currentChatId === chat.id ? 'secondary' : 'ghost'}
                            className="w-full justify-start truncate"
                            onClick={() => onChatSelect(chat.id)}
                        >
                            {chat.name}
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="shrink-0 opacity-0 group-hover:opacity-100"
                            onClick={(e) => {
                                e.stopPropagation();
                                deleteChat(chat.id);
                            }}
                        >
                            <Trash2 className="size-4" />
                        </Button>
                    </div>
                ))}
            </div>
          ) : user ? (
             <p className="text-sm text-sidebar-foreground/70 p-2">
                No previous chats.
             </p>
          ) : (
            <p className="text-sm text-sidebar-foreground/70 p-2">
                Log in to see your chat history.
             </p>
          )}
        </div>
      </SidebarContent>

      <SidebarFooter>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="w-full justify-start text-left">
              {loading ? (
                <div className="flex items-center gap-2 w-full">
                  <div className="h-7 w-7 rounded-full bg-gray-600 animate-pulse" />
                  <div className="h-4 w-20 rounded bg-gray-600 animate-pulse" />
                </div>
              ) : user ? (
                <div className="flex items-center gap-2 w-full">
                  <Avatar className="size-7">
                    <AvatarImage src={user.photoURL ?? undefined} alt={user.displayName ?? ''} />
                    <AvatarFallback>
                      {user.displayName?.charAt(0) ?? <UserIcon className="size-4" />}
                    </AvatarFallback>
                  </Avatar>
                  <span className='truncate'>{user.displayName}</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 w-full" onClick={handleLogin}>
                  <UserIcon className="size-5" />
                  <span>Log in</span>
                </div>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-[var(--sidebar-width)] mb-2" side="top" align="start">
            {user ? (
              <>
                <DropdownMenuItem>
                  <Settings className="mr-2 size-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 size-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </>
            ) : (
              <DropdownMenuItem onClick={handleLogin}>
                <UserIcon className="mr-2 size-4" />
                <span>Log in with Google</span>
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
    </>
  );
}
