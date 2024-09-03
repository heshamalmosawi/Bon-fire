"use client";

import FeedDesktop from "@/components/desktop/FeedDesktop";
import Navbar from "@/components/desktop/Navbar";
import RightSidebar from "@/components/rightNav";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const router = useRouter()
  useEffect(() => {
    if (!Cookies.get("session_id")) {
      router.replace("/auth")
    }
  });

  return (
    <div className="w-screen h-screen flex items-center justify-evenly bg-neutral-950">
      <Navbar />
      <FeedDesktop />
      <div
        id="right-nav"
        className="w-[20%] h-full flex flex-col items-center justify-evenly"
      >
        <RightSidebar /> {/* Add the RightSidebar component here */}
      </div>
    </div>
  );
}
