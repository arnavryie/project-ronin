import React from 'react';
import { Filter } from 'lucide-react';
import RepoCard from '@/components/feed/RepoCard';
import ForkSpikeCard from '@/components/feed/ForkSpikeCard';
import RightSidebar from '@/components/layout/RightSidebar';
import { getTrendingRepos } from '@/lib/github-api';
import { SocialFeed } from '@/components/feed/SocialFeed';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { auth } from "@/app/api/auth/[...nextauth]/route";

export default async function FeedPage() {
  let repos: any[] = [];
  try {
    repos = await getTrendingRepos(undefined, "weekly");
  } catch (e) {
    repos = [];
  }

  const session = await auth();
  let userSkills: string[] = [];

  if (session?.user?.name) {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
    try {
      const res = await fetch(`${apiUrl}/users/${session.user.name}/skills`, { next: { revalidate: 300 } });
      if (res.ok) {
        const data = await res.json();
        userSkills = data.skills || [];
        
        if (userSkills.length === 0 && (session as any).githubAccessToken) {
          const syncRes = await fetch(`${apiUrl}/sync-user`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token: (session as any).githubAccessToken, username: session.user.name })
          });
          if (syncRes.ok) {
            const syncData = await syncRes.json();
            userSkills = syncData.skills || [];
          }
        }
      }
    } catch (e) {
      console.error("Failed to fetch/sync user skills", e);
    }
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

        {/* Feed content via Tabs */}
        <Tabs defaultValue="feed" className="w-full flex flex-col gap-4">
          <TabsList className="bg-[#161b22] border border-gh-border p-0.5 rounded-md flex self-start gap-1 select-none">
            <TabsTrigger 
              value="feed"
              className="px-4 py-1.5 text-xs text-gh-muted data-[state=active]:bg-gh-surface2 data-[state=active]:text-white rounded-md font-medium cursor-pointer"
            >
              Social Feed
            </TabsTrigger>
            <TabsTrigger 
              value="trending"
              className="px-4 py-1.5 text-xs text-gh-muted data-[state=active]:bg-gh-surface2 data-[state=active]:text-white rounded-md font-medium cursor-pointer"
            >
              Trending
            </TabsTrigger>
          </TabsList>

          <TabsContent value="feed" className="mt-0 outline-none border-none">
            <SocialFeed />
          </TabsContent>

          <TabsContent value="trending" className="mt-0 outline-none border-none flex flex-col gap-4">
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
                    <RepoCard repo={repo} userSkills={userSkills} />
                  </React.Fragment>
                );
              })
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Right Sidebar explore column */}
      <RightSidebar />
    </div>
  );
}
