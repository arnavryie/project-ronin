'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Users, Compass, Award, ShieldAlert, User } from 'lucide-react';
import { mockUser } from '@/lib/mock-data';
import { cn } from '@/lib/utils';

export default function Sidebar() {
  const pathname = usePathname();

  const navItems = [
    { label: 'For You', path: '/feed', icon: Home },
    { label: 'Following', path: '/following', icon: Users },
    { label: 'Explore', path: '/explore', icon: Compass },
    { label: 'Communities', path: '/communities', icon: Award },
    { label: 'Trending', path: '/trending', icon: ShieldAlert },
    { label: 'Profile', path: `/profile/${mockUser.username}`, icon: User },
  ];

  return (
    <aside className="w-16 md:w-[240px] shrink-0 h-[calc(100vh-56px)] fixed left-0 top-14 bg-gh-bg border-r border-gh-border flex flex-col justify-between py-4 z-40">
      <div className="flex flex-col gap-5 px-3">
        {/* User Card - Hidden on mobile */}
        <div className="hidden md:flex items-center gap-3 px-2 py-1 select-none">
          <img 
            src={mockUser.avatar}
            alt={mockUser.displayName}
            className="w-10 h-10 rounded-full border border-gh-border bg-gh-surface"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = `https://api.dicebear.com/7.x/initials/svg?seed=${mockUser.username}`;
            }}
          />
          <div className="flex flex-col overflow-hidden">
            <span className="text-sm font-semibold text-white truncate">{mockUser.displayName}</span>
            <span className="text-xs text-gh-muted truncate">@{mockUser.username}</span>
          </div>
        </div>

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
