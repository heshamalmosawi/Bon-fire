"use client";

import AuthDesktop from "@/components/desktop/AuthDesktop";
import useMediaQuery from "@mui/material/useMediaQuery";
import React from "react";

const Page = () => {
  const isDesktop = useMediaQuery("(min-width: 768px)");

  return isDesktop ? <AuthDesktop /> : <></>;
};

export default Page;
