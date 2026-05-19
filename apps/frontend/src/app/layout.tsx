import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import TopNav from "@/components/layout/TopNav";
import Sidebar from "@/components/layout/Sidebar";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Project Ronin",
  description: "Social Intelligence Platform for Developers",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} ${jetbrainsMono.variable} antialiased bg-gh-bg text-gh-text min-h-screen flex flex-col`}>
        <TopNav />
        <div className="flex flex-1 pt-14 pl-16 md:pl-[240px]">
          <Sidebar />
          <main className="flex-1 min-h-[calc(100vh-56px)] bg-gh-bg">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
