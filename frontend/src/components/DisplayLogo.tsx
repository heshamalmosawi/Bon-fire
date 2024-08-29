import Image from "next/image";
import logo from "/public/logo.png";
import React from "react";

const DisplayLogo = () => {
  return (
    <div className="w-full flex items-center justify-start px-4 space-x-2 mb-6">
      <div className="w-10 h-9 rounded-full">
        <Image src={logo} alt="Bonfire logo" />
      </div>
      <h1 className="text-white font-bold text-[1.5rem]">Bonfire</h1>
    </div>
  );
};

export default DisplayLogo;
