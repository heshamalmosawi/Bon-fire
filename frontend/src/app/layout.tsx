import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import BonfireProvider from "@/context/BonfireProvider";

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
        <BonfireProvider>
          <main>{children}</main>
          <Toaster />
        </BonfireProvider>
      </body>
    </html>
  );
}
