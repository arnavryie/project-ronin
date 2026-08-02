"use client"
import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { PostComposer } from "./PostComposer"
import { PostCard, Post } from "./PostCard"

export function SocialFeed() {
  const { data: session } = useSession()
  const [posts, setPosts] = useState<Post[]>([])
  const [topPost, setTopPost] = useState<Post | null>(null)

  const fetchPosts = async () => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000"
    try {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 3000)
      const res = await fetch(`${apiUrl}/posts`, { signal: controller.signal })
      clearTimeout(timeout)
      if (res.ok) {
        setPosts(await res.json())
      }
    } catch (e) {
      // Backend not running — show empty state instead of crashing
      console.warn("Backend not available, showing empty social feed")
    }
  }

  useEffect(() => {
    fetchPosts()
    const interval = setInterval(fetchPosts, 10000)
    
    // Fetch top post of the week
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000"
    fetch(`${apiUrl}/posts?limit=50`)
      .then(r => r.json())
      .then((data: Post[]) => {
        if (Array.isArray(data) && data.length > 0) {
          const top = [...data].sort((a, b) => b.likes_count - a.likes_count)[0]
          if (top && top.likes_count > 0) setTopPost(top)
        }
      })
      .catch(() => {})

    return () => clearInterval(interval)
  }, [])

  const handleLike = async (id: string) => {
    if (!session?.user?.email) return

    // Optimistic UI update
    setPosts(posts.map(p => p._id === id ? { ...p, likes_count: p.likes_count + 1 } : p))

    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/posts/${id}/like`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: session.user.email })
      })
    } catch (e) {
      console.error("Failed to like post", e)
      // Revert on failure
      setPosts(posts.map(p => p._id === id ? { ...p, likes_count: p.likes_count - 1 } : p))
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <PostComposer onPostCreated={fetchPosts} />
      {topPost && (
        <div className="relative">
          <div className="absolute -top-2 left-4 z-10">
            <span className="text-[10px] font-bold uppercase tracking-wider bg-yellow-500 text-black px-2 py-0.5 rounded-sm">
              🏆 Top post this week
            </span>
          </div>
          <div className="border-2 border-yellow-500/40 rounded-lg overflow-hidden">
            <PostCard post={topPost} onLike={handleLike} />
          </div>
        </div>
      )}
      {posts.map(post => (
        <PostCard key={post._id} post={post} onLike={handleLike} />
      ))}
      {posts.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 gap-3">
          <div className="text-3xl">✍️</div>
          <h3 className="text-white font-semibold text-sm">No posts yet</h3>
          <p className="text-gh-muted text-xs text-center max-w-xs">
            Be the first to share a repo discovery, a build log, or a cool open-source find.
          </p>
        </div>
      )}
    </div>
  )
}
