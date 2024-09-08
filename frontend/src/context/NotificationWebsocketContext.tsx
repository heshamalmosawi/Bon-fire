import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
  useRef,
} from "react";

import Cookies from "js-cookie";

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
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const onMessageCallbackRef = useRef<(event: MessageEvent) => void>(() => {});

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
      if (socket && socket.readyState === WebSocket.OPEN) {
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
      };

      ws.onclose = () => {
        console.log("Notification WebSocket connection closed.");
        // Optionally implement reconnection logic here
      };

      ws.onerror = (error) => {
        console.error("Notification WebSocket error:", error);
      };

      ws.onmessage = (event) => {
        if (onMessageCallbackRef.current) {
          onMessageCallbackRef.current(event);
        }
      };

      setSocket(ws);
    };

    const handleCookieChange = () => {
      if (Cookies.get("session_id")) {
        connect();
      }
    };

    // Initial connection attempt
    connect();

    // Watch for cookie changes (using a custom event or polling strategy)
    const interval = setInterval(() => {
      if (!socket && Cookies.get("session_id")) {
        handleCookieChange();
      }
    }, 1000); // Poll every 1 second for cookie

    return () => {
      clearInterval(interval);
      if (socket) {
        socket.close();
      }
    };
  }, []); // Remove socket from dependency array to avoid re-running on socket change (im a dumdum)

  const setOnMessage = (callback: (event: MessageEvent) => void) => {
    onMessageCallbackRef.current = callback;
  };

  return (
    <NotificationWebSocketContext.Provider value={{ socket, setOnMessage }}>
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
