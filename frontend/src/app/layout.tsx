import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ChatWebSocketProvider } from "@/context/ChatWebsocketContext";
import { NotificationWebSocketProvider } from "@/context/NotificationWebsocketContext";
import { NotificationProvider } from "@/context/NotificationContext";
import { CookieCheckProvider } from "@/context/CookieCheckContext";

export const metadata: Metadata = {
  title: "Bonfire",
  description: "A warm place for all",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <CookieCheckProvider>
          <ChatWebSocketProvider>
            <NotificationWebSocketProvider>
              <NotificationProvider>{children}</NotificationProvider>
            </NotificationWebSocketProvider>
          </ChatWebSocketProvider>
          <Toaster />
        </CookieCheckProvider>
      </body>
    </html>
  );
}
