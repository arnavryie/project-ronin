import React from 'react';
import { Filter } from 'lucide-react';
import RepoCard from '@/components/feed/RepoCard';
import ForkSpikeCard from '@/components/feed/ForkSpikeCard';
import RightSidebar from '@/components/layout/RightSidebar';
import { getTrendingRepos } from '@/lib/github-api';

export default async function FeedPage() {
  let repos: any[] = [];
  try {
    repos = await getTrendingRepos(undefined, "weekly");
  } catch (e) {
    repos = [];
  }

  return (
    <div className="flex gap-4 p-6 max-w-[1200px] mx-auto">
      {/* Main feed container */}
      <div className="flex-1 flex flex-col gap-4">
        {/* Header bar */}
        <div className="flex items-center justify-between border-b border-gh-border pb-3 mb-2">
          <h2 className="text-xl font-bold text-white tracking-tight">For You</h2>
          <button className="gh-btn-secondary py-1 px-3 text-xs gap-1.5 flex items-center">
            <Filter className="w-3.5 h-3.5 text-gh-muted" />
            <span>Filter feed</span>
          </button>
        </div>

        {/* Feed content */}
        <div className="flex flex-col gap-4">
          {repos.length === 0 ? (
            <div className="text-center py-12 border border-gh-border bg-gh-surface rounded-md">
              <span className="text-gh-muted text-sm">No repositories found. Check your connection.</span>
            </div>
          ) : (
            repos.map((repo, idx) => {
              const showSpikeBefore = repo.forkVelocity > 200 && idx === 0;
              return (
                <React.Fragment key={repo.id}>
                  {showSpikeBefore && (
                    <ForkSpikeCard repoName={`${repo.owner}/${repo.name}`} forkVelocity={repo.forkVelocity} />
                  )}
                  <RepoCard repo={repo} />
                </React.Fragment>
              );
            })
          )}
        </div>
      </div>

      {/* Right Sidebar explore column */}
      <RightSidebar />
    </div>
  );
}
