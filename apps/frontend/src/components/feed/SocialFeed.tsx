"use client"
import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { PostComposer } from "./PostComposer"
import { PostCard, Post } from "./PostCard"

export function SocialFeed() {
  const { data: session } = useSession()
  const [posts, setPosts] = useState<Post[]>([])

  const fetchPosts = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/posts`)
      if (res.ok) {
        setPosts(await res.json())
      }
    } catch (e) {
      console.error("Failed to fetch posts", e)
    }
  }

  useEffect(() => {
    fetchPosts()
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
      {posts.map(post => (
        <PostCard key={post._id} post={post} onLike={handleLike} />
      ))}
      {posts.length === 0 && (
        <div className="text-center py-12 border border-gh-border bg-gh-surface rounded-md">
          <span className="text-gh-muted text-sm">No posts yet. Be the first to share!</span>
        </div>
      )}
    </div>
  )
}
