"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Cookies from "js-cookie";
import axios from "axios";

const page = () => {
  const router = useRouter();

  useEffect(() => {
    axios.post("http://localhost:8080/logout").then(() => {
      if (Cookies.get("session_id")) {
        Cookies.remove("session_id");
      }
      router.push("/auth");
    });
  }, []);

  return null;
};

export default page;
