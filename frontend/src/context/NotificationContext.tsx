import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { useNotificationWebSocket } from "./NotificationWebsocketContext";

interface NotificationContextType {
  notifications: string[];
  addNotification: (message: string) => void;
}

const NotificationContext = createContext<NotificationContextType>({
  notifications: [],
  addNotification: () => {},
});

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({
  children,
}) => {
  const [notifications, setNotifications] = useState<string[]>([]);
  const { socket, setOnMessage } = useNotificationWebSocket();

  useEffect(() => {
    const handleNotification = (event: MessageEvent) => {
      const message = event.data;
      console.log("Notification received:", message);
      // TODO: invoke toast component
      addNotification(message);
    };

    if (socket) {
      setOnMessage(handleNotification);
    }

    return () => {
      if (socket) {
        setOnMessage(() => () => {});
      }
    };
  }, [socket, setOnMessage]);

  const addNotification = (message: string) => {
    setNotifications((prevNotifications) => [...prevNotifications, message]);
  };

  return (
    <NotificationContext.Provider value={{ notifications, addNotification }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error(
      "useNotifications must be used within a NotificationProvider"
    );
  }
  return context;
};
