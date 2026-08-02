"use client"
import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Search, Hash, User, TrendingUp, X } from "lucide-react"
import { searchRepos } from "@/lib/github-api"

const QUICK_LINKS = [
  { label: "For You Feed", path: "/feed", icon: "🏠" },
  { label: "Trending Repositories", path: "/trending", icon: "🔥" },
  { label: "Explore", path: "/explore", icon: "🧭" },
  { label: "Communities", path: "/communities", icon: "🏘️" },
  { label: "Bookmarks", path: "/bookmarks", icon: "🔖" },
]

export function CommandPalette() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<any[]>([])
  const [searching, setSearching] = useState(false)
  const router = useRouter()

  const close = useCallback(() => {
    setOpen(false)
    setQuery("")
    setResults([])
  }, [])

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        setOpen(prev => !prev)
      }
      if (e.key === "Escape") close()
    }
    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [close])

  useEffect(() => {
    if (!query.trim()) { setResults([]); return }
    const timer = setTimeout(async () => {
      setSearching(true)
      try {
        const repos = await searchRepos(query)
        setResults(repos.slice(0, 5))
      } catch {}
      setSearching(false)
    }, 300)
    return () => clearTimeout(timer)
  }, [query])

  const navigate = (path: string) => {
    router.push(path)
    close()
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh]">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={close} />

      {/* Palette */}
      <div className="relative w-full max-w-lg mx-4 bg-gh-surface border border-gh-border rounded-xl shadow-2xl overflow-hidden">
        {/* Input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-gh-border">
          <Search className="w-4 h-4 text-gh-muted shrink-0" />
          <input
            autoFocus
            className="flex-1 bg-transparent text-gh-text text-sm outline-none placeholder-gh-muted"
            placeholder="Search repos, navigate..."
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
          {searching && <div className="w-4 h-4 border-2 border-gh-blue border-t-transparent rounded-full animate-spin shrink-0" />}
          <kbd className="text-[10px] text-gh-muted border border-gh-border rounded px-1.5 py-0.5">ESC</kbd>
        </div>

        {/* Results */}
        <div className="max-h-[320px] overflow-y-auto p-2">
          {query.trim() && results.length > 0 ? (
            <>
              <p className="text-[10px] text-gh-muted uppercase tracking-wider px-2 mb-1">Repositories</p>
              {results.map(repo => (
                <button
                  key={repo.id}
                  onClick={() => navigate(`/repo/${repo.owner}/${repo.name}`)}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gh-surface2 text-left transition-colors"
                >
                  <img src={repo.avatarUrl} className="w-6 h-6 rounded" alt="" />
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm text-gh-blue font-medium truncate">{repo.owner}/{repo.name}</span>
                    <span className="text-[11px] text-gh-muted truncate">{repo.description}</span>
                  </div>
                  <span className="text-[11px] text-gh-muted ml-auto shrink-0 font-mono">★ {repo.stars >= 1000 ? (repo.stars/1000).toFixed(1)+"k" : repo.stars}</span>
                </button>
              ))}
            </>
          ) : (
            <>
              <p className="text-[10px] text-gh-muted uppercase tracking-wider px-2 mb-1">Quick Navigation</p>
              {QUICK_LINKS.map(link => (
                <button
                  key={link.path}
                  onClick={() => navigate(link.path)}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gh-surface2 text-left transition-colors"
                >
                  <span className="text-base">{link.icon}</span>
                  <span className="text-sm text-gh-text">{link.label}</span>
                  <span className="text-[11px] text-gh-muted ml-auto font-mono">{link.path}</span>
                </button>
              ))}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center gap-4 px-4 py-2 border-t border-gh-border text-[10px] text-gh-muted">
          <span>↑↓ navigate</span>
          <span>↵ open</span>
          <span>ESC close</span>
          <span className="ml-auto">⌘K to toggle</span>
        </div>
      </div>
    </div>
  )
}
