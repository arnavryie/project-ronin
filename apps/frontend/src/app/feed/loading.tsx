import { RepoCardSkeleton } from "@/components/feed/RepoCard"

export default function FeedLoading() {
  return (
    <div className="flex gap-4 p-6 max-w-[1200px] mx-auto">
      <div className="flex-1 flex flex-col gap-4">
        <div className="h-8 w-32 skeleton rounded-md mb-2" />
        <div className="flex flex-col gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <RepoCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  )
}
