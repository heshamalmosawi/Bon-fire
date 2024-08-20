import Image from "next/image";
import logo from "/public/logo.png";
import React from "react";

const DisplayLogo = () => {
  return (
    <div className="w-full flex items-center justify-start px-4">
      <Image src={logo} alt="Bonfire logo" width={70} height={70}/>
      <h1 className="text-white font-bold text-[2rem]">Bonfire</h1>
    </div>
  );
};

export default DisplayLogo;
