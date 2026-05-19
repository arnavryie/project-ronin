'use client';

import React from 'react';

export default function ContributionGraph() {
  const days = Array.from({ length: 357 }, (_, i) => {
    const seed = Math.sin(i * 0.05) + Math.cos(i * 0.1) + Math.random();
    if (seed < 0.2) return 0;
    if (seed < 0.8) return 1;
    if (seed < 1.4) return 2;
    if (seed < 1.8) return 3;
    return 4;
  });

  const getColorClass = (level: number) => {
    switch (level) {
      case 0: return 'bg-[#161b22]';
      case 1: return 'bg-[#0e4429]';
      case 2: return 'bg-[#006d32]';
      case 3: return 'bg-[#26a641]';
      case 4: return 'bg-[#39d353]';
      default: return 'bg-[#161b22]';
    }
  };

  return (
    <div className="p-4 bg-gh-surface border border-gh-border rounded-md select-none flex flex-col gap-3">
      <div className="text-xs font-semibold text-gh-muted">
        324 contributions in the last year
      </div>
      
      <div className="overflow-x-auto scrollbar-thin">
        <div className="min-w-[680px] py-1">
          <div className="grid grid-flow-col grid-rows-7 gap-[3px] auto-cols-max">
            {days.map((level, idx) => (
              <div 
                key={idx}
                className={`w-[10px] h-[10px] rounded-[1.5px] transition-all hover:scale-125 hover:z-10 cursor-pointer ${getColorClass(level)}`}
                title={`Level ${level} activity`}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between text-[10px] text-gh-muted mt-1 px-1">
        <a href="#" className="hover:text-gh-blue hover:underline">Learn how we count contributions</a>
        <div className="flex items-center gap-1 select-none">
          <span>Less</span>
          <span className="w-2.5 h-2.5 rounded-[1px] bg-[#161b22]" />
          <span className="w-2.5 h-2.5 rounded-[1px] bg-[#0e4429]" />
          <span className="w-2.5 h-2.5 rounded-[1px] bg-[#006d32]" />
          <span className="w-2.5 h-2.5 rounded-[1px] bg-[#26a641]" />
          <span className="w-2.5 h-2.5 rounded-[1px] bg-[#39d353]" />
          <span>More</span>
        </div>
      </div>
    </div>
  );
}
