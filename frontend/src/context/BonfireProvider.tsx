"use client";

import React, { ReactNode } from "react";
import { ChatWebSocketProvider } from "./ChatWebsocketContext";
import { CookieCheckProvider } from "./CookieCheckContext";
import { NotificationProvider } from "./NotificationContext";
import { NotificationWebSocketProvider } from "./NotificationWebsocketContext";

const BonfireProvider = ({ children }: { children: ReactNode }) => {
  return (
    <ChatWebSocketProvider>
      <NotificationWebSocketProvider>
        <NotificationProvider>
          <CookieCheckProvider>{children}</CookieCheckProvider>
        </NotificationProvider>
      </NotificationWebSocketProvider>
    </ChatWebSocketProvider>
  );
};

export default BonfireProvider;
