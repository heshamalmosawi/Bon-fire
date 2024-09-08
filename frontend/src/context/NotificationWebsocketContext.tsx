/**
 * This file defines a context and provider for managing the WebSocket connection
 * specifically used for receiving notifications from the server.
 *
 * The context provides access to the WebSocket connection and allows components
 * to register callback functions that handle incoming notification messages.
 */

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

/**
 * NotificationWebSocketProvider is a React component that wraps its children with the
 * NotificationWebSocket context. It manages the lifecycle of the WebSocket connection
 * to the notifications endpoint on the server.
 *
 * @param {ReactNode} children - The child components that will have access to the WebSocket context.
 */
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
  }, [socket]); // Add socket as a dependency

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
