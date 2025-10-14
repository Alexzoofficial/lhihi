
import type { Message } from '@/lib/types';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { Paperclip, Copy, ThumbsUp, ThumbsDown, RefreshCw, Volume2, Edit, Check, MoreVertical } from 'lucide-react';
import { Button } from '../ui/button';
import { useState, useRef } from 'react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';

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
          {copied ? <Check className="size-4 text-primary" /> : <Copy className="size-4 text-gray-400" />}
        </Button>
      </div>
      <pre className="p-4 text-sm text-white overflow-x-auto">
        <code>{children}</code>
      </pre>
    </div>
  );
};

const renderContent = (content: string) => {
    // Handle generated images
    const imageRegex = /:::image\[(data:image\/[^;]+;base64,[^\]]+)\]:::/g;
    
    const parts: (string | React.ReactElement)[] = [];
    let lastIndex = 0;
    
    content.replace(imageRegex, (match, dataUri, offset) => {
        // Push the text before the image
        if (offset > lastIndex) {
            parts.push(content.substring(lastIndex, offset));
        }
        // Push the image element
        parts.push(<Image key={offset} src={dataUri} alt="Generated image" width={300} height={300} className="rounded-md my-2" />);
        lastIndex = offset + match.length;
        return match;
    });

    // Push any remaining text after the last image
    if (lastIndex < content.length) {
        parts.push(content.substring(lastIndex));
    }
    
    return parts.map((part, index) => {
        if (typeof part === 'string') {
            return <div key={index}>{renderText(part)}</div>;
        }
        return part;
    });
}

const renderText = (content: string) => {
    const parts = content.split(/(```(?:\w+\n)?[\s\S]*?```)/g);
    return parts.map((part, index) => {
      if (part.startsWith('```')) {
        const code = part.replace(/^```\w*\n?/, '').replace(/```$/, '').trim();
        if (code) {
            return <CodeBlock key={index}>{code}</CodeBlock>;
        }
        return null;
      }
      // Process bold text and lists
      const boldAndListParts = part.split(/(\*\*.*?\*\*)/g);
      return boldAndListParts.map((subPart, subIndex) => {
        if (subPart.startsWith('**') && subPart.endsWith('**')) {
          return <strong key={subIndex}>{subPart.slice(2, -2)}</strong>;
        }
        // Split by newlines and handle list items
        const lines = subPart.split('\n').map((line, lineIndex) => {
            const trimmedLine = line.trim();
            if (trimmedLine.startsWith('- ')) {
                return <li key={lineIndex}>{trimmedLine.substring(2)}</li>;
            }
            if (lineIndex < subPart.split('\n').length - 1) {
              return <span key={lineIndex}>{line}<br /></span>;
            }
            return <span key={lineIndex}>{line}</span>;
        });

        const listItems = lines.filter(line => (line.props as any).children?.[0]?.type === 'li');
        const otherItems = lines.filter(line => (line.props as any).children?.[0]?.type !== 'li');

        return (
          <div key={subIndex}>
            {otherItems}
            {listItems.length > 0 && <ul className="list-disc list-inside my-2">{listItems}</ul>}
          </div>
        );

      });
    }).filter(Boolean);
};


export function ChatMessage({ role, content, attachments, onRegenerate, audioUrl }: Message & { onRegenerate?: () => void; audioUrl?: string; }) {
  const isUser = role === 'user';
  const [copied, setCopied] = useState(false);
  const [liked, setLiked] = useState(false);
  const [disliked, setDisliked] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

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
  
  const handleSpeak = () => {
    if (!audioUrl || isPlaying) return;

    const audio = audioRef.current || new Audio(audioUrl);
    if (!audioRef.current) {
        (audioRef as React.MutableRefObject<HTMLAudioElement>).current = audio;
    }
    
    setIsPlaying(true);
    
    audio.play().catch(e => {
        console.error("Audio playback failed:", e);
        setIsPlaying(false);
    });

    audio.onended = () => {
      setIsPlaying(false);
    }
  };

  return (
    <div className={cn("flex items-start gap-4", isUser ? "justify-end" : "justify-start")}>
      <div className={cn("group flex flex-col gap-1 max-w-[85%]", isUser ? "items-end" : "items-start")}>
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
        <div className="flex items-center gap-2 transition-opacity opacity-100 group-hover:opacity-100">
            {isUser ? (
                <>
                    <Button variant="ghost" size="icon" className="h-7 w-7">
                        <Edit className="size-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleCopy}>
                        {copied ? <Check className="size-4 text-current" /> : <Copy className="size-4" />}
                    </Button>
                </>
            ) : (
                <>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleCopy}>
                       {copied ? <Check className="size-4 text-current" /> : <Copy className="size-4" />}
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
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-7 w-7">
                          <MoreVertical className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem onClick={handleSpeak} disabled={isPlaying || !audioUrl}>
                          <Volume2 className="mr-2 size-4" />
                          <span>Speak</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                    <audio ref={audioRef} src={audioUrl} preload="auto" className="hidden" />
                </>
            )}
        </div>
      </div>
    </div>
  );
}
