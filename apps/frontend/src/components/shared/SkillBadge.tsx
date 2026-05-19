import React from 'react';

interface SkillBadgeProps {
  skill: string;
}

export default function SkillBadge({ skill }: SkillBadgeProps) {
  return (
    <span 
      className="inline-block border border-gh-purple text-[#a855f7] bg-gh-purple/10 px-2 py-0.5 rounded-full text-xs font-medium"
    >
      {skill}
    </span>
  );
}
