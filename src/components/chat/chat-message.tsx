import { LhihiLogo, UserIcon } from '@/components/icons';
import type { Message } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback } from '../ui/avatar';

export function ChatMessage({ role, content }: Message) {
  const isAssistant = role === 'assistant';

  return (
    <div className="flex items-start gap-4">
      <Avatar className="w-8 h-8 border">
        <AvatarFallback className={cn(isAssistant ? 'bg-primary/10' : 'bg-muted')}>
          {isAssistant ? (
            <LhihiLogo className="text-primary" />
          ) : (
            <UserIcon className="text-foreground" />
          )}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 space-y-1 pt-0.5">
        <p className="font-semibold text-sm">{isAssistant ? 'lhihi AI' : 'You'}</p>
        <p className="text-sm text-foreground whitespace-pre-wrap">{content}</p>
      </div>
    </div>
  );
}
