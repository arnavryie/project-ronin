"use client"
import { useEffect, useState } from "react"

interface AIInsightPanelProps {
  repoFullName: string
  description: string
  language: string
  topics: string[]
}

export function AIInsightPanel({ repoFullName, description, language, topics }: AIInsightPanelProps) {
  const [summary, setSummary] = useState<string>("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const params = new URLSearchParams({ repo: repoFullName, description, language, topics: topics.join(",") })
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/ai/repo-summary?${params}`)
      .then(r => r.json())
      .then(d => setSummary(d.summary))
      .catch(() => setSummary("Unable to generate summary."))
      .finally(() => setLoading(false))
  }, [repoFullName, description, language, topics])

  return (
    <div
      className="rounded-md p-4 mb-4 border border-gh-purple/40 shadow-[0_0_0_1px_rgba(137,87,229,0.1)]"
    >
      <div className="flex items-center gap-2 mb-3">
        <span className="text-[#8957e5] text-sm leading-none">✦</span>
        <span className="text-sm font-semibold text-[#e6edf3]">AI Summary</span>
        <span className="text-xs text-[#7d8590] ml-1">powered by Gemini</span>
      </div>
      {loading ? (
        <div className="space-y-2">
          <div className="h-3 bg-[#21262d] rounded animate-pulse w-full" />
          <div className="h-3 bg-[#21262d] rounded animate-pulse w-4/5" />
          <div className="h-3 bg-[#21262d] rounded animate-pulse w-3/5" />
        </div>
      ) : (
        <>
          <p className="text-[#7d8590] text-sm leading-relaxed whitespace-pre-wrap">{summary}</p>
          <button className="text-[#58a6ff] text-xs mt-3 hover:underline">View Full Analysis →</button>
        </>
      )}
    </div>
  )
}
