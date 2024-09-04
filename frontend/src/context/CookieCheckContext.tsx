import React, { createContext, useEffect, ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import Cookies from "js-cookie";

const CookieCheckContext = createContext<void | undefined>(undefined);

interface CookieCheckProviderProps {
  children: ReactNode;
}

const CookieCheckProvider: React.FC<CookieCheckProviderProps> = ({
  children,
}) => {
  const router = useRouter();
  const pathName = usePathname();

  useEffect(() => {
    const checkCookie = () => {
      console.log("running cookie check");
      
      try {
        const cookie = Cookies.get("session_id");
        if (!cookie && pathName !== "/auth") {
          router.push("/auth");
        }
      } catch (error) {
        console.error("Error checking cookie:", error);
      }
    };

    const intervalId = setInterval(checkCookie, 2000);

    // Clear interval on component unmount
    return () => clearInterval(intervalId);
  }, [router, pathName]);

  return (
    <CookieCheckContext.Provider value={undefined}>
      {children}
    </CookieCheckContext.Provider>
  );
};

export { CookieCheckProvider, CookieCheckContext };
