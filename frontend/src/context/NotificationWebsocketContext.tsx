import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
  useRef,
} from "react";

import Cookies from "js-cookie";
import { usePathname, useRouter } from "next/navigation";

interface WebSocketContextType {
  socket: WebSocket | null;
  setOnMessage: (callback: (event: MessageEvent) => void) => void;
}

const NotificationWebSocketContext = createContext<
  WebSocketContextType | undefined
>(undefined);

interface WebSocketProviderProps {
  children: ReactNode;
}

export const NotificationWebSocketProvider: React.FC<
  WebSocketProviderProps
> = ({ children }) => {
  const socketRef = useRef<WebSocket | null>(null); // Use ref to avoid re-rendering
  const onMessageCallbackRef = useRef<(event: MessageEvent) => void>(() => {});
  const pathname = usePathname();
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const connect = () => {
      const sessionId = Cookies.get("session_id");
      if (!sessionId) {
        console.log(
          "No session available, WebSocket connection will not be established."
        );
        return;
      }

      // Avoid reconnecting if already connected
      if (
        socketRef.current &&
        socketRef.current.readyState === WebSocket.OPEN
      ) {
        return;
      }

      const ws = new WebSocket("ws://localhost:8080/subscribe");

      ws.onopen = () => {
        console.log("Notification WebSocket connection established.");
        ws.send(
          JSON.stringify({
            type: "noti_history",
          })
        );
        setConnected(true); // Set connected to true on successful connection
      };

      ws.onclose = () => {
        console.log("Notification WebSocket connection closed.");
        setConnected(false); // Set connected to false if WebSocket closes
      };

      ws.onerror = (error) => {
        console.error("Notification WebSocket error:", error);
        setConnected(false); // Handle connection errors
      };

      ws.onmessage = (event) => {
        if (onMessageCallbackRef.current) {
          onMessageCallbackRef.current(event);
        }
      };

      socketRef.current = ws; // Store the WebSocket in ref
    };

    // Initial connection attempt
    connect();

    const interval = setInterval(() => {
      if (
        (!socketRef.current ||
          socketRef.current.readyState !== WebSocket.OPEN) &&
        Cookies.get("session_id")
      ) {
        console.log("no noti ws conn, reconnecting..");
        connect();
      }
    }, 1000); // Poll every 1 second for cookie or WebSocket state

    // return () => {
    //   clearInterval(interval);
    //   if (socketRef.current) {
    //     socketRef.current.close();
    //   }
    // };
  }, []); // Empty dependency array ensures this effect runs once on mount

  useEffect(() => {
    if (pathname === "/auth") {
      if (socketRef.current) {
        socketRef.current.close();
        console.log("WebSocket connection closed due to /auth route.");
      }
    }
  }, [pathname]);

  const setOnMessage = (callback: (event: MessageEvent) => void) => {
    onMessageCallbackRef.current = callback;
  };

  return (
    <NotificationWebSocketContext.Provider
      value={{ socket: socketRef.current, setOnMessage }}
    >
      {children}
    </NotificationWebSocketContext.Provider>
  );
};

export const useNotificationWebSocket = () => {
  const context = useContext(NotificationWebSocketContext);
  if (context === undefined) {
    throw new Error(
      "useNotificationWebSocket must be used within a NotificationWebSocketProvider"
    );
  }
  return context;
};
