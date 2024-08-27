"use client";

import React from "react";
import AllPeopleList from "@/components/GroupList";
import Navbar from "@/components/desktop/Navbar";

const PeoplePage = () => {
  return (
    <div className="bg-neutral-950 min-h-screen text-gray-200">
      <div className="flex">
        {/* Sidebar (Navbar) */}
        <aside className="w-1/4 h-screen bg-black p-4 sticky top-0 left-0">
          <Navbar />
        </aside>
        
        {/* Main Content Area */}
        <main className="w-3/4 p-8">
          <AllPeopleList />
        </main>
      </div>
    </div>
  );
};

export default PeoplePage;
