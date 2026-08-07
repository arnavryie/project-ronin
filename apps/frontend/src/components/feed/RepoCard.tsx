'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { useSession } from "next-auth/react"
import { Star, GitFork, Eye, Flame, TrendingUp } from 'lucide-react';
import LanguageDot from '../shared/LanguageDot';
import { formatNumber } from '@/lib/utils';

export interface Repo {
  id: string;
  owner: string;
  name: string;
  description: string;
  language: string;
  languageColor: string;
  stars: number;
  forks: number;
  forkVelocity: number;
  topics: string[];
  updatedAt: string;
  skillMatch: number;
  trending: boolean;
}

interface RepoCardProps {
  repo: Repo;
  userSkills?: string[];
}

export function RepoCardSkeleton() {
  return (
    <div className="gh-card p-4 flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <div className="skeleton w-10 h-10 rounded-full shrink-0" />
        <div className="flex flex-col gap-2 flex-1">
          <div className="skeleton h-4 w-48" />
          <div className="skeleton h-3 w-32" />
        </div>
      </div>
      <div className="skeleton h-3 w-full" />
      <div className="skeleton h-3 w-4/5" />
      <div className="flex gap-2">
        <div className="skeleton h-5 w-16 rounded-full" />
        <div className="skeleton h-5 w-20 rounded-full" />
        <div className="skeleton h-5 w-14 rounded-full" />
      </div>
      <div className="flex gap-2 mt-1">
        <div className="skeleton h-7 w-16 rounded-md" />
        <div className="skeleton h-7 w-16 rounded-md" />
        <div className="skeleton h-7 w-16 rounded-md" />
      </div>
    </div>
  )
}


export default function RepoCard({ repo, userSkills = [] }: RepoCardProps) {
  const isForkSpike = repo.forkVelocity > 200;
  const router = useRouter()
  const { data: session } = useSession()
  
  const [starred, setStarred] = useState(false)
  const [starCount, setStarCount] = useState(repo.stars)

  const handleStar = () => {
    const newStarred = !starred
    setStarred(newStarred)
    setStarCount(prev => newStarred ? prev + 1 : prev - 1)
    toast(newStarred ? `⭐ Starred ${repo.owner}/${repo.name}` : `Unstarred ${repo.owner}/${repo.name}`)
  }
  
  const [bookmarked, setBookmarked] = useState(false)

  const handleBookmark = async () => {
    const newState = !bookmarked
    setBookmarked(newState)
    toast(newState ? "🔖 Saved to bookmarks" : "Removed from bookmarks")
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "/api"
    const userId = session?.user?.email || "anonymous"
    try {
      if (newState) {
        await fetch(`${apiUrl}/bookmarks`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_id: userId,
            repo_full_name: `${repo.owner}/${repo.name}`,
            repo_data: repo
          })
        })
      } else {
        await fetch(`${apiUrl}/bookmarks/${encodeURIComponent(userId)}/${repo.owner}/${repo.name}`, {
          method: "DELETE"
        })
      }
    } catch {}
  }
  
  const repoTechStack = [...(repo.topics || []), repo.language?.toLowerCase() || ""];
  const matchedSkills = userSkills.filter(skill =>
    repoTechStack.some(tech =>
      tech.toLowerCase().includes(skill.toLowerCase()) ||
      skill.toLowerCase().includes(tech.toLowerCase())
    )
  );
  const skillMatch = (repo.skillMatch ?? 0) > 0 ? repo.skillMatch : matchedSkills.length;


  return (
    <div className="gh-card p-4 flex flex-col gap-3 hover:border-gh-blue/50 hover:shadow-[0_0_0_1px_rgba(88,166,255,0.1)] transition-all cursor-default relative group">
      {/* Fork Spike Header Indicator */}
      {isForkSpike && (
        <div className="flex items-center gap-1.5 text-xs font-semibold text-gh-orange bg-gh-orange/10 px-2.5 py-1 rounded-md border border-gh-orange/20 self-start select-none">
          <Flame className="w-3.5 h-3.5 fill-gh-orange/20 animate-pulse" />
          <TrendingUp className="w-3.5 h-3.5" />
          <span>+{repo.forkVelocity} forks in last 24h</span>
        </div>
      )}

      {/* Main Row */}
      <div className="flex items-start gap-3">
        <img 
          src={`https://github.com/${repo.owner}.png`}
          alt={repo.owner}
          className="w-10 h-10 rounded-md border border-gh-border bg-gh-bg shrink-0"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src = `https://api.dicebear.com/7.x/initials/svg?seed=${repo.owner}`;
          }}
        />
        
        <div className="flex flex-col gap-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <a 
              href={`https://github.com/${repo.owner}/${repo.name}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-base text-gh-blue font-bold hover:underline truncate"
            >
              {repo.owner}/{repo.name}
            </a>
            <span className="text-xs text-gh-muted select-none">•</span>
            <span className="text-xs text-gh-muted">{repo.updatedAt}</span>
          </div>

          <p className="text-sm text-gh-muted line-clamp-2 leading-relaxed">
            {repo.description}
          </p>
        </div>
      </div>

      {/* Topics */}
      {repo.topics && repo.topics.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-1 pl-13">
          {repo.topics.slice(0, 4).map((topic: string) => (
            <span
              key={topic}
              className="text-[11px] px-2 py-0.5 rounded-full border border-[#1f4f7c] bg-[#1f3d5c] text-gh-blue font-medium"
            >
              {topic}
            </span>
          ))}
        </div>
      )}

      {/* Stats bar */}
      <div className="flex items-center gap-4 text-xs text-gh-muted pl-13 flex-wrap select-none">
        <LanguageDot language={repo.language} color={repo.languageColor} />
        
        <div className="flex items-center gap-1">
          <Star className="w-3.5 h-3.5" />
          <span className="mono">{formatNumber(repo.stars)}</span>
        </div>

        <div className="flex items-center gap-1">
          <GitFork className="w-3.5 h-3.5" />
          <span className="mono">{formatNumber(repo.forks)}</span>
        </div>
      </div>

      {/* Action triggers */}
      <div className="flex items-center gap-2 pl-13 mt-1 flex-wrap">
        <button
          onClick={handleBookmark}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs border rounded-md transition-colors ${
            bookmarked
              ? "bg-gh-purple/10 border-gh-purple/50 text-gh-purple"
              : "bg-gh-surface border-gh-border text-gh-muted hover:text-white hover:bg-gh-surface2"
          }`}
          title="Save for later"
        >
          {bookmarked ? "🔖" : "📑"} Save
        </button>
        <button
          onClick={handleStar}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs border rounded-md transition-colors font-medium ${
            starred
              ? "bg-yellow-500/10 border-yellow-500/50 text-yellow-400"
              : "bg-gh-surface border-gh-border text-gh-text hover:bg-gh-surface2"
          }`}
        >
          <span>{starred ? "★" : "☆"}</span>
          <span>Star</span>
          <span className="tabular-nums ml-1 text-gh-muted">{starCount >= 1000 ? (starCount/1000).toFixed(1)+"k" : starCount}</span>
        </button>
        <button className="gh-btn-secondary py-1 px-3 text-xs gap-1.5">
          <GitFork className="w-3.5 h-3.5 text-gh-muted" />
          <span>Fork</span>
        </button>
        <button className="gh-btn-secondary py-1 px-3 text-xs gap-1.5">
          <Eye className="w-3.5 h-3.5 text-gh-muted" />
          <span>Watch</span>
        </button>
      </div>

      {/* Skill Match Banner */}
      {skillMatch > 0 && (
        <div 
          className="mt-2 text-xs flex items-center gap-2 border border-gh-purple bg-gh-purple/15 rounded-md px-3 py-2 text-purple-400 select-none animate-pulse"
        >
          <span className="text-base leading-none">✦</span>
          <span>{skillMatch} of your skills match open issues in this repo</span>
        </div>
      )}
    </div>
  );
}
