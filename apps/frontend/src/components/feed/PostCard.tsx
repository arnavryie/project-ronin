import { timeAgo } from "@/lib/github-api"
import Link from "next/link"
import { Heart } from "lucide-react"

export interface Post {
  _id: string
  username: string
  avatar: string
  repo_full_name: string
  content: string
  likes_count: number
  created_at: string
}

export function PostCard({ post, onLike }: { post: Post, onLike?: (id: string) => void }) {
  return (
    <div className="gh-card p-4">
      <div className="flex gap-3">
        <img src={post.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${post.username}`} className="w-10 h-10 rounded-full bg-gh-surface border border-gh-border" alt="" />
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-semibold text-[#e6edf3] text-sm">{post.username}</span>
            <span className="text-[#7d8590] text-xs">{timeAgo(post.created_at)}</span>
          </div>
          {post.repo_full_name && (
            <Link
              href={`/repo/${post.repo_full_name}`}
              className="text-[#58a6ff] text-sm font-mono mb-2 inline-flex hover:underline bg-[#1f3d5c]/30 px-2 py-0.5 rounded-md border border-[#1f4f7c]"
            >
              📦 {post.repo_full_name}
            </Link>
          )}
          <p className="text-[#e6edf3] text-sm leading-relaxed whitespace-pre-wrap">{post.content}</p>
          <div className="flex gap-4 mt-3">
            <button 
              onClick={() => onLike?.(post._id)}
              className="text-[#7d8590] text-xs hover:text-[#f85149] flex items-center gap-1.5 transition-colors group"
            >
              <Heart className="w-4 h-4 group-hover:fill-[#f85149]/20" />
              <span>{post.likes_count}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
