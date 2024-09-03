import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ChatWebSocketProvider } from "@/context/ChatWebsocketContext";
import { NotificationWebSocketProvider } from "@/context/NotificationWebsocketContext";
import { NotificationProvider } from "@/context/NotificationContext";

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
        <ChatWebSocketProvider>
          <NotificationWebSocketProvider>
            <NotificationProvider>{children}</NotificationProvider>
          </NotificationWebSocketProvider>
        </ChatWebSocketProvider>
        <Toaster />
      </body>
    </html>
  );
}
