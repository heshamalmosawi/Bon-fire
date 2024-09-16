"use client";

import { FC } from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNotifications } from "@/context/NotificationContext";
import {
  delNoti,
  handleFollowReq,
  joinGroup,
  readAllNotis,
  sendEventResponse,
} from "@/lib/api";
import { Notification } from "@/lib/interfaces";

export default function DarkNotificationPopover() {
  const { notifications, removeNotification } = useNotifications();

  const hasNewNotifications = notifications?.some((notif) => !notif.notiRead);

  const markAllAsRead = async () => {
    await readAllNotis();
  };

  const deleteNotification = async (id: string) => {
    await delNoti(id);
    removeNotification(id)
  };

  const AssociatedAction: FC<Notification> = (message: Notification) => {
    switch (message.notiType) {
      case "group_invite":
        return (
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={async () => {
                await joinGroup(message.groupID, message.recieverID, true);
                await deleteNotification(message.notiID);
              }}
              className="bg-neutral-700 text-neutral-200 hover:bg-neutral-600 hover:text-neutral-200"
            >
              Accept
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={async () => {
                await joinGroup(message.groupID, message.recieverID, false);
                await deleteNotification(message.notiID);
              }}
              className="bg-neutral-700 text-neutral-200 hover:bg-neutral-600 hover:text-neutral-200"
            >
              Reject
            </Button>
          </div>
        );
      case "join_request":
        return (
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={async () => {
                await joinGroup(message.groupID, message.userID, true);
                await deleteNotification(message.notiID);
              }}
              className="bg-neutral-700 text-neutral-200 hover:bg-neutral-600 hover:text-neutral-200"
            >
              Accept
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={async () => {
                await joinGroup(message.groupID, message.userID, false);
                await deleteNotification(message.notiID);
              }}
              className="bg-neutral-700 text-neutral-200 hover:bg-neutral-600 hover:text-neutral-200"
            >
              Reject
            </Button>
          </div>
        );
      case "follow_request":
        return (
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={async () => {
                await handleFollowReq(message.userID, true);
                await deleteNotification(message.notiID);
              }}
              className="bg-neutral-700 text-neutral-200 hover:bg-neutral-600 hover:text-neutral-200"
            >
              Accept
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={async () => {
                await handleFollowReq(message.userID, false);
                await deleteNotification(message.notiID);
              }}
              className="bg-neutral-700 text-neutral-200 hover:bg-neutral-600 hover:text-neutral-200"
            >
              Reject
            </Button>
          </div>
        );
      case "new_event":
        return (
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={async () => {
                await sendEventResponse(message.eventID, true);
                await deleteNotification(message.notiID);
              }}
              className="bg-neutral-700 text-neutral-200 hover:bg-neutral-600 hover:text-neutral-200"
            >
              Going
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={async () => {
                await sendEventResponse(message.eventID, false);
                await deleteNotification(message.notiID);
              }}
              className="bg-neutral-700 text-neutral-200 hover:bg-neutral-600 hover:text-neutral-200"
            >
              Not Going
            </Button>
          </div>
        );
      default:
        return (
          <Button
            variant="outline"
            size="sm"
            className="bg-neutral-700 text-neutral-200 hover:bg-neutral-600 hover:text-neutral-200"
            onClick={async () => {
              await deleteNotification(message.notiID);
            }}
          >
            Nice!
          </Button>
        );
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="relative bg-black hover:bg-neutral-900 hover:text-neutral-100 border-0"
          onClick={async () => await markAllAsRead()}
        >
          <Bell className="h-[1.2rem] w-[1.2rem] text-neutral-300" />
          {hasNewNotifications && (
            <Badge
              variant="secondary"
              className="absolute -top-1 -right-1 h-3 w-3 p-0 bg-neutral-500"
            />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 bg-neutral-950 border-neutral-800 text-neutral-100">
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-semibold text-neutral-100">Notifications</h3>
        </div>
        <ScrollArea className="h-[300px]">
          {notifications.length === 0 ? (
            <div className=" text-neutral-400 w-full h-[250px] flex items-center justify-center">
              No Notifications :(
            </div>
          ) : (
            notifications.map((notif) => (
              <div
                key={notif.notiID}
                className="mb-4 last:mb-0 bg-neutral-900 p-3 rounded-md"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-grow">
                    <h4 className="text-sm font-semibold text-neutral-100">
                      {notif.notiType
                        .split("_")
                        .map(
                          (str) => str.charAt(0).toUpperCase() + str.slice(1)
                        )
                        .join(" ")}
                    </h4>
                    <p className="text-sm text-neutral-400">
                      {notif.notiContent}
                    </p>
                  </div>
                </div>
                <div className="mt-2 flex justify-between items-center">
                  <AssociatedAction {...notif} />
                  {!notif.notiRead && (
                    <Badge
                      variant="secondary"
                      className="bg-neutral-600 text-neutral-200"
                    >
                      New
                    </Badge>
                  )}
                </div>
              </div>
            ))
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
