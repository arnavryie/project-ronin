'use client';

import React from 'react';
import { Compass } from 'lucide-react';
import { mockRepos } from '@/lib/mock-data';
import RepoCard from '@/components/feed/RepoCard';

export default function ExplorePage() {
  const topics = ["Machine Learning", "React", "Next.js", "Web3", "Rust", "API Design"];

  return (
    <div className="p-6 max-w-[1000px] mx-auto flex flex-col gap-6">
      <div className="border-b border-gh-border pb-4">
        <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          <Compass className="w-5 h-5 text-gh-blue" />
          <span>Explore Repositories</span>
        </h2>
        <p className="text-xs text-gh-muted mt-1">Discover trending projects, frameworks, and active technical repositories.</p>
      </div>

      {/* Popular Topics */}
      <div className="flex flex-col gap-2.5">
        <span className="text-xs font-bold text-gh-muted uppercase tracking-wider select-none">Popular Topics</span>
        <div className="flex flex-wrap gap-2">
          {topics.map((topic) => (
            <button 
              key={topic}
              className="text-xs font-semibold text-gh-text bg-gh-surface border border-gh-border hover:border-gh-muted px-3 py-1.5 rounded-md cursor-pointer transition-colors"
            >
              {topic}
            </button>
          ))}
        </div>
      </div>

      {/* Recommended Repos */}
      <div className="flex flex-col gap-3">
        <span className="text-xs font-bold text-gh-muted uppercase tracking-wider select-none">Recommended for you</span>
        <div className="flex flex-col gap-4">
          {mockRepos.map((repo) => (
            <RepoCard key={repo.id} repo={repo} />
          ))}
        </div>
      </div>
    </div>
  );
}
