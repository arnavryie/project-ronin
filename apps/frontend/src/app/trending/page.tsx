import React from 'react';
import { Flame } from 'lucide-react';
import RepoCard from '@/components/feed/RepoCard';
import { getTrendingRepos } from '@/lib/github-api';
import { auth } from "@/app/api/auth/[...nextauth]/route";

const LANGUAGES = ["", "Python", "TypeScript", "JavaScript", "Rust", "Go", "Java", "C++"];
const PERIODS = ["daily", "weekly", "monthly"] as const;

export default async function TrendingPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string; language?: string }>
}) {
  const params = await searchParams;
  const period = (PERIODS.includes(params.period as any) ? params.period : "weekly") as "daily" | "weekly" | "monthly";
  const language = params.language || "";

  let repos: any[] = [];
  try {
    repos = await getTrendingRepos(language || undefined, period);
  } catch (e) {
    repos = [];
  }

  const session = await auth();
  let userSkills: string[] = [];

  if (session?.user?.name) {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
      const res = await fetch(`${apiUrl}/users/${session.user.name}/skills`, { next: { revalidate: 300 } });
      if (res.ok) {
        const data = await res.json();
        userSkills = data.skills || [];
      }
    } catch (e) {
      console.error("Failed to fetch user skills", e);
    }
  }

  return (
    <div className="p-6 max-w-[1000px] mx-auto flex flex-col gap-6">
      <div className="border-b border-gh-border pb-4">
        <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          <Flame className="w-5 h-5 text-gh-orange fill-gh-orange/10" />
          <span>Trending Repositories</span>
        </h2>
        <p className="text-xs text-gh-muted mt-1">Real-time trending from GitHub — fastest growing projects this {period}.</p>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mt-4">
          <div className="flex gap-1">
            {PERIODS.map(p => (
              <a
                key={p}
                href={`/trending?period=${p}${language ? `&language=${language}` : ''}`}
                className={`px-3 py-1 rounded-md text-xs font-medium border transition-colors ${period === p ? 'bg-gh-blue text-white border-gh-blue' : 'border-gh-border text-gh-muted hover:text-white hover:border-gh-muted'}`}
              >
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </a>
            ))}
          </div>
          <div className="flex gap-1 flex-wrap">
            {LANGUAGES.map(l => (
              <a
                key={l || "all"}
                href={`/trending?period=${period}${l ? `&language=${l}` : ''}`}
                className={`px-3 py-1 rounded-md text-xs font-medium border transition-colors ${language === l ? 'bg-gh-purple text-white border-gh-purple' : 'border-gh-border text-gh-muted hover:text-white hover:border-gh-muted'}`}
              >
                {l || "All"}
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {repos.length === 0 ? (
          <div className="text-center py-12 border border-gh-border bg-gh-surface rounded-md">
            <span className="text-gh-muted text-sm">No trending repositories found. Try a different filter.</span>
          </div>
        ) : (
          repos.map((repo, idx) => (
            <div key={repo.id} className="relative">
              <div className="absolute -left-3 -top-3 z-10 w-7 h-7 bg-gh-surface border border-gh-border rounded-full flex items-center justify-center font-bold text-xs select-none">
                #{idx + 1}
              </div>
              <RepoCard repo={repo} userSkills={userSkills} />
            </div>
          ))
        )}
      </div>
    </div>
  );
}
