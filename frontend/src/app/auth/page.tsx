"use client";

import AuthDesktop from "@/components/desktop/AuthDesktop";
import AuthMobile from "@/components/mobile/AuthMobile";
import useMediaQuery from "@mui/material/useMediaQuery";
import React from "react";

const Page = () => {
  const isDesktop = useMediaQuery("(min-width: 768px)");

  return isDesktop ? <AuthDesktop /> : <AuthMobile />;
};

export default Page;
