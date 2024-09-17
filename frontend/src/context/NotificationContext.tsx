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
import { useToast } from "@/components/ui/use-toast";
import { ToastAction } from "@/components/ui/toast";
import { Notification } from "@/lib/interfaces";
import {
  delNoti,
  handleFollowReq,
  joinGroup,
  sendEventResponse,
} from "@/lib/api";
import { usePathname } from "next/navigation";

/**
 * NotificationContextType defines the shape of the notification context.
 * It includes the list of notifications and a function to add a new notification.
 */
interface NotificationContextType {
  notifications: Notification[];
  addNotification: (message: Notification) => void;
  removeNotification: (id: string) => void;
}

/**
 * Creates the NotificationContext with a default value that includes an empty notifications array
 * and a no-op addNotification function. This ensures that the context always has a default value.
 */
const NotificationContext = createContext<NotificationContextType>({
  notifications: [],
  addNotification: (notifications: Notification) => {},
  removeNotification: (id: string) => {},
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
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { socket, setOnMessage } = useNotificationWebSocket();
  const pathname = usePathname();
  const { toast } = useToast();

  const removeNotification = (id: string) => {
    setNotifications((prevNotifications) =>
      prevNotifications.filter((notification) => notification.notiID !== id)
    );
  };

  useEffect(() => {
    if (pathname === "/auth") {
      setNotifications([]);
    }
  }, [pathname]);

  useEffect(() => {
    /**
     * handleNotification is the callback function that processes incoming WebSocket messages.
     * It adds the received message to the notifications list and can be extended to trigger UI updates like toasts.
     *
     * @param {MessageEvent} event - The WebSocket message event containing the notification data.
     */
    const handleNotification = (event: MessageEvent) => {
      const message = JSON.parse(event.data);
      console.log("Notification received:", message);

      if (!message) {
        return;
      } else if (Array.isArray(message)) {
        // deal with initial updates
        setNotifications(
          message.reverse().map((m) => ({
            notiID: m.noti_id,
            recieverID: m.receiver_id,
            userID: m.user_id ? m.user_id : "",
            groupID: m.group_id ? m.group_id : "",
            eventID: m.event_id ? m.event_id : "",
            notiType: m.noti_type,
            notiContent: m.noti_content,
            notiRead: m.noti_status !== "unread",
          }))
        );

        return;
      }

      if (message.noti_type === "group_invite") {
        toast({
          variant: "default",
          title: "Group Invite",
          description: message.noti_content, // group_id -> need user_id
          action: (
            <div className="flex flex-col gap-2">
              <ToastAction
                altText="accept invite"
                onClick={async () => {
                  await joinGroup(message.group_id, message.receiver_id, true);
                  await delNoti(message.noti_id);
                  removeNotification(message.noti_id);
                }}
              >
                Accept
              </ToastAction>
              <ToastAction
                altText="Reject invite"
                onClick={async () => {
                  await joinGroup(message.group_id, message.receiver_id, false);
                  await delNoti(message.noti_id);
                  removeNotification(message.noti_id);
                }}
              >
                Reject
              </ToastAction>
            </div>
          ),
        });
      } else if (message.noti_type === "join_request") {
        toast({
          variant: "default",
          title: "Group Join Request",
          description: message.noti_content, // user_id of the requester -> need group_id
          action: (
            <div className="flex flex-col gap-2">
              <ToastAction
                altText="accept request"
                onClick={async () => {
                  await joinGroup(message.group_id, message.user_id, true);
                  await delNoti(message.noti_id);
                  removeNotification(message.noti_id);
                }}
              >
                Accept
              </ToastAction>
              <ToastAction
                altText="Reject request"
                onClick={async () => {
                  await joinGroup(message.group_id, message.user_id, false);
                  await delNoti(message.noti_id);
                  removeNotification(message.noti_id);
                }}
              >
                Reject
              </ToastAction>
            </div>
          ),
        });
      } else if (message.noti_type === "follow") {
        toast({
          variant: "default",
          title: "New Follower!",
          description: message.noti_content,
        });
      } else if (message.noti_type === "follow_request") {
        toast({
          variant: "default",
          title: "Follow Request",
          description: message.noti_content,
          action: (
            <div className="flex flex-col gap-2">
              <ToastAction
                altText="accept request"
                onClick={async () => {
                  await handleFollowReq(message.user_id, true);
                  await delNoti(message.noti_id);
                  removeNotification(message.noti_id);
                }}
              >
                Accept
              </ToastAction>
              <ToastAction
                altText="Reject request"
                onClick={async () => {
                  await handleFollowReq(message.user_id, false);
                  await delNoti(message.noti_id);
                  removeNotification(message.noti_id);
                }}
              >
                Reject
              </ToastAction>
            </div>
          ),
        });
      } else if (message.noti_type === "follow_response_accept") {
        toast({
          variant: "default",
          title: "Follow Request accepted!",
          description: message.noti_content,
        });
      } else if (message.noti_type === "follow_response_accept") {
        toast({
          variant: "destructive",
          title: "Follow Request rejected...",
          description: message.noti_content,
        });
      } else if (message.noti_type === "new_event") {
        toast({
          variant: "default",
          title: "New Event!",
          description: message.noti_content,
          action: (
            <div className="flex flex-col gap-2">
              <ToastAction
                altText="going"
                onClick={async () => {
                  await sendEventResponse(message.event_id, true);
                  await delNoti(message.noti_id);
                  removeNotification(message.noti_id);
                }}
              >
                Going
              </ToastAction>
              <ToastAction
                altText="not going"
                onClick={async () => {
                  await sendEventResponse(message.event_id, false);
                  await delNoti(message.noti_id);
                  removeNotification(message.noti_id);
                }}
              >
                Not Going
              </ToastAction>
            </div>
          ),
        });
      }

      addNotification({
        notiID: message.noti_id,
        recieverID: message.receiver_id,
        userID: message.user_id ? message.user_id : "",
        groupID: message.group_id ? message.group_id : "",
        eventID: message.event_id ? message.event_id : "",
        notiType: message.noti_type,
        notiContent: message.noti_content,
        notiRead: message.noti_status !== "unread",
      });
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

  const addNotification = (message: Notification) => {
    setNotifications((prevNotifications) => [...prevNotifications, message]);
  };

  return (
    <NotificationContext.Provider
      value={{ notifications, addNotification, removeNotification }}
    >
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
