/**
 * This file defines a context and provider for managing the WebSocket connection
 * used for chatting in the application.
 *
 * The context allows components to access the WebSocket connection and register
 * callback functions that will handle incoming messages.
 */

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
  ReactNode,
} from "react";
import Cookies from "js-cookie";

interface WebSocketContextType {
  socket: WebSocket | null;
  setOnMessage: (callback: (event: MessageEvent) => void) => void;
}

const ChatWebSocketContext = createContext<WebSocketContextType | undefined>(
  undefined
);

interface WebSocketProviderProps {
  children: ReactNode;
}

/**
 * ChatWebSocketProvider is a React component that wraps its children with the WebSocket context.
 * It manages the lifecycle of the WebSocket connection to the chat server.
 *
 * @param {ReactNode} children - The child components that will have access to the WebSocket context.
 */
export const ChatWebSocketProvider: React.FC<WebSocketProviderProps> = ({
  children,
}) => {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const onMessageCallbackRef = useRef<(event: MessageEvent) => void>(() => {});

  useEffect(() => {
    const connect = () => {
      if (!Cookies.get("session_id")) {
        return;
      }
      const ws = new WebSocket("ws://localhost:8080/ws");

      ws.onopen = () => {
        console.log("Chat WebSocket connection established");
      };

      ws.onclose = () => {
        console.log("Chat WebSocket connection closed.");
        // Reconnection logic has been disabled
      };

      ws.onerror = (error) => {
        console.error("Chat WebSocket error:", error);
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
        socket.onclose = null; // Remove any onclose handlers to prevent reconnection
        socket.close();
      }
    };
  }, []); // Run only on initial mount

  /**
   * setOnMessage is a function that allows components to set a callback
   * function to handle incoming WebSocket messages.
   *
   * @param {function} callback - The callback function to handle incoming messages.
   */
  const setOnMessage = (callback: (event: MessageEvent) => void) => {
    onMessageCallbackRef.current = callback;
  };

  return (
    <ChatWebSocketContext.Provider value={{ socket, setOnMessage }}>
      {children}
    </ChatWebSocketContext.Provider>
  );
};

/**
 * useChatWebSocket is a custom hook that allows components to access the
 * WebSocket context and interact with the chat WebSocket connection.
 *
 * @returns {WebSocketContextType} The WebSocket connection and the setOnMessage function.
 */
export const useChatWebSocket = () => {
  const context = useContext(ChatWebSocketContext);
  if (context === undefined) {
    throw new Error(
      "useChatWebSocket must be used within a ChatWebSocketProvider"
    );
  }
  return context;
};
