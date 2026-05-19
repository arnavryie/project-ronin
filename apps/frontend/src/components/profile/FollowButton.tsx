"use client"
import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"

export function FollowButton({ targetUserId, targetUsername }: { targetUserId: string, targetUsername: string }) {
  const { data: session } = useSession()
  const [isFollowing, setIsFollowing] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!session?.user?.email) {
      setLoading(false)
      return
    }
    
    // Check if following
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/following/${session.user.email}`)
      .then(res => res.json())
      .then(data => {
        setIsFollowing(data.following?.includes(targetUsername))
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [session, targetUsername])

  const handleFollow = async () => {
    if (!session?.user?.email) return
    
    setLoading(true)
    const endpoint = isFollowing ? "unfollow" : "follow"
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          follower_id: session.user.email,
          following_id: targetUserId,
          following_username: targetUsername
        })
      })
      setIsFollowing(!isFollowing)
    } finally {
      setLoading(false)
    }
  }

  if (!session) return null
  
  // Don't show follow button for your own profile
  if (session.user.name === targetUsername || session.user.email === targetUserId) return null

  return (
    <button 
      onClick={handleFollow}
      disabled={loading}
      className={`mt-2 w-full text-xs px-3 py-1.5 rounded-md font-semibold transition-colors disabled:opacity-50 ${
        isFollowing 
          ? "bg-[#21262d] border border-gh-border text-white hover:bg-gh-surface2" 
          : "gh-btn-primary"
      }`}
    >
      {loading ? "..." : isFollowing ? "Unfollow" : "Follow"}
    </button>
  )
}
