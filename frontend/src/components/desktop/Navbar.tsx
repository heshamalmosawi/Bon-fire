import React, { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import DisplayLogo from "../DisplayLogo";
import {
  CircleUser,
  House,
  MessagesSquare,
  Users,
  Boxes,
  LogOut,
} from "lucide-react";

const Navbar = () => {
  const router = useRouter();
  const pathname = usePathname();
  const [activeTab, setActiveTab] = useState("feed");

  useEffect(() => {
    if (pathname.includes("groups")) {
      setActiveTab("groups");
    } else {
       switch (pathname) {
         case "/messages":
           setActiveTab("messages");
           break;
         case "/people":
           setActiveTab("people");
           break;
         case "/profile":
           setActiveTab("profile");
           break;
         case "/groups":
           setActiveTab("groups");
           break;
         default:
           setActiveTab("feed");
       }
    }
  }, [pathname]);

  const handleNavigation = (path: string, tab: string) => {
    setActiveTab(tab);
    router.push(path);
  };

  return (
    <aside className="w-1/4 h-screen bg-black p-4 sticky top-0 left-0 navbar flex flex-col">
      <DisplayLogo />
      {/* <h3 className="text-lg font-semibold mb-4 text-white">Main Menu</h3> */}
      <nav className="space-y-4 gap-4">
        <button
          onClick={() => handleNavigation("/", "feed")}
          className={`flex items-center space-x-3 p-2.5 rounded-lg w-full ${
            activeTab === "feed"
              ? "text-white bg-customGray x-spacings2"
              : "text-gray-400 hover:text-white"
          }`}
        >
          <House />
          <span>Feed</span>
        </button>
        <button
          onClick={() => handleNavigation("/people", "people")}
          className={`flex items-center space-x-3 p-2.5 rounded-lg w-full ${
            activeTab === "people"
              ? "text-white bg-customGray x-spacings2"
              : "text-gray-400 hover:text-white"
          }`}
        >
          <Users />
          <span>People</span>
        </button>
        <button
            onClick={() => handleNavigation("/groups", "groups")}
            className={`flex items-center space-x-3 p-2.5 rounded-lg w-full ${
              activeTab === "groups"
                ? "text-white bg-customGray x-spacings2"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <Boxes />
            <span>Groups</span>
          </button>
        <button
          onClick={() => handleNavigation("/messages", "messages")}
          className={`flex items-center space-x-3 p-2.5 rounded-lg w-full ${
            activeTab === "messages"
              ? "text-white bg-customGray x-spacings2"
              : "text-gray-400 hover:text-white"
          }`}
        >
          <MessagesSquare />
          <span>Messages</span>
        </button>
        <button
          onClick={() => handleNavigation("/profile", "profile")}
          className={`flex items-center space-x-3 p-2.5 rounded-lg w-full ${
            activeTab === "profile"
              ? "text-white bg-customGray x-spacings2"
              : "text-gray-400 hover:text-white"
          }`}
        >
          <CircleUser />
          <span>My Profile</span>
        </button>

      </nav>
      <div className="mt-auto">
      <hr className="my-8 border-gray-700"></hr>
        <nav className="space-y-4 gap-4">
        <button
          onClick={() => handleNavigation("/logout", "logout")}
          className={`flex items-center space-x-3 p-2.5 rounded-lg w-full ${
            activeTab === "logout"
              ? "text-white bg-customGray x-spacings2"
              : "text-gray-400 hover:text-white"
          }`}
        >
          <LogOut />
          <span>Logout</span>
        </button>
        </nav>
      </div>
    </aside>
  );
};

export default Navbar;
