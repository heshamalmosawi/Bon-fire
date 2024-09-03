import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

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

  const setOnMessage = (callback: (event: MessageEvent) => void) => {
    setOnMessageCallback(() => callback);
  };

  return (
    <ChatWebSocketContext.Provider value={{ socket, setOnMessage }}>
      {children}
    </ChatWebSocketContext.Provider>
  );
};

export const useChatWebSocket = () => {
  const context = useContext(ChatWebSocketContext);
  if (context === undefined) {
    throw new Error(
      "useChatWebSocket must be used within a ChatWebSocketProvider"
    );
  }
  return context;
};
