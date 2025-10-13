import React, { useRef, useEffect } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Form, FormControl, FormField, FormItem } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { ArrowUp } from 'lucide-react';

interface ChatInputProps {
  form: UseFormReturn<{ message: string }>;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
  isResponding: boolean;
}

export function ChatInput({ form, onSubmit, isResponding }: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messageValue = form.watch('message');

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = '40px'; // Reset height
      const scrollHeight = textareaRef.current.scrollHeight;
      // Cap height at 200px
      textareaRef.current.style.height = `${Math.min(scrollHeight, 200)}px`;
    }
  }, [messageValue]);
  
  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey && !isResponding && form.getValues('message')) {
      event.preventDefault();
      form.handleSubmit(onSubmit)();
    }
  };
  
  return (
    <Form {...form}>
      <form onSubmit={onSubmit} className="relative flex items-end w-full max-w-3xl mx-auto bg-white dark:bg-card rounded-lg border shadow-lg">
        <FormField
          control={form.control}
          name="message"
          render={({ field }) => (
            <FormItem className="flex-1">
              <FormControl>
                <Textarea
                  placeholder="Message lhihi AI..."
                  className="pr-12 resize-none border-0 shadow-none focus-visible:ring-0 max-h-[200px]"
                  {...field}
                  ref={(e) => {
                    field.ref(e);
                    if (e) {
                      // @ts-ignore
                      textareaRef.current = e;
                    }
                  }}
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
          className="absolute right-2 bottom-2 h-8 w-8"
          disabled={isResponding || !form.watch('message')}
          aria-label="Send message"
        >
          <ArrowUp className="size-4" />
        </Button>
      </form>
    </Form>
  );
}
