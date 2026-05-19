import React from 'react';
import { Sparkles, TrendingUp, AlertTriangle, Cpu } from 'lucide-react';

export default function AIInsightPanel() {
  return (
    <div className="p-[1px] rounded-md bg-gradient-to-r from-gh-purple to-gh-blue select-none">
      <div className="bg-[#0d1117] p-5 rounded-[5px] flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-center gap-2 border-b border-gh-border/60 pb-3">
          <Sparkles className="w-5 h-5 text-gh-purple animate-pulse" />
          <h3 className="text-sm font-bold text-white tracking-tight">AI Insights & Recommendations</h3>
        </div>

        {/* Bullet Points */}
        <div className="flex flex-col gap-4">
          {/* Insight 1 */}
          <div className="flex gap-3">
            <TrendingUp className="w-4 h-4 text-gh-orange shrink-0 mt-0.5" />
            <div className="flex flex-col gap-1">
              <span className="text-xs font-semibold text-white">Abnormal Fork Spike (340%)</span>
              <p className="text-[11px] text-gh-muted leading-relaxed">
                LangChain has experienced a massive influx of forks in the last 24h. This corresponds to the release of their new streaming agent architecture. Developers are racing to integrate standard wrappers.
              </p>
            </div>
          </div>

          {/* Insight 2 */}
          <div className="flex gap-3">
            <AlertTriangle className="w-4 h-4 text-gh-red shrink-0 mt-0.5" />
            <div className="flex flex-col gap-1">
              <span className="text-xs font-semibold text-white">Potential Dependency Drift</span>
              <p className="text-[11px] text-gh-muted leading-relaxed">
                Our analysis shows a drift in `pydantic` package bindings between standard `fastapi` setups and LangChain schema structures, creating possible type safety incompatibilities.
              </p>
            </div>
          </div>

          {/* Insight 3 */}
          <div className="flex gap-3">
            <Cpu className="w-4 h-4 text-gh-blue shrink-0 mt-0.5" />
            <div className="flex flex-col gap-1">
              <span className="text-xs font-semibold text-white">Recommended Action</span>
              <p className="text-[11px] text-gh-muted leading-relaxed">
                Assign **Arnav Tagade** to issue **#142**. Their profile shows **92% skill match** in FastAPI, Python, and MongoDB async query performance. This resolution will address 80% of active performance bottlenecks.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
