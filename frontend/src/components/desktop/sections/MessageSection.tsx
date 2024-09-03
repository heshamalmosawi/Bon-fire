import React from 'react'
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const messages = [
  { name: "Adam, Eve", time: "Today at 3:30 PM", avatar: "A" },
  { name: "Funny Stuff", time: "Fri, Aug 1 at 1:22 PM", avatar: "F" },
];

const MessageSection = () => {
  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Messages</h2>
      </div>
      <ScrollArea className="h-[100px]">
        {messages.map((message, index) => (
          <div
            key={index}
            className="flex items-center justify-between mb-3 text-sm"
          >
            <div className="flex items-center">
              <Avatar className="mr-2 bg-gray-500">
                <AvatarFallback className="text-white bg-gray-500">
                  {message.avatar}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span>{message.name}</span>
                <span className="text-xs text-neutral-500">{message.time}</span>
              </div>
            </div>
          </div>
        ))}
      </ScrollArea>
    </div>
  );
}

export default MessageSection