
import React, { useRef, useEffect } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Form, FormControl, FormField, FormItem } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { ArrowUp, Paperclip } from 'lucide-react';
import { Attachment } from '@/lib/types';
import Image from 'next/image';

interface ChatInputProps {
  form: UseFormReturn<{ message: string, attachments: Attachment[] }>;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
  isResponding: boolean;
  onFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  removeAttachment: (index: number) => void;
}

export function ChatInput({ form, onSubmit, isResponding, onFileChange, removeAttachment }: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { message, attachments } = form.watch();

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [message]);
  
  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && event.shiftKey && !isResponding && (form.getValues('message') || form.getValues('attachments').length > 0)) {
      event.preventDefault();
      form.handleSubmit(onSubmit)();
    }
  };
  
  return (
    <Form {...form}>
      <div className="relative w-full max-w-3xl mx-auto">
        <form onSubmit={onSubmit} className="relative flex flex-col w-full bg-white dark:bg-card rounded-xl border shadow-lg">
          {attachments && attachments.length > 0 && (
            <div className="p-4 border-b">
              <div className="flex flex-wrap gap-2">
                {attachments.map((attachment, index) => (
                  <div key={index} className="relative">
                    {attachment.type.startsWith('image/') ? (
                      <Image
                        src={attachment.preview}
                        alt={attachment.name}
                        width={80}
                        height={80}
                        className="rounded-md object-cover"
                      />
                    ) : (
                      <div className="w-20 h-20 bg-muted rounded-md flex items-center justify-center">
                        <Paperclip className="size-6" />
                      </div>
                    )}
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                      onClick={() => removeAttachment(index)}
                    >
                      <span className="text-xs">X</span>
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className="flex items-end p-2">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="shrink-0"
              onClick={() => fileInputRef.current?.click()}
            >
              <Paperclip className="size-5" />
            </Button>
            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormControl>
                    <Textarea
                      placeholder="Message lhihi AI... (Shift+Enter to send)"
                      className="resize-none border-0 shadow-none focus-visible:ring-0 max-h-[500px] bg-transparent"
                      {...field}
                      ref={textareaRef}
                      onKeyDown={handleKeyDown}
                      rows={1}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <Button
              type="submit"
              size="icon"
              className="shrink-0 h-8 w-8"
              disabled={isResponding || (!message && attachments.length === 0)}
              aria-label="Send message"
            >
              <ArrowUp className="size-4" />
            </Button>
          </div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={onFileChange}
            className="hidden"
            multiple
          />
        </form>
      </div>
    </Form>
  );
}
