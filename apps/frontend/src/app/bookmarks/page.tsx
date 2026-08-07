"use client"
import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import RepoCard from "@/components/feed/RepoCard"
import Link from "next/link"
import { Bookmark } from "lucide-react"

export default function BookmarksPage() {
  const { data: session } = useSession()
  const [bookmarks, setBookmarks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!session?.user?.email) { setLoading(false); return }
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "/api"
    fetch(`${apiUrl}/bookmarks/${session.user.email}`)
      .then(r => r.json())
      .then(data => setBookmarks(Array.isArray(data) ? data : []))
      .catch(() => setBookmarks([]))
      .finally(() => setLoading(false))
  }, [session])

  return (
    <div className="p-6 max-w-[900px] mx-auto flex flex-col gap-6">
      <div className="border-b border-gh-border pb-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Bookmark className="w-5 h-5 text-gh-purple" />
          Saved Repositories
        </h2>
        <p className="text-xs text-gh-muted mt-1">Repos you've bookmarked for later.</p>
      </div>

      {loading ? (
        <div className="text-gh-muted text-sm">Loading...</div>
      ) : bookmarks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-4">
          <div className="text-4xl">📑</div>
          <h3 className="text-white font-semibold">No bookmarks yet</h3>
          <p className="text-gh-muted text-sm text-center max-w-xs">
            Hit the Save button on any repo in the feed to bookmark it here.
          </p>
          <Link href="/feed" className="text-gh-blue text-sm hover:underline">
            Back to feed →
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {bookmarks.map(b => (
            <RepoCard key={b.repo_full_name} repo={b.repo_data} userSkills={[]} />
          ))}
        </div>
      )}
    </div>
  )
}
