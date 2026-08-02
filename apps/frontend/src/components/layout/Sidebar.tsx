'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Users, Compass, Award, ShieldAlert, User, Bookmark } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { cn } from '@/lib/utils';

export default function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  
  const username = (session?.user as any)?.login || session?.user?.name || 'guest';
  const avatar = session?.user?.image || `https://api.dicebear.com/7.x/initials/svg?seed=${username}`;
  const displayName = session?.user?.name || username;

  const navItems = [
    { label: 'For You', path: '/feed', icon: Home },
    { label: 'Following', path: '/following', icon: Users },
    { label: 'Explore', path: '/explore', icon: Compass },
    { label: 'Communities', path: '/communities', icon: Award },
    { label: 'Bookmarks', path: '/bookmarks', icon: Bookmark },
    { label: 'Trending', path: '/trending', icon: ShieldAlert },
    { label: 'Profile', path: `/profile/${username}`, icon: User },
  ];

  return (
    <aside className="w-16 md:w-[240px] shrink-0 h-[calc(100vh-56px)] fixed left-0 top-14 bg-gh-bg border-r border-gh-border flex flex-col justify-between py-4 z-40">
      <div className="flex flex-col gap-5 px-3">
        {/* User Card - Hidden on mobile */}
        {session ? (
          <div className="hidden md:flex items-center gap-3 px-2 py-1 select-none">
            <img 
              src={avatar}
              alt={displayName}
              className="w-10 h-10 rounded-full border border-gh-border bg-gh-surface"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = `https://api.dicebear.com/7.x/initials/svg?seed=${username}`;
              }}
            />
            <div className="flex flex-col overflow-hidden">
              <span className="text-sm font-semibold text-white truncate">{displayName}</span>
              <span className="text-xs text-gh-muted truncate">@{username}</span>
            </div>
          </div>
        ) : (
          <div className="hidden md:flex items-center gap-3 px-2 py-1 select-none h-[48px]">
            <span className="text-xs text-gh-muted">Not logged in</span>
          </div>
        )}

        {/* Divider */}
        <hr className="hidden md:block border-gh-border -mx-3" />

        {/* Navigation items */}
        <nav className="flex flex-col gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname.startsWith(item.path);

            return (
              <Link 
                key={item.path}
                href={item.path}
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md text-sm text-gh-muted transition-colors hover:bg-gh-surface hover:text-gh-text",
                  isActive && "bg-gh-surface2 text-white font-medium"
                )}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span className="hidden md:inline">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="px-3">
        <div className="hidden md:block px-2 text-[10px] text-gh-muted">
          <span>Project Ronin v1.0.0</span>
        </div>
      </div>
    </aside>
  );
}
