/**
 * This file defines a context for managing the cookie state for authentication
 *
 * The context allows for the application to detect when the cookie has expired by
 * polling for it every 2 seconds, and routing to `/auth` if it doesn't exist 
 */

import React, { createContext, useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";

const CookieCheckContext = createContext<any | undefined>(undefined);

interface CookieCheckProviderProps {
  children: ReactNode;
}

const CookieCheckProvider: React.FC<CookieCheckProviderProps> = ({
  children,
}) => {
  const router = useRouter();

  useEffect(() => {
    const checkCookie = () => {
      const cookie = Cookies.get("session_id");
      if (!cookie) {
        router.push("/auth");
      }
    };

    const intervalId = setInterval(checkCookie, 2000);

    // Clear interval on component unmount
    return () => clearInterval(intervalId);
  }, [router]);

  return (
    <CookieCheckContext.Provider value={{}}>
      {children}
    </CookieCheckContext.Provider>
  );
};

export { CookieCheckProvider, CookieCheckContext };
