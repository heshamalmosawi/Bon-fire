"use client"

import React, { useState } from "react";
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
  const [activeTab, setActiveTab] = useState('feed');


  const handleNavigation = (path: string, tab: string) => {
    setActiveTab(tab);
    router.push(path);
  };

  return (
    <aside className="w-1/4 h-screen bg-black p-4 sticky top-0 left-0">
      <DisplayLogo />
      <h3 className="text-lg font-semibold mb-4 text-white">Main Menu</h3>
      <nav className="space-y-4 gap-4">
        <button
          onClick={() => handleNavigation('/messages', 'messages')}
          className={`flex items-center space-x-3 p-2.5 rounded-lg w-full ${activeTab === 'messages' ? 'text-white bg-customGray x-spacings2' : 'text-gray-400 hover:text-white'}`}
        >
          <MessagesSquare />
          <span>Messages</span>
        </button>
        <button
          onClick={() => handleNavigation('/people', 'people')}
          className={`flex items-center space-x-3 p-2.5 rounded-lg w-full ${activeTab === 'people' ? 'text-white bg-customGray x-spacings2' : 'text-gray-400 hover:text-white'}`}
        >
          <Users />
          <span>People</span>
        </button>
        <button
          onClick={() => handleNavigation('/', 'feed')}
          className={`flex items-center space-x-3 p-2.5 rounded-lg w-full ${activeTab === 'feed' ? 'text-white bg-customGray x-spacings2' : 'text-gray-400 hover:text-white'}`}
        >
          <House />
          <span>Feed</span>
        </button>
        <button
          onClick={() => handleNavigation('/profile', 'profile')}
          className={`flex items-center space-x-3 p-2.5 rounded-lg w-full ${activeTab === 'profile' ? 'text-white bg-customGray x-spacings2' : 'text-gray-400 hover:text-white'}`}
        >
          <CircleUser />
          <span>My Timeline</span>
        </button>
      </nav>
      <hr className="my-8 border-gray-700"></hr>
      <div>
        <h3 className="text-lg font-semibold mb-4 text-white">Explore</h3>
        <nav className="space-y-4 gap-4">
          <button
            onClick={() => handleNavigation('/events', 'events')}
            className={`flex items-center space-x-3 p-2.5 rounded-lg w-full ${activeTab === 'events' ? 'text-white bg-customGray x-spacings2' : 'text-gray-400 hover:text-white'}`}
          >
            <Calendar />
            <span>Events</span>
          </button>
          <button
            onClick={() => handleNavigation('/groups', 'groups')}
            className={`flex items-center space-x-3 p-2.5 rounded-lg w-full ${activeTab === 'groups' ? 'text-white bg-customGray x-spacings2' : 'text-gray-400 hover:text-white'}`}
          >
            <Boxes />
            <span>Groups</span>
          </button>
        </nav>
      </div>
    </aside>
  );
};

export default Navbar;
