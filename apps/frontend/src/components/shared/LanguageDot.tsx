import React from 'react';

interface LanguageDotProps {
  language: string;
  color?: string;
}

export default function LanguageDot({ language, color }: LanguageDotProps) {
  const dotColor = color || '#8b949e';
  return (
    <div className="flex items-center gap-1.5 inline-flex">
      <span className="w-3 h-3 rounded-full inline-block shrink-0" style={{ background: dotColor }} />
      <span className="text-sm text-gh-muted">{language}</span>
    </div>
  );
}
