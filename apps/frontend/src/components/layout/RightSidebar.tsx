'use client';

import React from 'react';
import Link from 'next/link';
import { Star } from 'lucide-react';
import { mockRepos, mockDevelopers } from '@/lib/mock-data';
import LanguageDot from '../shared/LanguageDot';
import { formatNumber } from '@/lib/utils';

export default function RightSidebar() {
  const trendingRepos = mockRepos.slice(0, 5);
  const suggestedDevs = mockDevelopers.slice(0, 3);

  return (
    <aside className="w-[296px] shrink-0 hidden lg:flex flex-col gap-6 pl-4 border-l border-gh-border h-[calc(100vh-56px)] overflow-y-auto pb-6">
      {/* Trending repositories */}
      <div className="flex flex-col gap-3">
        <h3 className="text-sm font-semibold text-gh-muted select-none">Trending repositories</h3>
        <div className="flex flex-col gap-3">
          {trendingRepos.map((repo) => (
            <div key={repo.id} className="flex flex-col gap-1">
              <Link 
                href={`/repo/${repo.owner}/${repo.name}`}
                className="text-sm text-gh-blue font-semibold hover:underline truncate"
              >
                {repo.owner}/{repo.name}
              </Link>
              <p className="text-xs text-gh-muted line-clamp-2 leading-normal">
                {repo.description}
              </p>
              <div className="flex items-center gap-3 mt-1">
                <LanguageDot language={repo.language} color={repo.languageColor} />
                <div className="flex items-center gap-1 text-xs text-gh-muted">
                  <Star className="w-3 h-3" />
                  <span className="mono">{formatNumber(repo.stars)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
        <Link 
          href="/trending"
          className="text-xs text-gh-blue hover:underline font-medium mt-1 inline-block"
        >
          Explore more trending →
        </Link>
      </div>

      <hr className="border-gh-border" />

      {/* Suggested developers */}
      <div className="flex flex-col gap-3">
        <h3 className="text-sm font-semibold text-gh-muted select-none">Suggested developers</h3>
        <div className="flex flex-col gap-4">
          {suggestedDevs.map((dev) => (
            <div key={dev.username} className="flex items-start justify-between gap-2">
              <div className="flex gap-2.5 overflow-hidden">
                <img 
                  src={dev.avatar}
                  alt={dev.displayName}
                  className="w-9 h-9 rounded-full border border-gh-border shrink-0 bg-gh-surface"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = `https://api.dicebear.com/7.x/initials/svg?seed=${dev.username}`;
                  }}
                />
                <div className="flex flex-col overflow-hidden leading-tight">
                  <Link 
                    href={`/profile/${dev.username}`}
                    className="text-xs font-semibold text-white hover:underline hover:text-gh-blue truncate"
                  >
                    {dev.displayName}
                  </Link>
                  <span className="text-[10px] text-gh-muted mb-1 select-all">@{dev.username}</span>
                  <p className="text-[11px] text-gh-muted line-clamp-2">
                    {dev.bio}
                  </p>
                </div>
              </div>
              <button className="shrink-0 bg-[#21262d] border border-gh-border text-white text-xs px-2.5 py-1 rounded-md hover:bg-gh-surface2 hover:border-gh-muted transition-colors font-medium">
                Follow
              </button>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
