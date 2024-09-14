"use client";

import AllPeopleList from "@/components/AllPeopleList";
import Navbar from "@/components/desktop/Navbar";
import React from "react";

const PeoplePage = () => {
//   const isDesktop = useMediaQuery("(min-width: 768px)");

  return (
    <div className="bg-neutral-950 min-h-screen text-gray-200">
      <div className="flex">
        {/* <aside className="w-1/4 h-screen bg-black p-4 sticky top-0 left-0"> */}
          <Navbar />
        {/* </aside> */}
        <main className="w-screen p-8">
            <AllPeopleList/>
        </main>
      </div>
    </div>
  );
};

export default PeoplePage;
