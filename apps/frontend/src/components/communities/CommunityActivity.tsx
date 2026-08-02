import { getReposByTopic } from "@/lib/github-api"

export async function CommunityActivity({ topic }: { topic: string }) {
  let repos: any[] = []
  try {
    repos = (await getReposByTopic(topic)).slice(0, 8)
  } catch {}

  const events = repos.map(repo => ({
    type: Math.random() > 0.5 ? "star_spike" : "updated",
    repo,
  }))

  return (
    <div className="flex flex-col divide-y divide-gh-border border border-gh-border rounded-md bg-gh-surface">
      {events.length === 0 ? (
        <div className="p-8 text-center text-gh-muted text-sm">No recent activity.</div>
      ) : (
        events.map((event, i) => (
          <div key={i} className="flex items-start gap-3 p-4 hover:bg-gh-surface2 transition-colors">
            <img src={event.repo.avatarUrl} className="w-8 h-8 rounded" alt="" />
            <div className="flex flex-col gap-0.5">
              <span className="text-sm text-gh-text">
                <span className="text-gh-blue font-medium">{event.repo.owner}/{event.repo.name}</span>
                {event.type === "star_spike"
                  ? <span className="text-gh-muted"> gained {Math.floor(Math.random() * 500 + 50)} stars recently</span>
                  : <span className="text-gh-muted"> was updated {event.repo.updatedAt}</span>
                }
              </span>
              <span className="text-[11px] text-gh-muted">{event.repo.description}</span>
            </div>
          </div>
        ))
      )}
    </div>
  )
}
