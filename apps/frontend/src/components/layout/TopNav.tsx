'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Bell, Plus, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { mockUser } from '@/lib/mock-data';

export default function TopNav() {
  const [search, setSearch] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/') {
        e.preventDefault();
        const searchInput = document.getElementById('search-input');
        searchInput?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 h-14 bg-gh-surface border-b border-gh-border px-4 flex items-center justify-between z-50">
      {/* Left: Logo & Title */}
      <div className="flex items-center gap-3">
        <Link href="/feed" className="flex items-center gap-2 text-white font-semibold">
          <span className="text-xl">⚔️</span>
          <span className="hidden sm:inline tracking-tight font-bold">Project Ronin</span>
        </Link>
      </div>

      {/* Center: Search */}
      <div className="relative w-[280px]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gh-muted pointer-events-none" />
        <Input 
          id="search-input"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search repos, devs..."
          className="w-full bg-gh-bg border-gh-border text-gh-text pl-9 pr-8 py-1.5 h-8 text-xs rounded-md focus-visible:ring-1 focus-visible:ring-gh-blue focus-visible:border-gh-blue"
        />
        <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 px-1.5 py-0.5 rounded border border-gh-border bg-gh-surface text-[10px] text-gh-muted pointer-events-none">
          /
        </kbd>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        <button className="p-1.5 text-gh-muted hover:text-gh-text hover:bg-gh-surface2 rounded-md transition-colors" title="Notifications">
          <Bell className="w-4 h-4" />
        </button>
        <button className="p-1.5 text-gh-muted hover:text-gh-text hover:bg-gh-surface2 rounded-md transition-colors" title="Create New">
          <Plus className="w-4 h-4" />
        </button>
        <Link href={`/profile/${mockUser.username}`} className="ml-2 group shrink-0" title={`@${mockUser.username}`}>
          <img 
            src={mockUser.avatar}
            alt={mockUser.displayName}
            className="w-8 h-8 rounded-full border border-gh-border hover:border-gh-blue transition-colors bg-gh-surface2"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = `https://api.dicebear.com/7.x/initials/svg?seed=${mockUser.username}`;
            }}
          />
        </Link>
      </div>
    </header>
  );
}
