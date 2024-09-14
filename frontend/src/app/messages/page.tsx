"use client";

import React, { useEffect, useState } from "react";
import UserList from "@/components/desktop/UserList";
import Chat from "@/components/desktop/Chat";
import Navbar from "@/components/desktop/Navbar";
import { useRouter } from "next/navigation";
import { User } from "@/components/desktop/UserList";
import { fetchSessionUser } from "@/lib/api";

const MessagesPage = () => {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [sessionUser, setSessionUser] = useState("");
  const [u_id, setU_id] = useState<string | undefined>(undefined);
  const [newMessageReceived_flag, setNewMessageReceived_flag] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const getSessionUser = async () => {
      const data = await fetchSessionUser();
      if (!data && u_id === undefined) {
        router.push("/auth");
        return;
      } else if (data.status === 200) {
        // if user is authenticated and u_id is defined in URL
        // const data = await user.json();
        console.log("authentication data:", data.User.user_id);
        setSessionUser(data.User.user_id);
        setUser(data.User);
        console.log("u_id:", u_id);
        if (u_id === undefined) {
          setU_id(data.User.user_id);
          console.log("u_id after:", u_id, "user.user_id:", data.User.user_id);
        }
      }
    };
    getSessionUser();
  }, []);

  return (
    <div className="w-screen h-screen flex bg-neutral-950">
      <Navbar />
      <div className="flex h-full flex-col text-white w-screen p-8">
        <div className="text-xl font-semibold h-[8%] flex items-start pl-10">
          Messages
        </div>
        <div className="flex w-full h-[92%] border border-customborder rounded-md">
          <UserList
            onSelectUser={setSelectedUser}
            sessionUser={sessionUser}
            newMessageFlag={newMessageReceived_flag}
          />
          <Chat
            selectedUser={selectedUser}
            sessionUser={user}
            SetNewMessageFlag={setNewMessageReceived_flag}
            newMessageFlag={newMessageReceived_flag}
          />
        </div>
      </div>
    </div>
  );
};

export default MessagesPage;
