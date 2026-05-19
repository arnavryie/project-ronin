import React from 'react';
import { getRepoDetail } from '@/lib/github-api';
import IssueRow from '@/components/repo/IssueRow';
import AIInsightPanel from '@/components/repo/AIInsightPanel';
import SkillBadge from '@/components/shared/SkillBadge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Star, GitFork, Play, ExternalLink } from 'lucide-react';
import { formatNumber } from '@/lib/utils';
import Link from 'next/link';

export default async function RepoDetailPage({ params }: { params: Promise<{ owner: string; name: string }> }) {
  const { owner, name } = await params;

  let repo: any = null;
  try {
    repo = await getRepoDetail(owner, name);
  } catch (e) {
    return (
      <div className="p-6 max-w-[1200px] mx-auto text-center py-24">
        <p className="text-gh-muted text-sm">Repository not found or GitHub API error.</p>
        <Link href="/feed" className="text-gh-blue text-sm hover:underline mt-2 inline-block">← Back to feed</Link>
      </div>
    );
  }

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
            <a href={repo.htmlUrl} target="_blank" rel="noopener noreferrer" className="text-lg text-gh-blue font-bold hover:underline">
              {repo.name}
            </a>
            <span className="text-[10px] text-gh-muted px-2 py-0.5 rounded-full border border-gh-border bg-gh-surface font-semibold select-none">
              Public
            </span>
          </div>

          {/* Action stats */}
          <div className="flex items-center gap-2 flex-wrap select-none">
            <a href={repo.htmlUrl} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-gh-surface border border-gh-border rounded-md hover:bg-gh-surface2 transition-colors text-white font-medium">
              <ExternalLink className="w-3.5 h-3.5 text-gh-muted" />
              <span>View on GitHub</span>
            </a>

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

        {/* Topics */}
        {repo.topics.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {repo.topics.map((topic: string) => (
              <Link key={topic} href={`/communities/${topic}`}
                className="text-xs px-2.5 py-0.5 rounded-full bg-[#1f3d5c] text-gh-blue border border-[#1f4f7c] hover:bg-[#2a5480] transition-colors font-medium">
                #{topic}
              </Link>
            ))}
          </div>
        )}
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
                <span>Issues ({repo.issues.length})</span>
              </TabsTrigger>
              <TabsTrigger
                value="pulls"
                className="flex items-center gap-1.5 px-4 py-1.5 text-xs text-gh-muted data-[state=active]:bg-gh-surface2 data-[state=active]:text-white rounded-md font-medium cursor-pointer"
              >
                <GitFork className="w-3.5 h-3.5" />
                <span>Pull Requests</span>
              </TabsTrigger>
            </TabsList>

            <div className="mt-4 border border-gh-border rounded-md bg-gh-surface overflow-hidden">
              <TabsContent value="issues" className="flex flex-col m-0 divide-y divide-gh-border">
                {repo.issues.length === 0 ? (
                  <div className="p-8 text-center text-gh-muted text-sm">No open issues found.</div>
                ) : (
                  repo.issues.map((issue: any) => (
                    <IssueRow key={issue.id} issue={issue} repoFullName={`${repo.owner}/${repo.name}`} />
                  ))
                )}
              </TabsContent>

              <TabsContent value="pulls" className="m-0 p-12 text-center">
                <span className="text-sm text-gh-muted">No open pull requests found.</span>
              </TabsContent>
            </div>
          </Tabs>
        </div>

        {/* Right Column: Skill Match + AI Insights */}
        <div className="flex flex-col gap-6">
          {/* Repo stats */}
          <div className="p-4 bg-gh-surface border border-gh-border rounded-md flex flex-col gap-3 text-xs text-gh-muted">
            <h4 className="text-xs font-bold text-gh-muted tracking-wide uppercase">About</h4>
            <div className="flex justify-between">
              <span>Language</span>
              <span className="text-white font-medium">{repo.language}</span>
            </div>
            <div className="flex justify-between">
              <span>Stars</span>
              <span className="text-white font-medium">{formatNumber(repo.stars)}</span>
            </div>
            <div className="flex justify-between">
              <span>Forks</span>
              <span className="text-white font-medium">{formatNumber(repo.forks)}</span>
            </div>
            <div className="flex justify-between">
              <span>Watchers</span>
              <span className="text-white font-medium">{formatNumber(repo.watchers)}</span>
            </div>
            <div className="flex justify-between">
              <span>Open Issues</span>
              <span className="text-white font-medium">{repo.openIssues}</span>
            </div>
            {repo.license && (
              <div className="flex justify-between">
                <span>License</span>
                <span className="text-white font-medium">{repo.license}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Last pushed</span>
              <span className="text-white font-medium">{repo.updatedAt}</span>
            </div>
          </div>

          {/* AI Insights Panel */}
          <AIInsightPanel 
            repoFullName={`${repo.owner}/${repo.name}`}
            description={repo.description || ""}
            language={repo.language || ""}
            topics={repo.topics || []}
          />
        </div>
      </div>
    </div>
  );
}
