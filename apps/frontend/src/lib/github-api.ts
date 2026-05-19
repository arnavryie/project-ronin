const GITHUB_API = "https://api.github.com"

async function githubFetch(url: string, token?: string) {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github.v3+json",
    "User-Agent": "project-ronin",
  }
  if (token) {
    headers["Authorization"] = `Bearer ${token}`
  } else if (process.env.GITHUB_PAT) {
    headers["Authorization"] = `Bearer ${process.env.GITHUB_PAT}`
  }
  const res = await fetch(url, { headers, next: { revalidate: 300 } })
  if (!res.ok) throw new Error(`GitHub API error: ${res.status}`)
  return res.json()
}

export async function getTrendingRepos(language?: string, period: "daily" | "weekly" | "monthly" = "weekly") {
  const date = new Date()
  const daysBack = period === "daily" ? 1 : period === "weekly" ? 7 : 30
  date.setDate(date.getDate() - daysBack)
  const dateStr = date.toISOString().split("T")[0]

  let query = `created:>${dateStr} stars:>10`
  if (language) query += ` language:${language}`

  const url = `${GITHUB_API}/search/repositories?q=${encodeURIComponent(query)}&sort=stars&order=desc&per_page=20`
  const data = await githubFetch(url)

  return data.items.map((repo: any) => ({
    id: repo.id.toString(),
    owner: repo.owner.login,
    name: repo.name,
    fullName: repo.full_name,
    description: repo.description || "",
    language: repo.language || "Unknown",
    languageColor: getLanguageColor(repo.language),
    stars: repo.stargazers_count,
    forks: repo.forks_count,
    forkVelocity: Math.floor(repo.forks_count / Math.max(1, daysBack)),
    topics: repo.topics || [],
    updatedAt: timeAgo(repo.pushed_at),
    avatarUrl: repo.owner.avatar_url,
    htmlUrl: repo.html_url,
    trending: true,
  }))
}

export async function getReposByTopic(topic: string, page = 1) {
  const url = `${GITHUB_API}/search/repositories?q=topic:${topic}&sort=stars&order=desc&per_page=20&page=${page}`
  const data = await githubFetch(url)
  return data.items.map((repo: any) => ({
    id: repo.id.toString(),
    owner: repo.owner.login,
    name: repo.name,
    fullName: repo.full_name,
    description: repo.description || "",
    language: repo.language || "Unknown",
    languageColor: getLanguageColor(repo.language),
    stars: repo.stargazers_count,
    forks: repo.forks_count,
    forkVelocity: 0,
    topics: repo.topics || [],
    updatedAt: timeAgo(repo.updated_at),
    avatarUrl: repo.owner.avatar_url,
    htmlUrl: repo.html_url,
    trending: false,
  }))
}

export async function getGitHubUser(username: string, token?: string) {
  const data = await githubFetch(`${GITHUB_API}/users/${username}`, token)
  return {
    username: data.login,
    displayName: data.name || data.login,
    avatar: data.avatar_url,
    bio: data.bio || "",
    location: data.location || "",
    website: data.blog || "",
    followers: data.followers,
    following: data.following,
    publicRepos: data.public_repos,
    twitterUsername: data.twitter_username || "",
    createdAt: data.created_at,
  }
}

export async function getUserRepos(username: string, token?: string) {
  const data = await githubFetch(
    `${GITHUB_API}/users/${username}/repos?sort=stars&per_page=6`,
    token
  )
  return data.map((repo: any) => ({
    id: repo.id.toString(),
    name: repo.name,
    owner: repo.owner.login,
    fullName: repo.full_name,
    description: repo.description || "",
    language: repo.language || "Unknown",
    languageColor: getLanguageColor(repo.language),
    stars: repo.stargazers_count,
    forks: repo.forks_count,
    forkVelocity: 0,
    topics: repo.topics || [],
    isPrivate: repo.private,
    htmlUrl: repo.html_url,
    updatedAt: timeAgo(repo.pushed_at),
    avatarUrl: repo.owner.avatar_url,
    trending: false,
  }))
}

export async function getRepoDetail(owner: string, name: string, token?: string) {
  const [repo, issues] = await Promise.all([
    githubFetch(`${GITHUB_API}/repos/${owner}/${name}`, token),
    githubFetch(`${GITHUB_API}/repos/${owner}/${name}/issues?state=open&per_page=10`, token),
  ])
  return {
    id: repo.id.toString(),
    owner: repo.owner.login,
    name: repo.name,
    fullName: repo.full_name,
    description: repo.description || "",
    language: repo.language || "Unknown",
    languageColor: getLanguageColor(repo.language),
    stars: repo.stargazers_count,
    forks: repo.forks_count,
    forkVelocity: 0,
    watchers: repo.watchers_count,
    openIssues: repo.open_issues_count,
    topics: repo.topics || [],
    license: repo.license?.spdx_id || null,
    htmlUrl: repo.html_url,
    updatedAt: timeAgo(repo.pushed_at),
    avatarUrl: repo.owner.avatar_url,
    trending: false,
    issues: issues
      .filter((issue: any) => !issue.pull_request)
      .map((issue: any) => ({
        id: issue.number,
        title: issue.title,
        labels: issue.labels.map((l: any) => l.name),
        comments: issue.comments,
        openedBy: issue.user.login,
        openedAt: timeAgo(issue.created_at),
        htmlUrl: issue.html_url,
        impactScore: 50,
        impactLevel: 'Med',
        skillMatch: 0,
      })),
  }
}

export async function searchRepos(query: string) {
  const url = `${GITHUB_API}/search/repositories?q=${encodeURIComponent(query)}&sort=stars&per_page=10`
  const data = await githubFetch(url)
  return data.items.map((repo: any) => ({
    id: repo.id.toString(),
    owner: repo.owner.login,
    name: repo.name,
    description: repo.description || "",
    stars: repo.stargazers_count,
    language: repo.language || "Unknown",
    avatarUrl: repo.owner.avatar_url,
  }))
}

export function timeAgo(dateStr: string): string {
  if (!dateStr) return "recently"
  const now = new Date()
  const date = new Date(dateStr)
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)
  if (diffMins < 60) return `${diffMins} minutes ago`
  if (diffHours < 24) return `${diffHours} hours ago`
  if (diffDays < 30) return `${diffDays} days ago`
  return date.toLocaleDateString()
}

export function getLanguageColor(lang: string): string {
  const colors: Record<string, string> = {
    Python: "#3572A5", TypeScript: "#3178c6", JavaScript: "#f1e05a",
    Rust: "#dea584", Go: "#00ADD8", Java: "#b07219", "C++": "#f34b7d",
    Ruby: "#701516", Swift: "#fa7343", Kotlin: "#A97BFF", Shell: "#89e051",
    CSS: "#563d7c", HTML: "#e34c26", Vue: "#41b883", Dart: "#00B4AB",
    "C#": "#178600", PHP: "#4F5D95", Scala: "#c22d40", Elixir: "#6e4a7e",
  }
  return colors[lang] || "#8b949e"
}
