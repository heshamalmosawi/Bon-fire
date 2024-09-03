"use client";

import React, { useEffect, useState } from "react";
import UserList from "@/components/desktop/UserList";
import Chat from "@/components/desktop/Chat";
import Navbar from "@/components/desktop/Navbar";
import { useRouter } from "next/navigation";
import { User } from "@/components/desktop/UserList";
import { fetchSessionUser} from '@/lib/api';



const MessagesPage = () => {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [sessionUser, setSessionUser] = useState("");
  const [u_id, setU_id] = useState<string | undefined>(undefined);
  const router = useRouter();

  useEffect(() => {
    const getSessionUser = async () => {
      const data = await fetchSessionUser();
      console.log("user:", data, "status:", data.status);
      if (data.status !== 200 && u_id === undefined) {
        console.log(`Failed to authenticate user: ${data.status}`);
        router.push('/auth');
        return;
      } else if (data.status === 200) { // if user is authenticated and u_id is defined in URL
        // const data = await user.json();
        console.log("authentication data:", data.User.user_id);
        setSessionUser(data.User.user_id);
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
      <div className="flex h-full flex-col text-white w-full">
        <div className="text-xl font-semibold h-[8%] flex items-center pl-10">Messages</div>
        <div className="flex w-full h-[92%] border border-customborder">
          <UserList onSelectUser={setSelectedUser} sessionUser={sessionUser} />
          <Chat selectedUser={selectedUser} sessionUser={sessionUser} />
        </div>
      </div>
    </div>
  );
};

export default MessagesPage;