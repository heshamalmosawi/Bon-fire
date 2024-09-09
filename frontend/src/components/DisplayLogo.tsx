"use client";

import Image from "next/image";
import logo from "/public/logo.png";
import React from "react";
import { useNotifications } from "@/context/NotificationContext";
import DarkNotificationPopover from "./dark-notification-popover";

const DisplayLogo = () => {
  const { notifications } = useNotifications();
  return (
    <div className="w-full flex items-center justify-start px-4 space-x-2 mb-6">
      <div className="w-10 h-9 rounded-full">
        <Image src={logo} alt="Bonfire logo" />
      </div>
      <div className="w-full flex items-center  justify-between">
        <h1 className="text-white font-bold text-[1.5rem]">Bonfire</h1>
        <DarkNotificationPopover />
      </div>
    </div>
  );
};

export default DisplayLogo;
