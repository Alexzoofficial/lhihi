'use client';
import { Button } from '@/components/ui/button';
import { LhihiLogo, UserIcon } from '@/components/icons';
import { Edit, LogOut, Settings } from 'lucide-react';
import {
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
} from '@/components/ui/sidebar';
import { useUser } from '@/firebase';
import { signInWithGoogle, signOutWithGoogle } from '@/firebase/auth';
import { getAuth } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export function ChatSidebarContent() {
  const { user, loading } = useUser();
  const { toast } = useToast();

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
        <Button variant="ghost" className="w-full justify-start mt-4 bg-sidebar-accent">
          <Edit className="mr-2 size-4" />
          New Chat
        </Button>
        <div className="flex-1 mt-4 overflow-y-auto">
          <p className="text-sm text-sidebar-foreground/70 p-2">
            Previous chats will be displayed here.
          </p>
        </div>
      </SidebarContent>

      <SidebarFooter>
        <div className="flex flex-col gap-1 text-sm">
          {loading ? (
            <div className="flex items-center gap-2 px-2 py-1.5">
              <div className="h-7 w-7 rounded-full bg-gray-600 animate-pulse" />
              <div className="h-4 w-20 rounded bg-gray-600 animate-pulse" />
            </div>
          ) : user ? (
            <>
              <Button variant="ghost" className="w-full justify-start">
                <Avatar className="mr-2 size-7">
                  <AvatarImage src={user.photoURL ?? undefined} alt={user.displayName ?? ''} />
                  <AvatarFallback>
                    {user.displayName?.charAt(0) ?? <UserIcon className="size-4" />}
                  </AvatarFallback>
                </Avatar>
                <span>{user.displayName}</span>
              </Button>
              <Button variant="ghost" className="w-full justify-start">
                <Settings className="mr-2 size-4" />
                <span>Settings</span>
              </Button>
              <Button variant="ghost" className="w-full justify-start" onClick={handleLogout}>
                <LogOut className="mr-2 size-4" />
                <span>Log out</span>
              </Button>
            </>
          ) : (
            <Button variant="ghost" className="w-full justify-start" onClick={handleLogin}>
              <UserIcon className="mr-2 size-4" />
              <span>Log in</span>
            </Button>
          )}
        </div>
      </SidebarFooter>
    </>
  );
}
