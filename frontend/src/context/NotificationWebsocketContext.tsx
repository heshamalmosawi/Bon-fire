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
      if (!Cookies.get("session_id")) {
        return;
      }
      const ws = new WebSocket("ws://localhost:8080/subscribe");

      ws.onopen = () => {
        console.log("Notification WebSocket connection established");
      };

      ws.onclose = () => {
        console.log("Notification WebSocket connection closed.");
        // Reconnection logic has been disabled
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

    connect(); // Initial connection attempt

    return () => {
      if (socket) {
        socket.close();
      }
    };
  }, []); // Run only on initial mount

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
