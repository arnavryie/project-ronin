# Project Ronin — Developer Build Guide (Phases 2–5)

## What is Project Ronin?
A **social intelligence platform for developers** — GitHub meets Twitter.
- Content = real GitHub repos, issues, PRs (not tweets)
- Feed = personalized by your stack/skills using Gemini AI
- Communities = organized around tech topics with real repos from GitHub API
- Trending = real fork/star velocity from GitHub Search API
- Social layer = posts, likes, follows stored in MongoDB

**Current state:** Frontend built with mock data (Next.js 15 + Tailwind + shadcn/ui). Backend scaffolded (FastAPI + MongoDB connected). All pages render at localhost:3000.

**What this README covers:** Replace ALL mock data with real GitHub API data, wire up the backend, add the social layer, and integrate Gemini AI.

---

## Tech Stack
| Layer | Tech |
|---|---|
| Frontend | Next.js 15 (App Router), TypeScript, Tailwind CSS, shadcn/ui, React Flow |
| Backend | FastAPI (Python), Motor (async MongoDB driver) |
| Database | MongoDB Atlas (M0 free tier) |
| Auth | NextAuth.js v5 + GitHub OAuth |
| AI | Gemini API (google-generativeai) |
| Data | GitHub REST API v3 + GitHub Search API |
| Deploy | Vercel (frontend) + Railway (backend) |

---

## Environment Variables

### apps/frontend/.env.local
```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_random_secret_here_any_string
GITHUB_CLIENT_ID=your_github_oauth_client_id
GITHUB_CLIENT_SECRET=your_github_oauth_client_secret
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### apps/backend/.env
```env
MONGODB_URI=your_mongodb_connection_string
GITHUB_PAT=your_github_personal_access_token
GEMINI_API_KEY=your_gemini_api_key
GITHUB_CLIENT_ID=your_github_oauth_client_id
GITHUB_CLIENT_SECRET=your_github_oauth_client_secret
```

---

## PHASE 2 — GitHub OAuth Auth + Real GitHub Data

### GOAL
Users log in with their real GitHub account. Feed shows real trending repos. Communities show real repos filtered by topic.

### Step 1: Install auth packages in frontend
```bash
cd apps/frontend
npm install next-auth@beta
```

### Step 2: Create apps/frontend/src/app/api/auth/[...nextauth]/route.ts
```typescript
import NextAuth from "next-auth"
import GitHub from "next-auth/providers/github"

const handler = NextAuth({
  providers: [
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: "read:user user:email repo",
        },
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account }) {
      if (account?.access_token) {
        token.githubAccessToken = account.access_token
      }
      return token
    },
    async session({ session, token }) {
      session.githubAccessToken = token.githubAccessToken as string
      return session
    },
  },
})

export { handler as GET, handler as POST }
```

### Step 3: Create apps/frontend/src/lib/github-api.ts
```typescript
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
    description: repo.description || "",
    language: repo.language || "Unknown",
    languageColor: getLanguageColor(repo.language),
    stars: repo.stargazers_count,
    forks: repo.forks_count,
    isPrivate: repo.private,
    htmlUrl: repo.html_url,
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
    watchers: repo.watchers_count,
    openIssues: repo.open_issues_count,
    topics: repo.topics || [],
    license: repo.license?.spdx_id || null,
    htmlUrl: repo.html_url,
    updatedAt: timeAgo(repo.pushed_at),
    avatarUrl: repo.owner.avatar_url,
    issues: issues.map((issue: any) => ({
      id: issue.number,
      title: issue.title,
      labels: issue.labels.map((l: any) => l.name),
      comments: issue.comments,
      openedBy: issue.user.login,
      openedAt: timeAgo(issue.created_at),
      htmlUrl: issue.html_url,
      impactScore: 50,
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
  }
  return colors[lang] || "#8b949e"
}
```

### Step 4: Update all page.tsx files to use real data

**apps/frontend/src/app/feed/page.tsx:**
```typescript
import { getTrendingRepos } from "@/lib/github-api"

export default async function FeedPage() {
  const repos = await getTrendingRepos(undefined, "weekly")
  return (
    // same layout as before, pass repos to RepoCard components
  )
}
```

**apps/frontend/src/app/trending/page.tsx:**
```typescript
import { getTrendingRepos } from "@/lib/github-api"

export default async function TrendingPage({
  searchParams,
}: {
  searchParams: { period?: string; language?: string }
}) {
  const period = (searchParams.period as "daily" | "weekly" | "monthly") || "weekly"
  const repos = await getTrendingRepos(searchParams.language, period)
  // render numbered list with real data
}
```

**apps/frontend/src/app/communities/[slug]/page.tsx:**
```typescript
import { getReposByTopic } from "@/lib/github-api"

const COMMUNITY_TOPICS: Record<string, string> = {
  "ai-ml": "machine-learning",
  "ui-frontend": "react",
  "devops-infra": "kubernetes",
  "databases": "database",
  "systems": "rust",
  "python": "python",
  "web3": "blockchain",
  "mobile": "flutter",
}

export default async function CommunityPage({ params }: { params: { slug: string } }) {
  const topic = COMMUNITY_TOPICS[params.slug] || params.slug
  const repos = await getReposByTopic(topic)
  // render real repos in community layout
}
```

**apps/frontend/src/app/profile/[username]/page.tsx:**
```typescript
import { getGitHubUser, getUserRepos } from "@/lib/github-api"

export default async function ProfilePage({ params }: { params: { username: string } }) {
  const [user, repos] = await Promise.all([
    getGitHubUser(params.username),
    getUserRepos(params.username),
  ])
  // render real user data
}
```

---

## PHASE 3 — Social Layer (Posts, Likes, Follows)

### Create apps/backend/services/social.py
```python
from datetime import datetime
from bson import ObjectId

async def create_post(db, user_id: str, username: str, avatar: str, repo_full_name: str, content: str):
    post = {
        "user_id": user_id,
        "username": username,
        "avatar": avatar,
        "repo_full_name": repo_full_name,
        "content": content,
        "likes": [],
        "likes_count": 0,
        "created_at": datetime.utcnow(),
    }
    result = await db["posts"].insert_one(post)
    return str(result.inserted_id)

async def like_post(db, post_id: str, user_id: str):
    await db["posts"].update_one(
        {"_id": ObjectId(post_id)},
        {"$addToSet": {"likes": user_id}, "$inc": {"likes_count": 1}}
    )

async def unlike_post(db, post_id: str, user_id: str):
    await db["posts"].update_one(
        {"_id": ObjectId(post_id)},
        {"$pull": {"likes": user_id}, "$inc": {"likes_count": -1}}
    )

async def get_feed_posts(db, limit=20, skip=0):
    cursor = db["posts"].find().sort("created_at", -1).skip(skip).limit(limit)
    posts = await cursor.to_list(length=limit)
    for post in posts:
        post["_id"] = str(post["_id"])
        post["created_at"] = post["created_at"].isoformat()
    return posts

async def follow_user(db, follower_id: str, following_id: str, following_username: str):
    await db["follows"].update_one(
        {"follower_id": follower_id, "following_id": following_id},
        {"$set": {
            "follower_id": follower_id,
            "following_id": following_id,
            "following_username": following_username,
            "created_at": datetime.utcnow()
        }},
        upsert=True
    )

async def unfollow_user(db, follower_id: str, following_id: str):
    await db["follows"].delete_one({"follower_id": follower_id, "following_id": following_id})

async def get_following(db, user_id: str):
    cursor = db["follows"].find({"follower_id": user_id})
    follows = await cursor.to_list(length=100)
    return [f["following_username"] for f in follows]
```

### Add to apps/backend/main.py
```python
from services import social
from pydantic import BaseModel

class PostCreate(BaseModel):
    user_id: str
    username: str
    avatar: str
    repo_full_name: str
    content: str

class LikePost(BaseModel):
    user_id: str

class FollowUser(BaseModel):
    follower_id: str
    following_id: str
    following_username: str

@app.post("/posts")
async def create_post(post: PostCreate):
    post_id = await social.create_post(db, post.user_id, post.username, post.avatar, post.repo_full_name, post.content)
    return {"id": post_id}

@app.post("/posts/{post_id}/like")
async def like_post(post_id: str, like: LikePost):
    await social.like_post(db, post_id, like.user_id)
    return {"success": True}

@app.get("/posts")
async def get_posts(limit: int = 20, skip: int = 0):
    return await social.get_feed_posts(db, limit, skip)

@app.post("/follow")
async def follow(data: FollowUser):
    await social.follow_user(db, data.follower_id, data.following_id, data.following_username)
    return {"success": True}

@app.get("/following/{user_id}")
async def get_following(user_id: str):
    following = await social.get_following(db, user_id)
    return {"following": following}
```

### Create apps/frontend/src/components/feed/PostComposer.tsx
```typescript
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
          user_id: session.user?.email,
          username: session.user?.name,
          avatar: session.user?.image,
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
        <img src={session.user?.image || ""} className="w-10 h-10 rounded-full" alt="" />
        <div className="flex-1">
          <textarea
            className="w-full bg-transparent text-[#e6edf3] placeholder-[#7d8590] text-sm border-none outline-none resize-none mb-2 min-h-[60px]"
            placeholder="Share a repo, insight, or what you're building..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
          <input
            className="w-full bg-[#0d1117] border border-[#30363d] rounded-md px-3 py-1 text-sm text-[#7d8590] mb-3 outline-none focus:border-[#58a6ff]"
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
```

### Create apps/frontend/src/components/feed/PostCard.tsx
```typescript
import { timeAgo } from "@/lib/github-api"
import Link from "next/link"

interface Post {
  _id: string
  username: string
  avatar: string
  repo_full_name: string
  content: string
  likes_count: number
  created_at: string
}

export function PostCard({ post }: { post: Post }) {
  return (
    <div className="gh-card p-4">
      <div className="flex gap-3">
        <img src={post.avatar} className="w-10 h-10 rounded-full" alt="" />
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-semibold text-[#e6edf3] text-sm">{post.username}</span>
            <span className="text-[#7d8590] text-xs">{timeAgo(post.created_at)}</span>
          </div>
          {post.repo_full_name && (
            <Link
              href={`/repo/${post.repo_full_name}`}
              className="text-[#58a6ff] text-sm font-mono mb-1 block hover:underline"
            >
              📦 {post.repo_full_name}
            </Link>
          )}
          <p className="text-[#e6edf3] text-sm leading-relaxed">{post.content}</p>
          <div className="flex gap-4 mt-3">
            <button className="text-[#7d8590] text-xs hover:text-[#e6edf3] flex items-center gap-1 transition-colors">
              ♥ {post.likes_count}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
```

---

## PHASE 4 — Skill Matching

### Create apps/backend/services/users.py
```python
import httpx
from datetime import datetime

async def sync_github_user(db, github_token: str, github_username: str):
    """After OAuth login — detect user's skills from their GitHub repos"""
    async with httpx.AsyncClient() as client:
        headers = {
            "Authorization": f"Bearer {github_token}",
            "Accept": "application/vnd.github.v3+json"
        }
        res = await client.get(
            f"https://api.github.com/users/{github_username}/repos?per_page=30&sort=pushed",
            headers=headers
        )
        repos = res.json()

    language_counts: dict = {}
    for repo in repos:
        if repo.get("language"):
            lang = repo["language"]
            language_counts[lang] = language_counts.get(lang, 0) + 1

    skills = sorted(language_counts, key=language_counts.get, reverse=True)[:5]

    await db["users"].update_one(
        {"github_username": github_username},
        {"$set": {
            "github_username": github_username,
            "skills": skills,
            "updated_at": datetime.utcnow()
        }},
        upsert=True
    )
    return skills

async def get_user_skills(db, github_username: str) -> list:
    user = await db["users"].find_one({"github_username": github_username})
    return user.get("skills", []) if user else []
```

### Add to apps/backend/main.py
```python
from services import users

@app.get("/users/{username}/skills")
async def get_skills(username: str):
    skills = await users.get_user_skills(db, username)
    return {"skills": skills}

@app.post("/sync-user")
async def sync_user(data: dict):
    skills = await users.sync_github_user(db, data["token"], data["username"])
    return {"skills": skills}
```

### Skill match in RepoCard
Update `apps/frontend/src/components/feed/RepoCard.tsx` to accept userSkills prop:
```typescript
interface RepoCardProps {
  repo: Repo
  userSkills?: string[]
}

export function RepoCard({ repo, userSkills = [] }: RepoCardProps) {
  const repoTechStack = [...(repo.topics || []), repo.language?.toLowerCase() || ""]
  const matchedSkills = userSkills.filter(skill =>
    repoTechStack.some(tech =>
      tech.toLowerCase().includes(skill.toLowerCase()) ||
      skill.toLowerCase().includes(tech.toLowerCase())
    )
  )
  const skillMatch = matchedSkills.length
  // show purple banner if skillMatch > 0
}
```

---

## PHASE 5 — Gemini AI

### Create apps/backend/core/gemini.py
```python
import google.generativeai as genai
import os
import json
from datetime import datetime

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
model = genai.GenerativeModel("gemini-1.5-flash")

async def generate_repo_summary(repo_name: str, description: str, topics: list, language: str) -> str:
    """AI summary — cached in MongoDB to avoid repeat API calls"""
    prompt = f"""You are a developer analyst. In exactly 2 sentences, describe what this GitHub repository does and why developers find it valuable.

Repository: {repo_name}
Description: {description}
Language: {language}
Topics: {', '.join(topics)}

Be specific and technical. No marketing fluff."""
    response = model.generate_content(prompt)
    return response.text.strip()

async def score_issue_impact(issue_title: str, repo_name: str) -> dict:
    prompt = f"""You are a senior engineer triaging GitHub issues.
Score this issue's impact 0-100.

Repository: {repo_name}
Issue: {issue_title}

Respond in JSON only, no markdown:
{{"score": <number>, "level": "<High|Med|Low>", "reason": "<one sentence>"}}"""
    response = model.generate_content(prompt)
    try:
        text = response.text.strip().replace("```json", "").replace("```", "")
        return json.loads(text)
    except:
        return {"score": 50, "level": "Med", "reason": "Unable to analyze"}

async def generate_developer_dossier(username: str, skills: list, top_repos: list) -> str:
    prompt = f"""You are a technical analyst writing a developer intelligence report.
Write 2 paragraphs analyzing this GitHub developer's profile.

Developer: {username}
Core Skills: {', '.join(skills)}
Top Repositories: {', '.join(top_repos[:5])}

Cover: technical specialization and what kinds of problems they solve best."""
    response = model.generate_content(prompt)
    return response.text.strip()

async def get_or_generate_summary(db, repo_full_name: str, description: str, topics: list, language: str) -> str:
    """Check MongoDB cache first, only call Gemini if not cached"""
    cached = await db["ai_cache"].find_one({"repo": repo_full_name, "type": "summary"})
    if cached:
        return cached["content"]
    
    summary = await generate_repo_summary(repo_full_name, description, topics, language)
    
    # Cache it
    await db["ai_cache"].insert_one({
        "repo": repo_full_name,
        "type": "summary",
        "content": summary,
        "created_at": datetime.utcnow()
    })
    return summary
```

### Add to apps/backend/main.py
```python
from core.gemini import get_or_generate_summary, score_issue_impact, generate_developer_dossier

@app.get("/ai/repo-summary")
async def repo_summary(repo: str, description: str = "", language: str = "", topics: str = ""):
    summary = await get_or_generate_summary(db, repo, description, topics.split(","), language)
    return {"summary": summary}

@app.get("/ai/issue-score")
async def issue_score(issue: str, repo: str):
    return await score_issue_impact(issue, repo)

@app.post("/ai/developer-dossier")
async def developer_dossier(data: dict):
    dossier = await generate_developer_dossier(data["username"], data.get("skills", []), data.get("top_repos", []))
    return {"dossier": dossier}
```

### Create apps/frontend/src/components/repo/AIInsightPanel.tsx
```typescript
"use client"
import { useEffect, useState } from "react"

interface AIInsightPanelProps {
  repoFullName: string
  description: string
  language: string
  topics: string[]
}

export function AIInsightPanel({ repoFullName, description, language, topics }: AIInsightPanelProps) {
  const [summary, setSummary] = useState<string>("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const params = new URLSearchParams({ repo: repoFullName, description, language, topics: topics.join(",") })
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/ai/repo-summary?${params}`)
      .then(r => r.json())
      .then(d => setSummary(d.summary))
      .catch(() => setSummary("Unable to generate summary."))
      .finally(() => setLoading(false))
  }, [repoFullName])

  return (
    <div
      className="rounded-md p-4 mb-4"
      style={{ border: "1px solid rgba(137,87,229,0.4)", boxShadow: "0 0 0 1px rgba(137,87,229,0.1)" }}
    >
      <div className="flex items-center gap-2 mb-3">
        <span className="text-[#8957e5] text-sm">✦</span>
        <span className="text-sm font-semibold text-[#e6edf3]">AI Summary</span>
        <span className="text-xs text-[#7d8590] ml-1">powered by Gemini</span>
      </div>
      {loading ? (
        <div className="space-y-2">
          <div className="h-3 bg-[#21262d] rounded animate-pulse w-full" />
          <div className="h-3 bg-[#21262d] rounded animate-pulse w-4/5" />
          <div className="h-3 bg-[#21262d] rounded animate-pulse w-3/5" />
        </div>
      ) : (
        <>
          <p className="text-[#7d8590] text-sm leading-relaxed">{summary}</p>
          <button className="text-[#58a6ff] text-xs mt-2 hover:underline">View Full Analysis →</button>
        </>
      )}
    </div>
  )
}
```

---

## PHASE 6 — Communities with Real Data

### Seed communities in MongoDB on backend startup
Add to `apps/backend/main.py`:
```python
SEED_COMMUNITIES = [
    {"slug": "ai-ml", "name": "AI & Machine Learning", "icon": "🤖", "github_topic": "machine-learning", "description": "LLMs, neural networks, AI tools and frameworks", "color": "#58a6ff"},
    {"slug": "ui-frontend", "name": "UI & Frontend", "icon": "⚛️", "github_topic": "react", "description": "React, Vue, Svelte, CSS frameworks, design systems", "color": "#8957e5"},
    {"slug": "devops", "name": "DevOps & Infrastructure", "icon": "⚙️", "github_topic": "kubernetes", "description": "Docker, Kubernetes, CI/CD, cloud-native tools", "color": "#238636"},
    {"slug": "databases", "name": "Databases", "icon": "🗄️", "github_topic": "database", "description": "SQL, NoSQL, vector databases, ORMs", "color": "#d76027"},
    {"slug": "systems", "name": "Systems & Rust", "icon": "⚡", "github_topic": "rust", "description": "Systems programming, performance engineering", "color": "#dea584"},
    {"slug": "python", "name": "Python", "icon": "🐍", "github_topic": "python", "description": "Python libraries, frameworks, and tools", "color": "#3572A5"},
    {"slug": "web3", "name": "Web3 & Blockchain", "icon": "⛓️", "github_topic": "blockchain", "description": "DeFi, smart contracts, crypto protocols", "color": "#f1e05a"},
    {"slug": "mobile", "name": "Mobile Dev", "icon": "📱", "github_topic": "flutter", "description": "iOS, Android, Flutter, React Native", "color": "#00B4AB"},
]

@app.on_event("startup")
async def startup():
    await ping_db()
    # Seed communities if they don't exist
    for community in SEED_COMMUNITIES:
        await db["communities"].update_one(
            {"slug": community["slug"]},
            {"$setOnInsert": {**community, "member_count": 0, "members": []}},
            upsert=True
        )

@app.get("/communities")
async def get_communities():
    cursor = db["communities"].find().sort("member_count", -1)
    communities = await cursor.to_list(length=50)
    for c in communities:
        c["_id"] = str(c["_id"])
    return communities

@app.post("/communities/{slug}/join")
async def join_community(slug: str, data: dict):
    await db["communities"].update_one(
        {"slug": slug},
        {"$addToSet": {"members": data["user_id"]}, "$inc": {"member_count": 1}}
    )
    return {"success": True}
```

### Update communities page to fetch from backend
`apps/frontend/src/app/communities/page.tsx`:
```typescript
export default async function CommunitiesPage() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/communities`, { next: { revalidate: 60 } })
  const communities = await res.json()
  // render community cards with real data
}
```

---

## PHASE 7 — Deploy

### Frontend to Vercel
```bash
cd apps/frontend
npx vercel --prod
```

Environment variables to set in Vercel dashboard:
- `NEXTAUTH_URL` → your-app.vercel.app
- `NEXTAUTH_SECRET` → same random string
- `GITHUB_CLIENT_ID` → your GitHub OAuth app client ID
- `GITHUB_CLIENT_SECRET` → your GitHub OAuth app client secret
- `NEXT_PUBLIC_API_URL` → your Railway backend URL
- `GITHUB_PAT` → your GitHub personal access token

**Also:** Update GitHub OAuth app → Settings → Homepage URL + Callback URL to your Vercel URL.

### Backend to Railway
1. railway.app → New Project → Deploy from GitHub → select `arnavryie/project-ronin`
2. Root directory: `apps/backend`
3. Add all env vars from `apps/backend/.env`

Create `apps/backend/Procfile`:
```
web: uvicorn main:app --host 0.0.0.0 --port $PORT
```

Create `apps/backend/runtime.txt`:
```
python-3.11
```

---

## CURSOR RULES — READ THESE BEFORE STARTING

1. **Build phases in order** — do not skip ahead. Phase 2 (real GitHub data) must work before Phase 3 (social).
2. **Cache all GitHub API calls** — use `next: { revalidate: 300 }` on every fetch. Rate limit is 5000/hour.
3. **Cache all Gemini calls** — store in MongoDB `ai_cache` collection. Never call Gemini twice for the same repo.
4. **Never call Gemini from frontend** — all AI calls go through the FastAPI backend.
5. **Motor only** — use `motor` (async) for all MongoDB operations. Never use `pymongo` sync driver.
6. **CORS** — backend must allow both `localhost:3000` AND your Vercel URL.
7. **No mock data after Phase 2** — delete all imports from `mock-data.ts` in page files.
8. **Error handling** — wrap all GitHub API calls in try/catch. If GitHub API fails, show empty state, not crash.
9. **TypeScript interfaces** — define types for every data shape. No `any` except in GitHub API responses.
10. **`.env` files never committed** — they're in `.gitignore` already.
