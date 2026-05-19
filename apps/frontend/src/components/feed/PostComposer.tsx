"use client"
import { useState } from "react"
import { useSession } from "next-auth/react"

export function PostComposer({ onPostCreated }: { onPostCreated?: () => void }) {
  const { data: session } = useSession()
  const [content, setContent] = useState("")
  const [repoName, setRepoName] = useState("")
  const [isPosting, setIsPosting] = useState(false)

  const handlePost = async () => {
    if (!session || !content.trim()) return
    setIsPosting(true)
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/posts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: session.user?.email || "unknown",
          username: session.user?.name || "Unknown",
          avatar: session.user?.image || `https://api.dicebear.com/7.x/initials/svg?seed=${session.user?.name}`,
          repo_full_name: repoName,
          content,
        }),
      })
      setContent("")
      setRepoName("")
      onPostCreated?.()
    } finally {
      setIsPosting(false)
    }
  }

  if (!session) return null

  return (
    <div className="gh-card p-4 mb-4">
      <div className="flex gap-3">
        <img src={session.user?.image || `https://api.dicebear.com/7.x/initials/svg?seed=${session.user?.name}`} className="w-10 h-10 rounded-full bg-gh-surface border border-gh-border" alt="" />
        <div className="flex-1">
          <textarea
            className="w-full bg-transparent text-[#e6edf3] placeholder-[#7d8590] text-sm border-none outline-none resize-none mb-2 min-h-[60px]"
            placeholder="Share a repo, insight, or what you're building..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
          <input
            className="w-full bg-[#0d1117] border border-[#30363d] rounded-md px-3 py-1.5 text-sm text-[#7d8590] mb-3 outline-none focus:border-[#58a6ff] transition-colors"
            placeholder="Attach repo: owner/repo-name (optional)"
            value={repoName}
            onChange={(e) => setRepoName(e.target.value)}
          />
          <div className="flex justify-end">
            <button
              className="gh-btn-primary text-sm disabled:opacity-50"
              onClick={handlePost}
              disabled={!content.trim() || isPosting}
            >
              {isPosting ? "Posting..." : "Post"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
