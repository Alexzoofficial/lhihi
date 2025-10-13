import {
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarSeparator,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { LhihiLogo, UserIcon } from '@/components/icons';
import { Edit, LogOut, Settings } from 'lucide-react';

export function ChatSidebarContent() {
  return (
    <>
      <SidebarHeader>
        <div className="flex items-center gap-2">
          <Button variant="ghost" className="p-1 h-auto">
            <LhihiLogo className="size-8 text-sidebar-primary" />
          </Button>
          <span className="text-lg font-semibold text-sidebar-foreground">lhihi AI</span>
        </div>
      </SidebarHeader>
      <SidebarContent className="p-2">
        <Button variant="outline" className="w-full bg-sidebar-background border-sidebar-border hover:bg-sidebar-accent">
          <Edit className="mr-2 size-4" />
          New Chat
        </Button>
        <div className='flex-1 mt-4'>
            <p className="text-sm text-sidebar-foreground/70 p-2">
            Previous chats will be displayed here.
            </p>
        </div>
      </SidebarContent>
      <SidebarFooter>
        <SidebarSeparator />
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton>
              <UserIcon className="size-4" />
              <span>User Name</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton>
              <Settings className="size-4" />
              <span>Settings</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton>
              <LogOut className="size-4" />
              <span>Log out</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </>
  );
}
