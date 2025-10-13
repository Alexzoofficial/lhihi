import { LhihiLogo, UserIcon } from '@/components/icons';
import type { Message } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback } from '../ui/avatar';
import Image from 'next/image';
import { Paperclip } from 'lucide-react';

export function ChatMessage({ role, content, attachments }: Message) {
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
      <div className="flex-1 space-y-2 pt-0.5">
        <p className="font-semibold text-sm">{isAssistant ? 'lhihi AI' : 'You'}</p>
        {content && <p className="text-sm text-foreground whitespace-pre-wrap">{content}</p>}
        {attachments && attachments.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {attachments.map((attachment, index) => (
              <div key={index} className="relative">
                {attachment.type.startsWith('image/') ? (
                  <Image
                    src={attachment.preview}
                    alt={attachment.name}
                    width={120}
                    height={120}
                    className="rounded-md object-cover"
                  />
                ) : (
                  <div className="w-32 h-32 bg-muted rounded-md flex flex-col items-center justify-center text-sm p-2">
                    <Paperclip className="size-8 mb-2" />
                    <span className='truncate w-full text-center'>{attachment.name}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}