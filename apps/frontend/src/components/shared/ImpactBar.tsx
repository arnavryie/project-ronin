import React from 'react';

interface ImpactBarProps {
  impactScore: number;
  impactLevel: string;
}

export default function ImpactBar({ impactScore, impactLevel }: ImpactBarProps) {
  const level = (impactLevel || 'Med').toLowerCase();
  let textColor = 'text-gh-muted';
  let bgColor = 'bg-gh-muted';
  
  if (level === 'high') {
    textColor = 'text-gh-green';
    bgColor = 'bg-gh-green';
  } else if (level === 'med' || level === 'medium') {
    textColor = 'text-gh-orange';
    bgColor = 'bg-gh-orange';
  }

  return (
    <div className="flex flex-col gap-1 w-full max-w-[200px]">
      <div className="flex justify-between items-center text-xs">
        <span className="text-gh-muted font-medium">Impact Score</span>
        <span className={`font-semibold ${textColor}`}>{impactLevel} ({impactScore}%)</span>
      </div>
      <div className="w-full bg-[#21262d] h-1.5 rounded-full overflow-hidden">
        <div 
          className={`h-full rounded-full transition-all duration-300 ${bgColor}`}
          style={{ 
            width: `${impactScore}%`,
          }}
        />
      </div>
    </div>
  );
}
