import React from 'react';

interface ImpactBarProps {
  impactScore: number;
  impactLevel: string;
}

export default function ImpactBar({ impactScore, impactLevel }: ImpactBarProps) {
  const level = (impactLevel || 'Med').toLowerCase();
  let fillColor = '#8b949e';
  if (level === 'high') {
    fillColor = '#238636';
  } else if (level === 'med' || level === 'medium') {
    fillColor = '#d76027';
  }

  return (
    <div className="flex flex-col gap-1 w-full max-w-[200px]">
      <div className="flex justify-between items-center text-xs">
        <span className="text-gh-muted font-medium">Impact Score</span>
        <span className="font-semibold" style={{ color: fillColor }}>{impactLevel} ({impactScore}%)</span>
      </div>
      <div className="w-full bg-[#21262d] h-1.5 rounded-full overflow-hidden">
        <div 
          className="h-full rounded-full transition-all duration-300"
          style={{ 
            width: `${impactScore}%`,
            backgroundColor: fillColor,
          }}
        />
      </div>
    </div>
  );
}
