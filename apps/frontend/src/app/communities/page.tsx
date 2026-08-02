import React from "react";
import Link from "next/link";

interface Community {
  slug: string
  name: string
  icon: string
  description: string
  member_count: number
  github_topic: string
  color: string
}

const FALLBACK_COMMUNITIES: Community[] = [
  { slug: "ai-ml", name: "AI & Machine Learning", icon: "🤖", github_topic: "machine-learning", description: "LLMs, neural networks, AI tools and frameworks", member_count: 12400, color: "#58a6ff" },
  { slug: "ui-frontend", name: "UI & Frontend", icon: "⚛️", github_topic: "react", description: "React, Vue, Svelte, CSS frameworks, design systems", member_count: 8900, color: "#8957e5" },
  { slug: "devops", name: "DevOps & Infrastructure", icon: "⚙️", github_topic: "kubernetes", description: "Docker, Kubernetes, CI/CD, cloud-native tools", member_count: 6700, color: "#238636" },
  { slug: "databases", name: "Databases", icon: "🗄️", github_topic: "database", description: "SQL, NoSQL, vector databases, ORMs", member_count: 5400, color: "#d76027" },
  { slug: "systems", name: "Systems & Rust", icon: "⚡", github_topic: "rust", description: "Systems programming, performance engineering", member_count: 4200, color: "#dea584" },
  { slug: "python", name: "Python", icon: "🐍", github_topic: "python", description: "Python libraries, frameworks, and tools", member_count: 9800, color: "#3572A5" },
  { slug: "web3", name: "Web3 & Blockchain", icon: "⛓️", github_topic: "blockchain", description: "DeFi, smart contracts, crypto protocols", member_count: 3100, color: "#f1e05a" },
  { slug: "mobile", name: "Mobile Dev", icon: "📱", github_topic: "flutter", description: "iOS, Android, Flutter, React Native", member_count: 5800, color: "#00B4AB" },
  { slug: "security", name: "Security & Hacking", icon: "🔐", github_topic: "security", description: "Cybersecurity tools, CTF, vulnerability research", member_count: 3600, color: "#da3633" },
  { slug: "gamedev", name: "Game Development", icon: "🎮", github_topic: "game-development", description: "Game engines, tools, and open source games", member_count: 2900, color: "#a855f7" },
]

async function getCommunities(): Promise<Community[]> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000"
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 2000)
    const res = await fetch(`${apiUrl}/communities`, {
      signal: controller.signal,
      next: { revalidate: 60 },
    })
    clearTimeout(timeout)
    if (res.ok) {
      const data = await res.json()
      if (Array.isArray(data) && data.length > 0) return data
    }
  } catch {}
  return FALLBACK_COMMUNITIES
}

export default async function CommunitiesPage() {
  const communities = await getCommunities()

  return (
    <div className="p-6 max-w-[1000px] mx-auto flex flex-col gap-6">
      <div className="border-b border-gh-border pb-4">
        <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          <span>🏘️</span>
          <span>Explore Communities</span>
        </h2>
        <p className="text-xs text-gh-muted mt-1">
          Connect with developers working in specialized technical domains. Real repos pulled from GitHub topics.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {communities.map((c) => (
          <Link
            key={c.slug}
            href={`/communities/${c.slug}`}
            className="gh-card p-5 flex flex-col gap-3 hover:border-gh-blue transition-all group"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl shrink-0"
                  style={{ backgroundColor: `${c.color}20`, border: `1px solid ${c.color}40` }}
                >
                  {c.icon}
                </div>
                <div>
                  <h3 className="text-white font-semibold text-sm group-hover:text-gh-blue transition-colors">
                    {c.name}
                  </h3>
                  <span className="text-[11px] text-gh-muted">/c/{c.slug}</span>
                </div>
              </div>
              <span
                className="text-xs font-medium px-2 py-0.5 rounded-md shrink-0 mt-1"
                style={{ backgroundColor: `${c.color}20`, color: c.color }}
              >
                Enter
              </span>
            </div>
            <p className="text-gh-muted text-xs leading-relaxed">{c.description}</p>
            <div className="flex items-center gap-4 text-[11px] text-gh-muted mt-1">
              <span>
                <span className="text-white font-medium">{c.member_count?.toLocaleString()}</span> members
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
