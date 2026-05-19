'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Bell, Plus, Search, LogIn, LogOut } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useSession, signIn, signOut } from 'next-auth/react';

export default function TopNav() {
  const [search, setSearch] = useState('');
  const { data: session, status } = useSession();

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

  const username = (session?.user as any)?.login || session?.user?.name?.toLowerCase().replace(/\s+/g, '') || 'arnavryie';
  const avatar = session?.user?.image || `https://github.com/${username}.png`;
  const displayName = session?.user?.name || username;

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

        {status === 'loading' ? (
          <div className="ml-2 w-8 h-8 rounded-full bg-gh-surface2 animate-pulse" />
        ) : session ? (
          <div className="flex items-center gap-2 ml-2">
            <Link href={`/profile/${username}`} className="group shrink-0" title={`@${username}`}>
              <img 
                src={avatar}
                alt={displayName}
                className="w-8 h-8 rounded-full border border-gh-border hover:border-gh-blue transition-colors bg-gh-surface2"
              />
            </Link>
            <button
              onClick={() => signOut()}
              title="Sign out"
              className="p-1.5 text-gh-muted hover:text-red-400 hover:bg-gh-surface2 rounded-md transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => signIn('github')}
            className="ml-2 flex items-center gap-1.5 gh-btn-primary py-1.5 px-3 text-xs font-semibold"
          >
            <LogIn className="w-3.5 h-3.5" />
            Sign in
          </button>
        )}
      </div>
    </header>
  );
}
