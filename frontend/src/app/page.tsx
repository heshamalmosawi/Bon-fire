"use client";

import FeedDesktop from "@/components/desktop/FeedDesktop";
import Navbar from "@/components/desktop/Navbar";

export default function Home() {
  return (
    <div className="w-screen h-screen flex items-center justify-evenly bg-neutral-950">
      <Navbar />
      <FeedDesktop />
      <div id="right-nav" className="w-[20%] h-full"></div>
    </div>
  );
}
