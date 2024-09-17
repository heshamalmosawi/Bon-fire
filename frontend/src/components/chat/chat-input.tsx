import * as React from "react";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { EmojiPicker } from "@/components/chat/emoji-picker";

interface ChatInputProps {
  className?: string;
  value?: string;
  onKeyDown?: (event: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  onChange?: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  maxLength?: number; 
}

const ChatInput = React.forwardRef<HTMLTextAreaElement, ChatInputProps>(
  ({ className, value, onKeyDown, onChange, placeholder, ...props }, ref) => {
    const isControlled = value !== undefined;
    const [inputValue, setInputValue] = React.useState(value || "");

    const handleEmojiSelect = (emoji: string) => {
      const newValue = (isControlled ? value : inputValue) + emoji;
      if (!isControlled) {
        setInputValue(newValue);
      }
      if (onChange) {
        onChange({
          target: { value: newValue },
        } as React.ChangeEvent<HTMLTextAreaElement>);
      }
    };

    return (
      <div className="relative flex items-center w-full">
        <Textarea
          autoComplete="off"
          value={isControlled ? value : inputValue}
          ref={ref}
          onKeyDown={onKeyDown}
          onChange={(e) => {
            if (!isControlled) {
              setInputValue(e.target.value);
            }
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
