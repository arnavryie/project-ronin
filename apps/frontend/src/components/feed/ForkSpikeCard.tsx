import React from 'react';
import { Flame, TrendingUp } from 'lucide-react';

interface ForkSpikeCardProps {
  repoName: string;
  forkVelocity: number;
}

export default function ForkSpikeCard({ repoName, forkVelocity }: ForkSpikeCardProps) {
  return (
    <div 
      className="flex items-center justify-between p-3 bg-gh-surface border-l-[3px] border-gh-orange border border-y-gh-border border-r-gh-border rounded-r-md select-none"
    >
      <div className="flex items-center gap-2">
        <Flame className="w-4 h-4 text-gh-orange fill-gh-orange/20 shrink-0" />
        <span className="text-sm font-semibold text-white">Fork spike:</span>
        <span className="text-sm text-gh-orange font-bold font-mono">+{forkVelocity} forks</span>
        <span className="text-sm text-gh-muted">in 24h on</span>
        <span className="text-sm text-white font-semibold">{repoName}</span>
      </div>
      <TrendingUp className="w-4 h-4 text-gh-orange shrink-0" />
    </div>
  );
}
