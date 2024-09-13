import * as React from "react"
// import { useState, useEffect } from 'react';
import { cn } from "@/lib/utils";
// import { User } from "@/components/desktop/UserList";
// import { User } from "lucide-react";


interface ChatMessageListProps extends React.HTMLAttributes<HTMLDivElement> {
}

const ChatMessageList = React.forwardRef<HTMLDivElement, ChatMessageListProps>(
  ({ className, children, ...props }, ref) => (
    <div
      className={cn("flex flex-col w-full h-full p-4 gap-6 overflow-y-auto", className)}
      ref={ref}
      {...props}
    >
      {children}
    </div>
  ));

ChatMessageList.displayName = "ChatMessageList";

interface ChatListItemProps {
  name: string;
  status?: string;
  avatar: string;
  isActive: boolean;
  onClick: () => void;
}

const ChatListItem: React.FC<ChatListItemProps> = ({ name, status, avatar, isActive, onClick }) => (
  <div
    className={`flex items-center gap-4 p-4 cursor-pointer rounded-md ${isActive ? 'bg-gray-700' : 'hover:bg-gray-800'}`}
    onClick={onClick}
  >
    <img src={avatar} alt="Avatar" className="w-10 h-10 rounded-full" />
    <div>
      <p className="text-white font-semibold">{name}</p>
      {status && <p className="text-xs text-gray-400">{status}</p>}
    </div>
  </div>
);

interface ChatSidebarProps {
  chats: {
    name: string;
    status?: string;
    avatar?: string;
    isActive: boolean;
    onClick: () => void;
  }[];
}

const ChatSidebar: React.FC<ChatSidebarProps> = ({ chats }) => (
  <div className="w-64 bg-black p-4 flex flex-col gap-2">
    <h2 className="text-white text-lg font-bold">Chats ({chats.length})</h2>
    {chats.length === 0 ? (
      <div className="text-white text-center mt-4">Click to load your chat</div>
    ) : (
      chats.map((chat, index) => (
        <ChatListItem
          key={index}
          name={chat.name}
          status={chat.status}
          avatar={chat.avatar || "https://img.freepik.com/premium-vector/default-avatar-profile-icon-social-media-user-image-gray-avatar-icon-blank-profile-silhouette-vector-illustration_561158-3467.jpg"}
          isActive={chat.isActive}
          onClick={chat.onClick}
        />
      ))
    )}
  </div>
);

export { ChatSidebar, ChatMessageList };