"use client"

import { useSession, signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { TrendingUp, Users, Sparkles } from "lucide-react"

function GithubIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
    </svg>
  )
}

export default function LandingPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "authenticated") router.push("/feed")
  }, [status, router])

  return (
    <div className="min-h-screen bg-gh-bg flex flex-col items-center justify-center px-6 text-center">
      <div className="max-w-2xl flex flex-col items-center gap-6">
        <div className="flex items-center gap-2 text-3xl font-bold text-white">
          <span>⚔️</span>
          <span>Project Ronin</span>
        </div>

        <h1 className="text-4xl sm:text-5xl font-bold text-white tracking-tight leading-tight">
          The social layer GitHub<br />never built.
        </h1>

        <p className="text-gh-muted text-base sm:text-lg max-w-xl leading-relaxed">
          Discover trending repos before they blow up. Follow the builders who matter.
          Get AI insights on the open-source world. It&apos;s GitHub meets Twitter — for developers.
        </p>

        <button
          onClick={() => signIn("github")}
          className="flex items-center gap-2 bg-white text-black font-semibold px-6 py-3 rounded-md hover:bg-gray-200 transition-colors"
        >
          <GithubIcon className="w-5 h-5" />
          Sign in with GitHub
        </button>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-10 w-full">
          <div className="gh-card p-5 flex flex-col items-center gap-2">
            <TrendingUp className="w-6 h-6 text-gh-orange" />
            <h3 className="text-white font-semibold text-sm">Trending Feed</h3>
            <p className="text-gh-muted text-xs">Real-time fastest-growing repos, filtered by your stack.</p>
          </div>
          <div className="gh-card p-5 flex flex-col items-center gap-2">
            <Users className="w-6 h-6 text-gh-blue" />
            <h3 className="text-white font-semibold text-sm">Communities</h3>
            <p className="text-gh-muted text-xs">Topic-based hubs with the best repos in each domain.</p>
          </div>
          <div className="gh-card p-5 flex flex-col items-center gap-2">
            <Sparkles className="w-6 h-6 text-gh-purple" />
            <h3 className="text-white font-semibold text-sm">AI Insights</h3>
            <p className="text-gh-muted text-xs">Gemini-powered repo summaries and your developer dossier.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
