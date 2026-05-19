'use client';

import React from 'react';
import Link from 'next/link';
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

export default function RepoCard({ repo, userSkills = [] }: RepoCardProps) {
  const isForkSpike = repo.forkVelocity > 200;
  
  const repoTechStack = [...(repo.topics || []), repo.language?.toLowerCase() || ""];
  const matchedSkills = userSkills.filter(skill =>
    repoTechStack.some(tech =>
      tech.toLowerCase().includes(skill.toLowerCase()) ||
      skill.toLowerCase().includes(tech.toLowerCase())
    )
  );
  const skillMatch = repo.skillMatch > 0 ? repo.skillMatch : matchedSkills.length;


  return (
    <div className="flex flex-col gap-3 p-4 bg-gh-surface border border-gh-border rounded-md hover:border-gh-blue transition-colors">
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
            <Link 
              href={`/repo/${repo.owner}/${repo.name}`}
              className="text-base text-gh-blue font-bold hover:underline truncate"
            >
              {repo.owner}/{repo.name}
            </Link>
            <span className="text-xs text-gh-muted select-none">•</span>
            <span className="text-xs text-gh-muted">{repo.updatedAt}</span>
          </div>

          <p className="text-sm text-gh-muted line-clamp-2 leading-relaxed">
            {repo.description}
          </p>
        </div>
      </div>

      {/* Topics row */}
      {repo.topics.length > 0 && (
        <div className="flex items-center gap-1.5 flex-wrap pl-13">
          {repo.topics.map((topic) => (
            <span 
              key={topic}
              className="text-xs font-medium text-gh-blue bg-gh-blue/5 border border-gh-blue/20 hover:bg-gh-blue/15 px-2 py-0.5 rounded-full select-none transition-colors"
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
        <button className="gh-btn-secondary py-1 px-3 text-xs gap-1.5">
          <Star className="w-3.5 h-3.5 text-gh-muted" />
          <span>Star</span>
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
          className="mt-2 text-xs flex items-center gap-2 border rounded-md px-3 py-2 text-purple-400 select-none animate-pulse"
          style={{
            background: 'rgba(137, 87, 229, 0.15)',
            borderColor: '#8957e5',
          }}
        >
          <span className="text-base leading-none">✦</span>
          <span>{skillMatch} of your skills match open issues in this repo</span>
        </div>
      )}
    </div>
  );
}
