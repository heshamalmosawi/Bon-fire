"use client";

import { FC, useState } from "react";
import { Bell, Check, Trash, Eye, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNotifications } from "@/context/NotificationContext";
import { useRouter } from "next/navigation";
import { handleFollow, joinGroup, sendEventResponse } from "@/lib/api";
import { Notification } from "@/lib/interfaces";

export default function DarkNotificationPopover() {
  const { notifications } = useNotifications();

  const hasNewNotifications = notifications?.some((notif) => !notif.notiRead);

  const markAllAsRead = () => {
    // complete
  };

  const deleteNotification = (id: string) => {
    // setNotifications(notifications?.filter((notif) => notif.notiID !== id));
  };

  const markAsRead = (id: string) => {
    // setNotifications(
    //   notifications.map((notif) =>
    //     notif.notiID === id ? { ...notif, isNew: false } : notif
    //   )
    // );
  };

  const AssociatedAction: FC<Notification> = (message: Notification) => {
    switch (message.notiType) {
      case "group_invite":
        return (
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                joinGroup(message.groupID, message.recieverID, true)
              }
              className="bg-gray-700 text-gray-200 hover:bg-gray-600"
            >
              Accept
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                joinGroup(message.groupID, message.recieverID, false)
              }
              className="bg-gray-700 text-gray-200 hover:bg-gray-600"
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
              onClick={() => joinGroup(message.groupID, message.userID, true)}
              className="bg-gray-700 text-gray-200 hover:bg-gray-600"
            >
              Accept
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                joinGroup(message.groupID, message.userID, false)
              }
              className="bg-gray-700 text-gray-200 hover:bg-gray-600"
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
              onClick={() => handleFollow(message.userID, true)}
              className="bg-gray-700 text-gray-200 hover:bg-gray-600"
            >
              Accept
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleFollow(message.userID, false)}
              className="bg-gray-700 text-gray-200 hover:bg-gray-600"
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
              onClick={() => sendEventResponse(message.eventID, true)}
              className="bg-gray-700 text-gray-200 hover:bg-gray-600"
            >
              Going
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => sendEventResponse(message.eventID, false)}
              className="bg-gray-700 text-gray-200 hover:bg-gray-600"
            >
              Not Going
            </Button>
          </div>
        );
      case "follow":
      case "follow_response_accept":
      case "follow_response_reject":
      default:
        return null;
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="relative bg-gray-800 border-gray-700 hover:bg-gray-700 hover:text-gray-100"
        >
          <Bell className="h-[1.2rem] w-[1.2rem] text-gray-300" />
          {hasNewNotifications && (
            <Badge
              variant="secondary"
              className="absolute -top-1 -right-1 h-3 w-3 p-0 bg-neutral-500"
            />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 bg-gray-900 border-gray-800 text-gray-100">
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-semibold text-gray-100">Notifications</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={markAllAsRead}
            className="hover:bg-gray-800 text-gray-300"
          >
            <Check className="mr-2 h-4 w-4" />
            Mark all as read
          </Button>
        </div>
        <ScrollArea className="h-[300px]">
          {notifications.length === 0 ? (
            <p className="text-center text-gray-400">No notifications</p>
          ) : (
            notifications.map((notif) => (
              <div
                key={notif.notiID}
                className="mb-4 last:mb-0 bg-gray-800 p-3 rounded-md"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-grow">
                    <h4 className="text-sm font-semibold text-gray-100">
                      {notif.notiType}
                    </h4>
                    <p className="text-sm text-gray-400">{notif.notiContent}</p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="hover:bg-gray-700 text-gray-400"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      className="bg-gray-800 border-gray-700"
                    >
                      <DropdownMenuItem
                        onClick={() => markAsRead(notif.notiID)}
                        className="text-gray-200 focus:bg-gray-700 focus:text-gray-100"
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        Mark as read
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => deleteNotification(notif.notiID)}
                        className="text-gray-200 focus:bg-gray-700 focus:text-gray-100"
                      >
                        <Trash className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <div className="mt-2 flex justify-between items-center">
                  <AssociatedAction {...notif} />
                  {!notif.notiRead && (
                    <Badge
                      variant="secondary"
                      className="bg-neutral-600 text-gray-200"
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
