import Image from "next/image";
import logo from "/public/logo.png";
import React from "react";

const DisplayLogo = () => {
  return (
    <div className="w-[80%] flex items-center justify-start">
      <Image src={logo} alt="Bonfire logo" width={60} height={60}/>
      <h1 className="text-white font-bold text-[2rem]">Bonfire</h1>
    </div>
  );
};

export default DisplayLogo;
