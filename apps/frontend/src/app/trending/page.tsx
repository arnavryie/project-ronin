'use client';

import React from 'react';
import { Flame } from 'lucide-react';
import { mockRepos } from '@/lib/mock-data';
import RepoCard from '@/components/feed/RepoCard';

export default function TrendingPage() {
  const sortedRepos = [...mockRepos].sort((a, b) => b.forkVelocity - a.forkVelocity);

  return (
    <div className="p-6 max-w-[1000px] mx-auto flex flex-col gap-6">
      <div className="border-b border-gh-border pb-4">
        <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          <Flame className="w-5 h-5 text-gh-orange fill-gh-orange/10" />
          <span>Trending Repositories</span>
        </h2>
        <p className="text-xs text-gh-muted mt-1">See the fastest-growing projects inside the developer intelligence community.</p>
      </div>

      <div className="flex flex-col gap-4">
        {sortedRepos.map((repo, idx) => (
          <div key={repo.id} className="relative">
            <div className="absolute -left-3 -top-3 z-10 w-7 h-7 bg-gh-surface border border-gh-border rounded-full flex items-center justify-center font-bold text-xs select-none">
              #{idx + 1}
            </div>
            
            <RepoCard repo={repo} />
          </div>
        ))}
      </div>
    </div>
  );
}
