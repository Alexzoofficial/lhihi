
import type { Message } from '@/lib/types';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { Paperclip, Copy, ThumbsUp, ThumbsDown, RefreshCw, Volume2, Edit, Check, MoreVertical, List, Plus, Link as LinkIcon, LoaderCircle, Youtube } from 'lucide-react';
import { Button } from '../ui/button';
import { useState, useRef } from 'react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '../ui/dropdown-menu';
import { textToSpeech } from '@/ai/flows/text-to-speech';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '../ui/badge';

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

const GeneratingImage = () => {
    return (
        <div className="w-full h-96 bg-muted rounded-md my-2 flex flex-col items-center justify-center">
            <LoaderCircle className="size-10 animate-spin text-primary" />
            <p className="text-muted-foreground text-sm mt-2">Generating image...</p>
        </div>
    )
}

const YouTubePreview = ({ url, title, thumbnailUrl }: { url: string; title: string; thumbnailUrl: string; }) => {
    return (
        <a href={url} target="_blank" rel="noopener noreferrer" className="bg-card border rounded-lg my-2 block hover:bg-muted transition-colors">
            <div className="relative">
                <Image src={thumbnailUrl} alt={title} width={512} height={288} className="rounded-t-lg object-cover" />
                <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                    <Youtube className="size-16 text-white" />
                </div>
            </div>
            <div className="p-4">
                <p className="font-semibold text-sm">{title}</p>
                <p className="text-xs text-muted-foreground mt-1">{new URL(url).hostname}</p>
            </div>
        </a>
    )
}

const renderContent = (content: string) => {
    const imageRegex = /:::image\[(https?:\/\/[^\]]+)\]:::/g;
    const generatingImageRegex = /:::generating_image\[([^\]]+)\]:::/g;
    const youtubeRegex = /:::youtube\[(https?:\/\/[^|]+)\|([^|]+)\|([^\]]+)\]:::/g;
    
    const parts: (string | React.ReactElement)[] = [];
    let lastIndex = 0;
    
    let result;
    const combinedRegex = new RegExp(`${imageRegex.source}|${generatingImageRegex.source}|${youtubeRegex.source}`, 'g');

    while ((result = combinedRegex.exec(content)) !== null) {
      const match = result[0];
      const imageUrl = result[1];
      const isGenerating = result[2] !== undefined;
      const youtubeUrl = result[3];
      const youtubeTitle = result[4];
      const youtubeThumbnail = result[5];
      const offset = result.index;

      if (offset > lastIndex) {
        parts.push(content.substring(lastIndex, offset));
      }

      if (isGenerating) {
        parts.push(<GeneratingImage key={offset} />);
      } else if (imageUrl) {
        parts.push(<Image key={offset} src={imageUrl} alt="Generated image" width={512} height={512} className="rounded-md my-2" />);
      } else if (youtubeUrl) {
          parts.push(<YouTubePreview key={offset} url={youtubeUrl} title={youtubeTitle} thumbnailUrl={youtubeThumbnail} />);
      }
      
      lastIndex = offset + match.length;
    }

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
      // Process bold text
      const boldAndListParts = part.split(/(\*\*.*?\*\*)/g);
      return boldAndListParts.map((subPart, subIndex) => {
        if (subPart.startsWith('**') && subPart.endsWith('**')) {
          return <strong key={subIndex}>{subPart.slice(2, -2)}</strong>;
        }
        return <span key={subIndex}>{subPart}</span>;
      });
    }).filter(Boolean);
};


export function ChatMessage({ id, role, content, attachments, onRegenerate, onAudioGenerated, audioUrl, relatedQueries, onSelectQuery, sources }: Message) {
  const isUser = role === 'user';
  const [copied, setCopied] = useState(false);
  const [liked, setLiked] = useState(false);
  const [disliked, setDisliked] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const { toast } = useToast();

  const handleCopy = () => {
    if (content) {
      navigator.clipboard.writeText(content.replace(/:+:(generating_image|image|youtube)\[.*?\]:+:/g, '')).then(() => {
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
  
  const playAudio = (url: string) => {
    const audio = audioRef.current || new Audio(url);
    if (!audioRef.current) {
        (audioRef as React.MutableRefObject<HTMLAudioElement>).current = audio;
        audio.src = url;
    }
    
    setIsSpeaking(true);
    
    audio.play().catch(e => {
        console.error("Audio playback failed:", e);
        toast({ variant: 'destructive', title: 'Error', description: 'Could not play audio.' });
        setIsSpeaking(false);
    });

    audio.onended = () => {
      setIsSpeaking(false);
    }
  }

  const handleSpeak = async () => {
    if (isSpeaking || !content) return;

    if (audioUrl) {
      playAudio(audioUrl);
      return;
    }

    setIsSpeaking(true); // Show loading state immediately
    try {
      const ttsResult = await textToSpeech(content);
      if (ttsResult?.audio) {
        onAudioGenerated?.(id, ttsResult.audio);
        playAudio(ttsResult.audio);
      } else {
        throw new Error('Audio data was empty.');
      }
    } catch (error: any) {
        console.error("TTS generation failed:", error);
        toast({ variant: 'destructive', title: 'Text-to-Speech Error', description: error.message || 'Could not generate audio.' });
        setIsSpeaking(false); // Reset loading state on error
    }
  };

  return (
    <div className={cn("flex w-full items-start gap-4", isUser ? "flex-row-reverse" : "flex-row")}>
      <div className={cn("group flex flex-col gap-1 w-full", isUser ? "items-end" : "items-start")}>
        <div 
          className={cn(
            "p-3 rounded-2xl max-w-[85%]", 
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
        {!isUser && content && (
            <div className="flex items-center gap-2 transition-opacity opacity-100 group-hover:opacity-100">
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleCopy}>
                    {copied ? <Check className="size-4 text-primary" /> : <Copy className="size-4" />}
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
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleSpeak}>
                    {isSpeaking ? <LoaderCircle className="size-4 animate-spin" /> : <Volume2 className="size-4" />}
                </Button>
                <audio ref={audioRef} preload="none" className="hidden" />
            </div>
        )}
        
        {!isUser && sources && sources.length > 0 && (
            <div className="mt-2 w-full max-w-[85%]">
                <div className="flex items-center gap-2 mb-2">
                    <LinkIcon className="size-4 text-muted-foreground" />
                    <h3 className="text-sm font-semibold">Sources</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                    {sources.map((source, index) => (
                        <a
                          key={index}
                          href={source}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs"
                        >
                          <Badge variant="outline" className="truncate hover:bg-accent">
                            {new URL(source).hostname}
                          </Badge>
                        </a>
                    ))}
                </div>
            </div>
        )}

        {!isUser && relatedQueries && relatedQueries.length > 0 && (
          <div className="mt-4 w-full max-w-[85%]">
            <div className="flex items-center gap-2 mb-2">
              <List className="size-4 text-muted-foreground" />
              <h3 className="text-sm font-semibold">Related</h3>
            </div>
            <div className="flex flex-col gap-2">
              {relatedQueries.map((query, index) => (
                <button
                  key={index}
                  onClick={() => onSelectQuery?.(query)}
                  className="flex items-center justify-between text-left p-2 rounded-md border text-sm hover:bg-accent"
                >
                  <span>{query}</span>
                  <Plus className="size-4 text-muted-foreground" />
                </button>
              ))}
            </div>
          </div>
        )}

        {isUser && content && (
             <div className="flex items-center gap-2 transition-opacity opacity-0 group-hover:opacity-100">
                <Button variant="ghost" size="icon" className="h-7 w-7">
                    <Edit className="size-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleCopy}>
                    {copied ? <Check className="size-4 text-primary" /> : <Copy className="size-4" />}
                </Button>
            </div>
        )}
      </div>
    </div>
  );
}

    