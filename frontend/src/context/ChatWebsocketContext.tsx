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
  ReactNode,
} from "react";

// Defines the shape of the WebSocket context, providing access to the WebSocket connection
// and a function to set the callback for handling incoming messages.
interface WebSocketContextType {
  socket: WebSocket | null;
  setOnMessage: (callback: (event: MessageEvent) => void) => void;
}

// Creates the context with an initial undefined value.
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
  const [onMessageCallback, setOnMessageCallback] = useState<
    (event: MessageEvent) => void
  >(() => () => {});

  useEffect(() => {
    const connect = () => {
      const ws = new WebSocket("ws://localhost:8080/ws");

      ws.onopen = () => {
        console.log("Chat WebSocket connection established");
      };

      ws.onclose = () => {
        console.log("Chat WebSocket connection closed. Reconnecting...");
        setTimeout(connect, 5000); // Attempt to reconnect after 5 seconds
      };

      ws.onerror = (error) => {
        console.error("Chat WebSocket error:", error);
      };

      ws.onmessage = (event) => {
        if (onMessageCallback) {
          onMessageCallback(event);
        }
      };

      setSocket(ws);
    };

    connect(); // Initial connection attempt

    // Clean up WebSocket connection on component unmount
    return () => {
      if (socket) {
        socket.close();
      }
    };
  }, [onMessageCallback]);

  /**
   * setOnMessage is a function that allows components to set a callback
   * function to handle incoming WebSocket messages.
   *
   * @param {function} callback - The callback function to handle incoming messages.
   */
  const setOnMessage = (callback: (event: MessageEvent) => void) => {
    setOnMessageCallback(() => callback);
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
