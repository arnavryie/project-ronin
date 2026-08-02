import React from 'react';
import { Filter } from 'lucide-react';
import RepoCard from '@/components/feed/RepoCard';
import ForkSpikeCard from '@/components/feed/ForkSpikeCard';
import RightSidebar from '@/components/layout/RightSidebar';
import { getTrendingRepos, getReposByTopic } from '@/lib/github-api';
import { SocialFeed } from '@/components/feed/SocialFeed';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { auth } from "@/app/api/auth/[...nextauth]/route";
import { FeedFilterPills } from "@/components/feed/FeedFilterPills";

export default async function FeedPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>
}) {
  const { filter } = await searchParams;
  const activeFilter = filter || "All";
  const lang = activeFilter === "All" || activeFilter === "AI" ? undefined : activeFilter;
  const topic = activeFilter === "AI" ? "machine-learning" : undefined;

  let repos: any[] = [];
  try {
    repos = topic
      ? await getReposByTopic(topic)
      : await getTrendingRepos(lang, "weekly");
  } catch (e) {
    repos = [];
  }

  const session = await auth();
  let userSkills: string[] = [];
  const githubLogin = (session as any)?.githubLogin;

  if (githubLogin) {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
    try {
      const res = await fetch(`${apiUrl}/users/${githubLogin}/skills`, { next: { revalidate: 300 } });
      if (res.ok) {
        const data = await res.json();
        userSkills = data.skills || [];
        if (userSkills.length === 0 && (session as any).githubAccessToken) {
          const syncRes = await fetch(`${apiUrl}/sync-user`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token: (session as any).githubAccessToken, username: githubLogin })
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

  // Seed embeddings for current trending repos (fire and forget — grows the corpus)
  if (repos.length > 0) {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
    fetch(`${apiUrl}/ai/index-repos`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        repos: repos.slice(0, 10).map((r: any) => ({
          full_name: `${r.owner}/${r.name}`, owner: r.owner, name: r.name,
          description: r.description, language: r.language, languageColor: r.languageColor,
          stars: r.stars, forks: r.forks, topics: r.topics, avatarUrl: r.avatarUrl,
        })),
      }),
    }).catch(() => {});
  }

  // AI recommendations via MongoDB Atlas Vector Search
  let recommendations: any[] = [];
  if (githubLogin) {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
      const recRes = await fetch(`${apiUrl}/recommendations/${githubLogin}`, { cache: "no-store" });
      if (recRes.ok) {
        const recData = await recRes.json();
        recommendations = (recData.repos || []).map((r: any) => ({
          id: r.full_name,
          owner: r.owner,
          name: r.name,
          description: r.description || "",
          language: r.language || "Unknown",
          languageColor: r.languageColor || "#8b949e",
          stars: r.stars || 0,
          forks: r.forks || 0,
          forkVelocity: 0,
          topics: r.topics || [],
          updatedAt: "",
          avatarUrl: r.avatarUrl,
        }));
      }
    } catch (e) {
      console.error("recommendations failed", e);
    }
  }

  return (
    <div className="flex gap-4 p-6 max-w-[1200px] mx-auto">
      <div className="flex-1 flex flex-col gap-4">
        <div className="flex items-center justify-between border-b border-gh-border pb-3 mb-2">
          <h2 className="text-xl font-bold text-white tracking-tight">For You</h2>
          <button className="gh-btn-secondary py-1 px-3 text-xs gap-1.5 flex items-center">
            <Filter className="w-3.5 h-3.5 text-gh-muted" />
            <span>Filter feed</span>
          </button>
        </div>

        {/* AI Picks — MongoDB Atlas Vector Search */}
        {recommendations.length > 0 && (
          <div className="flex flex-col gap-3 mb-2">
            <div className="flex items-center gap-2">
              <span className="text-gh-purple">✦</span>
              <h3 className="text-sm font-semibold text-white">AI Picks for You</h3>
              <span className="text-[10px] uppercase tracking-wider text-gh-purple bg-gh-purple/10 border border-gh-purple/30 px-2 py-0.5 rounded-full">
                MongoDB Atlas Vector Search
              </span>
            </div>
            <p className="text-xs text-gh-muted -mt-1">
              Repos semantically matched to your skills ({userSkills.slice(0, 3).join(", ")}).
            </p>
            <div className="flex flex-col gap-3">
              {recommendations.slice(0, 3).map((repo: any) => (
                <RepoCard key={repo.id} repo={repo} userSkills={userSkills} />
              ))}
            </div>
            <div className="border-b border-gh-border pt-1" />
          </div>
        )}

        <Tabs defaultValue={filter ? "trending" : "feed"} className="w-full flex flex-col gap-4">
          <TabsList className="bg-[#161b22] border border-gh-border p-0.5 rounded-md flex self-start gap-1 select-none">
            <TabsTrigger value="feed" className="px-4 py-1.5 text-xs text-gh-muted data-[state=active]:bg-gh-surface2 data-[state=active]:text-white rounded-md font-medium cursor-pointer">
              Social Feed
            </TabsTrigger>
            <TabsTrigger value="trending" className="px-4 py-1.5 text-xs text-gh-muted data-[state=active]:bg-gh-surface2 data-[state=active]:text-white rounded-md font-medium cursor-pointer">
              Trending
            </TabsTrigger>
          </TabsList>

          <TabsContent value="feed" className="mt-0 outline-none border-none">
            <SocialFeed />
          </TabsContent>

          <TabsContent value="trending" className="mt-0 outline-none border-none flex flex-col gap-4">
            <FeedFilterPills active={activeFilter} />

            {repos.length === 0 ? (
              <div className="text-center py-12 border border-gh-border bg-gh-surface rounded-md">
                <span className="text-gh-muted text-sm">No repositories found for this filter.</span>
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
      <RightSidebar />
    </div>
  )
}
