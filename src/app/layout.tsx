import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import GNB from "@/components/GNB";
import Sidebar from "@/components/Sidebar";
import FloatingChatbot from "@/components/FloatingChatbot";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Baroboard - Query Dashboard",
  description: "Dashboard with Redash queries and n8n chatbot integration",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <GNB />
        <div style={{ paddingTop: '60px' }}>
          <Sidebar />
        </div>
        <FloatingChatbot />
      </body>
    </html>
  );
}
