"use client";

import React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { MoreHorizontal } from "lucide-react";

const groups = [
  { name: "Nike", subscribers: "812K", logo: "/path/to/nike-logo.png" },
  { name: "Netflix", subscribers: "5.2M", logo: "/path/to/netflix-logo.png" },
];

const contacts = [
  { name: "Desirae Schleifer", avatar: "/path/to/avatar1.jpg", online: true },
  { name: "Jocelyn Dias", avatar: "/path/to/avatar2.jpg", online: true },
  { name: "Marilyn Franci", avatar: "/path/to/avatar3.jpg", online: true },
  { name: "Nolan Dorwart", avatar: "/path/to/avatar4.jpg", online: true },
  { name: "Kianna George", avatar: "/path/to/avatar5.jpg", online: false },
  { name: "Helena Thornot", avatar: "/path/to/avatar6.jpg", online: true },
  { name: "Carla Westervelt", avatar: "/path/to/avatar7.jpg", online: false },
  { name: "Jaydon Torff", avatar: "/path/to/avatar8.jpg", online: true },
  { name: "Mira Curtis", avatar: "/path/to/avatar9.jpg", online: false },
  { name: "Chance Septimus", avatar: "/path/to/avatar10.jpg", online: true },
  { name: "Ashlynn Aminoff", avatar: "/path/to/avatar11.jpg", online: true },
];

const messages = [
  { name: "Adam, Eve", time: "Today at 3:30 PM", avatar: "A" },
  { name: "Funny Stuff", time: "Fri, Aug 1 at 1:22 PM", avatar: "F" },
];

const RightSidebar = () => {
  return (
    <div className="w-full h-full flex flex-col items-center justify-start bg-neutral-950 text-white p-4 space-y-4">
      {/* Groups Section */}
      <div className="w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Groups</h2>
          <Button variant="ghost" className="p-0">
            <MoreHorizontal className="w-5 h-5" />
          </Button>
        </div>
        <ScrollArea className="h-[100px]">
          {groups.map((group, index) => (
            <div
              key={index}
              className="flex items-center justify-between mb-3 text-sm"
            >
              <div className="flex items-center">
                <Avatar className="mr-2 bg-gray-500">
                  <AvatarImage src={group.logo} />
                  <AvatarFallback className="text-white bg-gray-500">
                    {group.name[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <span>{group.name}</span>
                  <span className="text-xs text-neutral-500">
                    {group.subscribers} Subscribers
                  </span>
                </div>
              </div>
            </div>
          ))}
        </ScrollArea>
      </div>

      {/* Contacts Section */}
      <div className="w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Contacts</h2>
          <Button variant="ghost" className="p-0">
            <MoreHorizontal className="w-5 h-5" />
          </Button>
        </div>
        <ScrollArea className="h-[300px]">
          {contacts.map((contact, index) => (
            <div
              key={index}
              className="flex items-center justify-between mb-3 text-sm"
            >
              <div className="flex items-center">
                <Avatar className="mr-2 bg-gray-500">
                  <AvatarImage src={contact.avatar} />
                  <AvatarFallback className="text-white bg-gray-500">
                    {contact.name[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <span>{contact.name}</span>
                  <span
                    className={`w-2 h-2 rounded-full mt-1 -ml-4 z-10 ${
                      contact.online ? "bg-green-500" : "bg-gray-500"
                    }`}
                  />
                </div>
              </div>
            </div>
          ))}
        </ScrollArea>
      </div>

      {/* Messages Section */}
      <div className="w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Messages</h2>
          <Button variant="ghost" className="p-0">
            <MoreHorizontal className="w-5 h-5" />
          </Button>
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
    </div>
  );
};

export default RightSidebar;
