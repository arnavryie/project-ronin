import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { AppShell } from "@/components/layout/AppShell";
import { Toaster } from "sonner";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Project Ronin — The social layer for developers",
  description: "Discover trending repos, follow builders, and get AI insights on the open-source world. GitHub meets Twitter.",
  openGraph: {
    title: "Project Ronin",
    description: "The social intelligence layer for developers. GitHub meets Twitter.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} ${jetbrainsMono.variable} antialiased bg-gh-bg text-gh-text min-h-screen flex flex-col`}>
        <AuthProvider>
          <AppShell>
            {children}
          </AppShell>
          <Toaster
            position="bottom-right"
            toastOptions={{
              style: {
                background: "#161b22",
                border: "1px solid #30363d",
                color: "#e6edf3",
              },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}
