"use client";

import React from "react";
import GroupSection from "./desktop/sections/GroupSection";
import ContactSection from "./desktop/sections/ContactSection";
import MessageSection from "./desktop/sections/MessageSection";

const RightSidebar = () => {
  return (
    <div className="w-full h-full flex flex-col items-center justify-start bg-black text-white p-7 space-y-4">
      <GroupSection />
      <ContactSection />
      <MessageSection />
    </div>
  );
};

export default RightSidebar;
