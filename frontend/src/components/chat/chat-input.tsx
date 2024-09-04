import * as React from "react";
import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { EmojiPicker } from "@/components/chat/emoji-picker";

interface ChatInputProps {
  className?: string;
  value?: string;
  onKeyDown?: (event: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  onChange?: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
}

const ChatInput = React.forwardRef<HTMLTextAreaElement, ChatInputProps>(
  ({ className, value, onKeyDown, onChange, placeholder, ...props }, ref) => {
    const [inputValue, setInputValue] = useState(value || "");

    const handleEmojiSelect = (emoji: string) => {
      setInputValue((prev) => prev + emoji);
      if (onChange) {
        onChange({
          target: { value: inputValue + emoji },
        } as React.ChangeEvent<HTMLTextAreaElement>);
      }
    };

    return (
      <div className="relative flex items-center w-full">
        <Textarea
          autoComplete="off"
          value={inputValue}
          ref={ref}
          onKeyDown={onKeyDown}
          onChange={(e) => {
            setInputValue(e.target.value);
            if (onChange) onChange(e);
          }}
          name="message"
          placeholder={placeholder}
          className={cn(
            "max-h-12 px-4 py-3 bg-background text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 w-full rounded-md flex items-center h-16 resize-none",
            className
          )}
          {...props}
        />
        <div className="absolute right-4">
          <EmojiPicker onChange={handleEmojiSelect} />
        </div>
      </div>
    );
  }
);

ChatInput.displayName = "ChatInput";

export { ChatInput };