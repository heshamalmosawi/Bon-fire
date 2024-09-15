"use client";

import FeedDesktop from "@/components/desktop/FeedDesktop";
import Navbar from "@/components/desktop/Navbar";
import RightSidebar from "@/components/rightNav";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { fetchSessionUser } from "@/lib/api";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const getSessionUser = async () => {
      const data = await fetchSessionUser();
      if (!data) {
        console.log("user not authenticated");
        router.push("/auth");
        return;
      } else if (data && data.status === 200) {
        // if user is authenticated
        console.log("user authenticated");
      }
    };
    getSessionUser();
  }, [router]);

  return (
    <div className="w-screen h-screen flex items-center justify-evenly bg-neutral-950">
      <Navbar />
      <FeedDesktop />
      <div
        id="right-nav"
        className="w-[20%] h-full flex flex-col items-center justify-evenly overflow-y-scroll"
      >
        <RightSidebar /> {/* Add the RightSidebar component here */}
      </div>
    </div>
  );
}
