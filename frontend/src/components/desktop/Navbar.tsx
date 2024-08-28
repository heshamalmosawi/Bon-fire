"use client"

import React from "react";
import DisplayLogo from "../DisplayLogo";
import { Button } from "../ui/button";
import {
  BellRing,
  CircleUser,
  House,
  MessagesSquare,
  UsersRound,
} from "lucide-react";

const Navbar = () => {
  return (
    <div className="w-1/4 h-full bg-black flex flex-col items-start justify-start gap-2 py-4">
      <DisplayLogo />
      <div className="w-full flex flex-col items-start justify-start gap-5 px-5 py-5">
        <Button className="gap-2 w-full text-[1rem] flex items-center justify-start bg-black hover:bg-neutral-900">
          <House /> Home
        </Button>
        <Button className="gap-2 w-full text-[1rem] flex items-center justify-start bg-black hover:bg-neutral-900">
          <CircleUser /> Profile
        </Button>
        <Button className="gap-2 w-full text-[1rem] flex items-center justify-start bg-black hover:bg-neutral-900">
          <UsersRound /> Groups
        </Button>
        <Button className="gap-2 w-full text-[1rem] flex items-center justify-start bg-black hover:bg-neutral-900">
          <MessagesSquare /> Messages
        </Button>
        <Button className="gap-2 w-full text-[1rem] flex items-center justify-start bg-black hover:bg-neutral-900">
          <BellRing /> Notifications
        </Button>
      </div>
    </div>
  );
};

export default Navbar;
