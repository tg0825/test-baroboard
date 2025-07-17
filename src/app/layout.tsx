import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import GNB from "@/components/GNB";
import FloatingChatbot from "@/components/FloatingChatbot";
import Footer from "@/components/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://baroboard.web.app'),
  title: "Baroboard",
  description: "Dashboard Analytics Platform - Real-time data visualization and query management system",
  keywords: ["dashboard", "analytics", "data visualization", "query management", "business intelligence"],
  authors: [{ name: "AInity4" }],
  creator: "AInity4",
  publisher: "AInity4",
  
  // Open Graph
  openGraph: {
    title: "Baroboard",
    description: "Dashboard Analytics Platform - Real-time data visualization and query management system",
    url: "https://baroboard.web.app",
    siteName: "Baroboard",
    images: [
      {
        url: "/og-image.svg",
        width: 1200,
        height: 630,
        alt: "Baroboard - Dashboard Analytics Platform",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  
  // Twitter Card
  twitter: {
    card: "summary_large_image",
    title: "Baroboard",
    description: "Dashboard Analytics Platform - Real-time data visualization and query management system",
    images: ["/og-image.svg"],
    creator: "@AInity4",
  },
  
  // Additional metadata
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  
  // Icons
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <div className="h-screen overflow-auto">
          <GNB />
          <div className="pt-15 pb-8 h-full">
            {children}
          </div>
          <FloatingChatbot />
          <Footer />
        </div>
      </body>
    </html>
  );
}
