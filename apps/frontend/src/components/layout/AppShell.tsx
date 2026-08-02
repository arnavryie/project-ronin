"use client"

import { usePathname } from "next/navigation"
import TopNav from "@/components/layout/TopNav"
import Sidebar from "@/components/layout/Sidebar"
import { CommandPalette } from "@/components/layout/CommandPalette"

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isLanding = pathname === "/"

  // Landing page renders full-bleed, no app chrome
  if (isLanding) return <>{children}</>

  return (
    <>
      <TopNav />
      <CommandPalette />
      <div className="flex flex-1 pt-14 pl-16 md:pl-[240px]">
        <Sidebar />
        <main className="flex-1 min-h-[calc(100vh-56px)] bg-gh-bg page-enter">{children}</main>
      </div>
    </>
  )
}
