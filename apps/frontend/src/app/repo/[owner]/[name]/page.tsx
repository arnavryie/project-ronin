'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { mockRepos, mockIssues, mockUser } from '@/lib/mock-data';
import IssueRow from '@/components/repo/IssueRow';
import AIInsightPanel from '@/components/repo/AIInsightPanel';
import SkillBadge from '@/components/shared/SkillBadge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Star, GitFork, Play } from 'lucide-react';
import { formatNumber } from '@/lib/utils';

export default function RepoDetailPage() {
  const params = useParams();
  const owner = params.owner as string;
  const name = params.name as string;

  const repo = mockRepos.find(r => r.owner === owner && r.name === name) || mockRepos[0];

  return (
    <div className="p-6 max-w-[1200px] mx-auto flex flex-col gap-6">
      {/* Header section */}
      <div className="flex flex-col gap-4 border-b border-gh-border pb-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xl">⚔️</span>
            <a href={`https://github.com/${repo.owner}`} target="_blank" rel="noopener noreferrer" className="text-lg text-gh-blue font-semibold hover:underline">
              {repo.owner}
            </a>
            <span className="text-gh-muted text-lg">/</span>
            <a href={`https://github.com/${repo.owner}/${repo.name}`} target="_blank" rel="noopener noreferrer" className="text-lg text-gh-blue font-bold hover:underline">
              {repo.name}
            </a>
            <span className="text-[10px] text-gh-muted px-2 py-0.5 rounded-full border border-gh-border bg-gh-surface font-semibold select-none">
              Public
            </span>
          </div>

          {/* Action stats */}
          <div className="flex items-center gap-2 flex-wrap select-none">
            <div className="flex items-center rounded-md border border-gh-border bg-gh-surface text-xs leading-none overflow-hidden">
              <button className="flex items-center gap-1.5 px-3 py-1.5 hover:bg-gh-surface2 transition-colors border-r border-gh-border text-white font-medium">
                <Star className="w-3.5 h-3.5 text-gh-muted" />
                <span>Star</span>
              </button>
              <div className="px-3 py-1.5 bg-gh-bg mono text-gh-muted font-medium">
                {formatNumber(repo.stars)}
              </div>
            </div>

            <div className="flex items-center rounded-md border border-gh-border bg-gh-surface text-xs leading-none overflow-hidden">
              <button className="flex items-center gap-1.5 px-3 py-1.5 hover:bg-gh-surface2 transition-colors border-r border-gh-border text-white font-medium">
                <GitFork className="w-3.5 h-3.5 text-gh-muted" />
                <span>Fork</span>
              </button>
              <div className="px-3 py-1.5 bg-gh-bg mono text-gh-muted font-medium">
                {formatNumber(repo.forks)}
              </div>
            </div>
          </div>
        </div>

        <p className="text-sm text-gh-muted leading-relaxed max-w-[900px] -mt-1">
          {repo.description}
        </p>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Tabs with IssueRow */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <Tabs defaultValue="issues" className="w-full">
            <TabsList className="bg-[#161b22] border border-gh-border p-0.5 rounded-md flex self-start gap-1 select-none">
              <TabsTrigger 
                value="issues"
                className="flex items-center gap-1.5 px-4 py-1.5 text-xs text-gh-muted data-[state=active]:bg-gh-surface2 data-[state=active]:text-white rounded-md font-medium cursor-pointer"
              >
                <Play className="w-3.5 h-3.5" />
                <span>Issues ({mockIssues.length})</span>
              </TabsTrigger>
              <TabsTrigger 
                value="pulls"
                className="flex items-center gap-1.5 px-4 py-1.5 text-xs text-gh-muted data-[state=active]:bg-gh-surface2 data-[state=active]:text-white rounded-md font-medium cursor-pointer"
              >
                <GitFork className="w-3.5 h-3.5" />
                <span>Pull Requests (0)</span>
              </TabsTrigger>
            </TabsList>

            <div className="mt-4 border border-gh-border rounded-md bg-gh-surface overflow-hidden">
              <TabsContent value="issues" className="flex flex-col m-0 divide-y divide-gh-border">
                {mockIssues.map(issue => (
                  <IssueRow key={issue.id} issue={issue} />
                ))}
              </TabsContent>
              
              <TabsContent value="pulls" className="m-0 p-12 text-center">
                <span className="text-sm text-gh-muted">No open pull requests found.</span>
              </TabsContent>
            </div>
          </Tabs>
        </div>

        {/* Right Column: Skill Match Matches and AI Insights */}
        <div className="flex flex-col gap-6">
          {/* Skill Matches card */}
          <div className="p-4 bg-gh-surface border border-gh-border rounded-md select-none">
            <h4 className="text-xs font-bold text-gh-muted tracking-wide uppercase mb-3">Your Skill Matches</h4>
            <div className="flex flex-wrap gap-1.5">
              {mockUser.skills.map((skill) => (
                <SkillBadge key={skill} skill={skill} />
              ))}
            </div>
            <p className="text-[10px] text-gh-muted mt-3 leading-normal">
              ✦ Highlighted badges correspond to technical skills from your public profile matching open repository tasks.
            </p>
          </div>

          {/* AI Insights Panel */}
          <AIInsightPanel />
        </div>
      </div>
    </div>
  );
}
