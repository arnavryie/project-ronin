"use client"
import { useRouter } from "next/navigation"

const TOPIC_FILTERS = ["All", "Python", "TypeScript", "JavaScript", "Rust", "Go", "AI", "React"]

export function FeedFilterPills({ active }: { active: string }) {
  const router = useRouter()
  return (
    <div className="flex flex-wrap gap-2">
      {TOPIC_FILTERS.map(filter => (
        <button
          key={filter}
          onClick={() => router.push(filter === "All" ? "/feed" : `/feed?filter=${filter}`)}
          className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${
            active === filter
              ? "bg-gh-blue/20 border-gh-blue text-gh-blue"
              : "border-gh-border text-gh-muted hover:text-white hover:border-gh-muted"
          }`}
        >
          {filter}
        </button>
      ))}
    </div>
  )
}
