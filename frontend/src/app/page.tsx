"use client";

import Navbar from "@/components/desktop/Navbar";

export default function Home() {
  return (
    <div className="w-screen h-screen flex items-center justify-evenly bg-neutral-950">
      <Navbar />
      <div className="w-[70%]"></div>
      <div className="w-[20%]"></div>
    </div>
  );
}
