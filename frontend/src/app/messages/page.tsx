"use client";

import React, { useState } from "react";
import UserList from "@/components/desktop/UserList";
import Chat from "@/components/desktop/Chat";
import Navbar from "@/components/desktop/Navbar";


const MessagesPage = () => {
  const [selectedUser, setSelectedUser] = useState<string | null>(null);

  return (
    <div className="w-screen h-screen flex bg-neutral-950">
      <Navbar />
      <div className="flex w-full">
        <UserList onSelectUser={setSelectedUser} />
        <Chat selectedUser={selectedUser} />
      </div>
    </div>
  );
};

export default MessagesPage;