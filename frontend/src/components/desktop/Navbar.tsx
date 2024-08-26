import React from "react";
import DisplayLogo from "../DisplayLogo";
import { useRouter } from 'next/navigation';
import logo from "/public/logo.png";
// import { Button } from "../ui/button";
import Image from "next/image";
import {
  BellRing,
  CircleUser,
  House,
  MessagesSquare,
  UsersRound,
  Users,
  Calendar,
  Boxes,
  Component,
} from "lucide-react";

const Navbar = () => {
  const router = useRouter();

  const handleNavigation = (path: string) => {
    router.push(path);
  };

  return (
    <aside className="w-1/4 h-screen bg-black p-4 sticky top-0 left-0">
      <DisplayLogo />
      <h3 className="text-lg font-semibold mb-4 text-white">Main Menu</h3>
      <nav className="space-y-4 gap-4">
        <button onClick={() => handleNavigation('/messages')} className="flex items-center space-x-3 text-gray-400 hover:text-white px-2.5">
          <MessagesSquare />
          <span>Messages</span>
        </button>
        <button onClick={() => handleNavigation('/people')} className="flex items-center space-x-3 text-gray-400 hover:text-white px-2.5">
          <Users />
          <span>People</span>
        </button>
        <button onClick={() => handleNavigation('/')} className="flex items-center space-x-3 text-gray-400 hover:text-white px-2.5">
          <House />
          <span>Feed</span>
        </button>
        <button onClick={() => handleNavigation('/profile')} className="flex items-center space-x-3 text-gray-400 hover:text-white bg-customGray x-spacings2 p-2.5 rounded-lg">
          <CircleUser />
          <span>My Timeline</span>
        </button>
      </nav>
      <hr className="my-8 border-gray-700"></hr>
      <div>
        <h3 className="text-lg font-semibold mb-4 text-white">Explore</h3>
        <nav className="space-y-4 gap-4">
          <button onClick={() => handleNavigation('/events')} className="flex items-center space-x-3 text-gray-400 hover:text-white px-2.5">
            <Calendar />
            <span>Events</span>
          </button>
          <button onClick={() => handleNavigation('/groups')} className="flex items-center space-x-3 text-gray-400 hover:text-white px-2.5">
            <Boxes />
            <span>Groups</span>
          </button>
        </nav>
      </div>
    </aside>
  );
};

export default Navbar;
