import React from 'react';

interface SkillBadgeProps {
  skill: string;
}

export default function SkillBadge({ skill }: SkillBadgeProps) {
  return (
    <span 
      className="inline-block border text-purple-400 bg-gh-purple/10 px-2 py-0.5 rounded-full text-xs font-medium"
      style={{
        background: 'rgba(137, 87, 229, 0.1)',
        borderColor: '#8957e5',
        color: '#a855f7',
        fontSize: '12px',
        borderRadius: '9999px',
        padding: '2px 8px',
      }}
    >
      {skill}
    </span>
  );
}
