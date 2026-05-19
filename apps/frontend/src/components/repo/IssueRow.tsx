'use client';

import { useState, useEffect } from 'react';
import { MessageSquare, AlertCircle } from 'lucide-react';
import SkillBadge from '../shared/SkillBadge';
import ImpactBar from '../shared/ImpactBar';

export interface Issue {
  id: number;
  title: string;
  labels: string[];
  skillMatch: number;
  impactScore: number;
  impactLevel: string;
  comments: number;
  openedBy: string;
  openedAt: string;
  htmlUrl?: string;
}

interface IssueRowProps {
  issue: Issue;
  repoFullName?: string;
}

export default function IssueRow({ issue, repoFullName }: IssueRowProps) {
  const [impact, setImpact] = useState({
    score: issue.impactScore || 50,
    level: issue.impactLevel || 'Med',
    reason: '',
    loaded: false,
  });

  useEffect(() => {
    if (!repoFullName) return;
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
    const params = new URLSearchParams({ issue: issue.title, repo: repoFullName });
    fetch(`${apiUrl}/ai/issue-score?${params}`)
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        if (d?.score !== undefined) {
          setImpact({ score: d.score, level: d.level || 'Med', reason: d.reason || '', loaded: true });
        }
      })
      .catch(() => {/* silently fail — keep default */});
  }, [issue.title, repoFullName]);

  const titleHref = issue.htmlUrl || '#';

  return (
    <div className="p-4 bg-gh-surface hover:bg-gh-surface2/40 transition-colors flex items-start gap-3">
      <AlertCircle className="w-5 h-5 text-gh-green shrink-0 mt-0.5" />
      
      <div className="flex-1 flex flex-col gap-1.5 min-w-0">
        <div className="flex items-center gap-2 flex-wrap min-w-0">
          <a href={titleHref} target="_blank" rel="noopener noreferrer" className="text-sm font-bold text-white hover:text-gh-blue hover:underline leading-snug">
            {issue.title}
          </a>
          <div className="flex items-center gap-1.5 flex-wrap shrink-0">
            {issue.labels.map((label) => (
              <span 
                key={label}
                className="text-[10px] px-2 py-0.5 rounded-full border border-gh-border text-gh-muted bg-gh-bg font-medium"
              >
                {label}
              </span>
            ))}
          </div>
        </div>

        <div className="text-[11px] text-gh-muted leading-none">
          #{issue.id} opened {issue.openedAt} by <span className="text-gh-blue">@{issue.openedBy}</span>
        </div>

        <div className="flex items-start gap-6 mt-2 flex-wrap select-none border-t border-gh-border/30 pt-2.5">
          {(issue.skillMatch ?? 0) > 0 && (
            <div className="flex items-center gap-1.5 text-xs text-purple-400 font-medium">
              <span>✦ Match:</span>
              <SkillBadge skill={`${issue.skillMatch}% Match`} />
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <ImpactBar impactScore={impact.score} impactLevel={impact.level} />
            {impact.reason && <span className="text-[10px] text-gh-muted leading-snug max-w-xs">{impact.reason}</span>}
          </div>
        </div>
      </div>

      {issue.comments > 0 && (
        <a href={titleHref} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-gh-muted shrink-0 select-none hover:text-gh-blue">
          <MessageSquare className="w-3.5 h-3.5" />
          <span className="mono">{issue.comments}</span>
        </a>
      )}
    </div>
  );
}
