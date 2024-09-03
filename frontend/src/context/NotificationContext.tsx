/**
 * This file defines a context and provider for managing notifications within the application.
 * The notifications are received via a WebSocket connection to the server.
 *
 * The context allows components to access the list of notifications and add new notifications
 * to the list when they are received from the WebSocket.
 */

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { useNotificationWebSocket } from "./NotificationWebsocketContext";

/**
 * NotificationContextType defines the shape of the notification context.
 * It includes the list of notifications and a function to add a new notification.
 */
interface NotificationContextType {
  notifications: string[];
  addNotification: (message: string) => void;
}

/**
 * Creates the NotificationContext with a default value that includes an empty notifications array
 * and a no-op addNotification function. This ensures that the context always has a default value.
 */
const NotificationContext = createContext<NotificationContextType>({
  notifications: [],
  addNotification: () => {},
});

interface NotificationProviderProps {
  children: ReactNode;
}

/**
 * NotificationProvider is a React component that wraps its children with the Notification context.
 * It manages the state of notifications and sets up the WebSocket connection to receive new notifications.
 *
 * @param {ReactNode} children - The child components that will have access to the Notification context.
 */
export const NotificationProvider: React.FC<NotificationProviderProps> = ({
  children,
}) => {
  const [notifications, setNotifications] = useState<string[]>([]);
  const { socket, setOnMessage } = useNotificationWebSocket();

  useEffect(() => {
    /**
     * handleNotification is the callback function that processes incoming WebSocket messages.
     * It adds the received message to the notifications list and can be extended to trigger UI updates like toasts.
     *
     * @param {MessageEvent} event - The WebSocket message event containing the notification data.
     */
    const handleNotification = (event: MessageEvent) => {
      const message = event.data;
      console.log("Notification received:", message);
      // TODO: invoke toast component here
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

/**
 * useNotifications is a custom hook that allows components to access the Notification context.
 * It provides access to the list of notifications and the addNotification function.
 *
 * @returns {NotificationContextType} The list of notifications and the addNotification function.
 */
export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error(
      "useNotifications must be used within a NotificationProvider"
    );
  }
  return context;
};
