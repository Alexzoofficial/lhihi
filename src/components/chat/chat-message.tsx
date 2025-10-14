
import type { Message } from '@/lib/types';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { Paperclip, Copy, ThumbsUp, ThumbsDown, RefreshCw, MoreVertical, Edit, Mic, Check } from 'lucide-react';
import { Button } from '../ui/button';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

const CodeBlock = ({ children }: { children: string }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(children).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="bg-gray-900 rounded-md my-2">
      <div className="flex items-center justify-between px-4 py-2 bg-gray-800 rounded-t-md">
        <span className="text-xs text-gray-400">code</span>
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleCopy}>
          {copied ? <Check className="size-4 text-green-500" /> : <Copy className="size-4 text-gray-400" />}
        </Button>
      </div>
      <pre className="p-4 text-sm text-white overflow-x-auto">
        <code>{children}</code>
      </pre>
    </div>
  );
};

const renderContent = (content: string) => {
    const parts = content.split(/(```(?:\w+\n)?[\s\S]*?```)/g);
    return parts.map((part, index) => {
      if (part.startsWith('```')) {
        const code = part.replace(/^```\w*\n?/, '').replace(/```$/, '').trim();
        return <CodeBlock key={index}>{code}</CodeBlock>;
      }
      return <span key={index}>{part}</span>;
    });
};

export function ChatMessage({ role, content, attachments, onRegenerate }: Message & { onRegenerate?: () => void }) {
  const isUser = role === 'user';
  const [copied, setCopied] = useState(false);
  const [liked, setLiked] = useState(false);
  const [disliked, setDisliked] = useState(false);

  const handleCopy = () => {
    if (content) {
      navigator.clipboard.writeText(content).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  };
  
  const handleLike = () => {
      setLiked(!liked);
      if (disliked) setDisliked(false);
  }

  const handleDislike = () => {
      setDisliked(!disliked);
      if (liked) setLiked(false);
  }

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
        <div className="flex items-center gap-2 transition-opacity">
            {isUser ? (
                <>
                    <Button variant="ghost" size="icon" className="h-7 w-7">
                        <Edit className="size-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleCopy}>
                        {copied ? <Check className="size-4 text-green-500" /> : <Copy className="size-4" />}
                    </Button>
                </>
            ) : (
                <>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleCopy}>
                       {copied ? <Check className="size-4 text-green-500" /> : <Copy className="size-4" />}
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleLike}>
                        <ThumbsUp className={cn("size-4", liked && "fill-current")} />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleDislike}>
                        <ThumbsDown className={cn("size-4", disliked && "fill-current")} />
                    </Button>
                    {onRegenerate && (
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onRegenerate}>
                            <RefreshCw className="size-4" />
                        </Button>
                    )}
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-7 w-7">
                          <MoreVertical className="size-4" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-1">
                        <Button variant="ghost" size="sm" className="flex items-center gap-2">
                          <Mic className="size-4" />
                          Speak
                        </Button>
                      </PopoverContent>
                    </Popover>
                </>
            )}
        </div>
      </div>
    </div>
  );
}
