import { Button } from '@/components/ui/button';
import { LhihiLogo, UserIcon } from '@/components/icons';
import { Edit, LogOut, Settings } from 'lucide-react';

export function ChatSidebarContent() {
  return (
    <div className="w-64 bg-sidebar text-sidebar-foreground flex flex-col p-2">
      <div className="flex items-center gap-2 p-2">
          <LhihiLogo className="size-8 text-sidebar-primary" />
        <span className="text-lg font-semibold">lhihi AI</span>
      </div>
      
      <Button variant="ghost" className="w-full justify-start mt-4 bg-sidebar-accent">
        <Edit className="mr-2 size-4" />
        New Chat
      </Button>
      
      <div className='flex-1 mt-4 overflow-y-auto'>
          <p className="text-sm text-sidebar-foreground/70 p-2">
          Previous chats will be displayed here.
          </p>
      </div>

      <div className="mt-auto">
        <div className="flex flex-col gap-1 text-sm">
            <Button variant="ghost" className="w-full justify-start">
              <UserIcon className="mr-2 size-4" />
              <span>User Name</span>
            </Button>
            <Button variant="ghost" className="w-full justify-start">
              <Settings className="mr-2 size-4" />
              <span>Settings</span>
            </Button>
            <Button variant="ghost" className="w-full justify-start">
              <LogOut className="mr-2 size-4" />
              <span>Log out</span>
            </Button>
        </div>
      </div>
    </div>
  );
}