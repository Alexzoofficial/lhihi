
import type { Message } from '@/lib/types';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { Paperclip, Copy } from 'lucide-react';
import { Button } from '../ui/button';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';

const CodeBlock = ({ children }: { children: string }) => {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(children).then(() => {
      toast({ title: 'Copied to clipboard' });
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="bg-gray-900 rounded-md my-2">
      <div className="flex items-center justify-between px-4 py-2 bg-gray-800 rounded-t-md">
        <span className="text-xs text-gray-400">code</span>
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleCopy}>
          <Copy className="size-4 text-gray-400" />
        </Button>
      </div>
      <pre className="p-4 text-sm text-white overflow-x-auto">
        <code>{children}</code>
      </pre>
    </div>
  );
};


const renderContent = (content: string) => {
    const parts = content.split(/(```[\s\S]*?```)/g);
    return parts.map((part, index) => {
      if (part.startsWith('```') && part.endsWith('```')) {
        const code = part.slice(3, -3).trim();
        return <CodeBlock key={index}>{code}</CodeBlock>;
      }
      return <span key={index}>{part}</span>;
    });
};

export function ChatMessage({ role, content, attachments }: Message) {
  const isUser = role === 'user';

  return (
    <div className={cn("flex items-start gap-4", isUser ? "justify-end" : "justify-start")}>
      <div className={cn("flex flex-col gap-1 max-w-[85%]", isUser ? "items-end" : "items-start")}>
        <div 
          className={cn(
            "p-3 rounded-2xl", 
            isUser 
              ? "bg-muted text-foreground rounded-br-none" 
              : "bg-transparent rounded-bl-none"
          )}
        >
          {content && <div className="text-sm text-inherit whitespace-pre-wrap">{renderContent(content)}</div>}
          {attachments && attachments.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
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
                    <div className="w-32 h-32 bg-background/50 rounded-md flex flex-col items-center justify-center text-sm p-2">
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
    </div>
  );
}
