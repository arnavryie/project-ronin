# Project Ronin — Bug Fixes + Vector Search Wiring

Apply in order. FIX A is a quick bug. FIX B is the important one for the hackathon —
it makes your MongoDB Atlas Vector Search actually visible in the app.

---

# ===================================================================
# FIX A — Bookmarks (currently broken)
# ===================================================================

WHY: RepoCard saves bookmarks under "local-user", but the bookmarks page (and every other
social feature) uses session.user.email. So saved bookmarks never appear. Fix RepoCard to
use the same identity.

### FILE: apps/frontend/src/components/feed/RepoCard.tsx
At the top with the other imports, add:
```typescript
import { useSession } from "next-auth/react"
```
Inside the component, near the other hooks (right after `const router = useRouter()`), add:
```typescript
const { data: session } = useSession()
```
Then find this in handleBookmark:
```typescript
          body: JSON.stringify({
            user_id: "local-user",
            repo_full_name: `${repo.owner}/${repo.name}`,
            repo_data: repo
          })
```
Replace with:
```typescript
          body: JSON.stringify({
            user_id: session?.user?.email || "anonymous",
            repo_full_name: `${repo.owner}/${repo.name}`,
            repo_data: repo
          })
```

Also handle the delete case so unbookmarking works. Replace the whole handleBookmark body
with this version:
```typescript
  const handleBookmark = async () => {
    const newState = !bookmarked
    setBookmarked(newState)
    toast(newState ? "🔖 Saved to bookmarks" : "Removed from bookmarks")
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000"
    const userId = session?.user?.email || "anonymous"
    try {
      if (newState) {
        await fetch(`${apiUrl}/bookmarks`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_id: userId,
            repo_full_name: `${repo.owner}/${repo.name}`,
            repo_data: repo
          })
        })
      } else {
        await fetch(`${apiUrl}/bookmarks/${encodeURIComponent(userId)}/${repo.owner}/${repo.name}`, {
          method: "DELETE"
        })
      }
    } catch {}
  }
```

---

# ===================================================================
# FIX B — Wire MongoDB Atlas Vector Search into the feed (THE BIG ONE)
# ===================================================================

WHY: Your /recommendations endpoint uses Atlas Vector Search but nothing calls it. This
seeds the repo corpus with embeddings, then shows an "AI Picks" section at the top of the
feed powered by Vector Search — with a visible "MongoDB Atlas Vector Search" badge so judges
see it immediately.

## B1 — Backend: store full repo metadata with embeddings

### FILE: apps/backend/core/embeddings.py
Add this function at the END of the file:
```python
async def index_repo(db, repo_data: dict) -> bool:
    """Store a repo's metadata + embedding so vector search can return full results."""
    full_name = repo_data.get("full_name") or f"{repo_data.get('owner','')}/{repo_data.get('name','')}"
    if not full_name or full_name == "/":
        return False

    existing = await db["repos"].find_one({"full_name": full_name}, {"summary_embedding": 1})
    embedding = existing.get("summary_embedding") if existing else None
    if not embedding:
        text = repo_data.get("description") or repo_data.get("name") or full_name
        embedding = await generate_embedding(text)
    if not embedding:
        return False

    await db["repos"].update_one(
        {"full_name": full_name},
        {"$set": {
            "full_name": full_name,
            "owner": repo_data.get("owner"),
            "name": repo_data.get("name"),
            "description": repo_data.get("description"),
            "language": repo_data.get("language"),
            "languageColor": repo_data.get("languageColor"),
            "stars": repo_data.get("stars", 0),
            "forks": repo_data.get("forks", 0),
            "topics": repo_data.get("topics", []),
            "avatarUrl": repo_data.get("avatarUrl"),
            "summary_embedding": embedding,
            "updated_at": datetime.utcnow(),
        }},
        upsert=True,
    )
    return True
```

## B2 — Backend: add index endpoint + return full metadata from recommendations

### FILE: apps/backend/main.py
Update the embeddings import:
```python
from core.embeddings import get_or_generate_repo_embedding, get_user_skill_embedding, generate_embedding, index_repo
```
Add this endpoint (put it near the other /ai endpoints):
```python
@app.post("/ai/index-repos")
async def index_repos(data: dict):
    """Seed the vector search corpus with a batch of repos."""
    repos = data.get("repos", [])
    count = 0
    for r in repos:
        try:
            if await index_repo(db, r):
                count += 1
        except Exception as e:
            print(f"[index] failed for {r.get('name')}: {e}")
    return {"indexed": count}
```
Then find the recommendations endpoint's `$project` stage:
```python
            {
                "$project": {
                    "_id": 0,
                    "full_name": 1,
                    "score": {"$meta": "vectorSearchScore"},
                }
            }
```
Replace it with (so it returns full repo data the UI can render):
```python
            {
                "$project": {
                    "_id": 0,
                    "full_name": 1, "owner": 1, "name": 1, "description": 1,
                    "language": 1, "languageColor": 1, "stars": 1, "forks": 1,
                    "topics": 1, "avatarUrl": 1,
                    "score": {"$meta": "vectorSearchScore"},
                }
            }
```

## B3 — Seed script (run ONCE before your demo so vector search has data)

### FILE: apps/backend/seed_repos.py  (NEW FILE)
```python
"""Run once to seed the vector search corpus: python seed_repos.py"""
import asyncio
import httpx
from services.database import db
from core.embeddings import index_repo

# Popular repos across domains so vector search always has something to match
SEED_REPOS = [
    "facebook/react", "vercel/next.js", "vuejs/core", "sveltejs/svelte",
    "langchain-ai/langchain", "openai/openai-python", "huggingface/transformers",
    "pytorch/pytorch", "tensorflow/tensorflow", "fastapi/fastapi", "django/django",
    "pallets/flask", "tiangolo/sqlmodel", "mongodb/mongo", "redis/redis",
    "postgres/postgres", "kubernetes/kubernetes", "docker/compose", "rust-lang/rust",
    "golang/go", "denoland/deno", "nodejs/node", "microsoft/TypeScript",
    "tailwindlabs/tailwindcss", "shadcn-ui/ui", "prisma/prisma", "supabase/supabase",
    "ollama/ollama", "ggerganov/llama.cpp", "n8n-io/n8n",
]

LANG_COLORS = {
    "Python": "#3572A5", "TypeScript": "#3178c6", "JavaScript": "#f1e05a",
    "Rust": "#dea584", "Go": "#00ADD8", "C": "#555555", "C++": "#f34b7d",
}

async def main():
    async with httpx.AsyncClient() as client:
        for full_name in SEED_REPOS:
            try:
                res = await client.get(
                    f"https://api.github.com/repos/{full_name}",
                    headers={"Accept": "application/vnd.github.v3+json"},
                )
                if res.status_code != 200:
                    print(f"skip {full_name} ({res.status_code})")
                    continue
                r = res.json()
                repo_data = {
                    "full_name": r["full_name"],
                    "owner": r["owner"]["login"],
                    "name": r["name"],
                    "description": r.get("description") or "",
                    "language": r.get("language") or "Unknown",
                    "languageColor": LANG_COLORS.get(r.get("language"), "#8b949e"),
                    "stars": r.get("stargazers_count", 0),
                    "forks": r.get("forks_count", 0),
                    "topics": r.get("topics", []),
                    "avatarUrl": r["owner"]["avatar_url"],
                }
                ok = await index_repo(db, repo_data)
                print(f"{'indexed' if ok else 'failed '} {full_name}")
            except Exception as e:
                print(f"error {full_name}: {e}")

if __name__ == "__main__":
    asyncio.run(main())
```
Run it once (backend folder, with your .env present):
```bash
cd apps/backend
python seed_repos.py
```
This populates the `repos` collection with ~30 repos + embeddings. After this, vector search
has data to match against.

## B4 — Frontend: show the "AI Picks" section in the feed

### FILE: apps/frontend/src/app/feed/page.tsx
After the skill-matching block (after the closing `}` of the `if (githubLogin) { ... }` block,
before the `return (`), add this to fetch recommendations and seed embeddings:
```typescript
  // Seed embeddings for current trending repos (fire and forget — grows the corpus)
  if (repos.length > 0) {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
    fetch(`${apiUrl}/ai/index-repos`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        repos: repos.slice(0, 10).map((r: any) => ({
          full_name: `${r.owner}/${r.name}`, owner: r.owner, name: r.name,
          description: r.description, language: r.language, languageColor: r.languageColor,
          stars: r.stars, forks: r.forks, topics: r.topics, avatarUrl: r.avatarUrl,
        })),
      }),
    }).catch(() => {});
  }

  // AI recommendations via MongoDB Atlas Vector Search
  let recommendations: any[] = [];
  if (githubLogin) {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
      const recRes = await fetch(`${apiUrl}/recommendations/${githubLogin}`, { cache: "no-store" });
      if (recRes.ok) {
        const recData = await recRes.json();
        recommendations = (recData.repos || []).map((r: any) => ({
          id: r.full_name,
          owner: r.owner,
          name: r.name,
          description: r.description || "",
          language: r.language || "Unknown",
          languageColor: r.languageColor || "#8b949e",
          stars: r.stars || 0,
          forks: r.forks || 0,
          forkVelocity: 0,
          topics: r.topics || [],
          updatedAt: "",
          avatarUrl: r.avatarUrl,
        }));
      }
    } catch (e) {
      console.error("recommendations failed", e);
    }
  }
```
Then in the JSX, add this AI Picks section. Put it right after the header `</div>` and BEFORE
the `<Tabs ...>`:
```tsx
        {/* AI Picks — MongoDB Atlas Vector Search */}
        {recommendations.length > 0 && (
          <div className="flex flex-col gap-3 mb-2">
            <div className="flex items-center gap-2">
              <span className="text-gh-purple">✦</span>
              <h3 className="text-sm font-semibold text-white">AI Picks for You</h3>
              <span className="text-[10px] uppercase tracking-wider text-gh-purple bg-gh-purple/10 border border-gh-purple/30 px-2 py-0.5 rounded-full">
                MongoDB Atlas Vector Search
              </span>
            </div>
            <p className="text-xs text-gh-muted -mt-1">
              Repos semantically matched to your skills ({userSkills.slice(0, 3).join(", ")}).
            </p>
            <div className="flex flex-col gap-3">
              {recommendations.slice(0, 3).map((repo: any) => (
                <RepoCard key={repo.id} repo={repo} userSkills={userSkills} />
              ))}
            </div>
            <div className="border-b border-gh-border pt-1" />
          </div>
        )}
```
This section ONLY appears when vector search returns results, so it never shows empty. When
it does appear, the purple "MongoDB Atlas Vector Search" badge makes the feature obvious to
judges.

---

# ===================================================================
# FIX C — (Optional) Modern FastAPI lifespan instead of deprecated on_event
# ===================================================================

WHY: `@app.on_event("startup")` is deprecated. Not urgent, but this removes the warning.

### FILE: apps/backend/main.py
Add this import at the top:
```python
from contextlib import asynccontextmanager
```
Replace the `@app.on_event("startup")` decorator and function with a lifespan function.
Find:
```python
@app.on_event("startup")
async def startup():
    await ping_db()
```
Change the decorator line so the function is just a plain async function named `startup_logic`:
```python
async def startup_logic():
    await ping_db()
```
(Keep the rest of the function body the same — indexes + seed communities.)

Then find where the app is created:
```python
app = FastAPI(title="Project Ronin API", version="1.0.0")
```
Replace with:
```python
@asynccontextmanager
async def lifespan(app: FastAPI):
    await startup_logic()
    yield

app = FastAPI(title="Project Ronin API", version="1.0.0", lifespan=lifespan)
```
IMPORTANT: `startup_logic` must be DEFINED ABOVE the `app = FastAPI(...)` line, or move the
lifespan function below startup_logic. Order: define startup_logic → define lifespan → create app.

---

# ===================================================================
# TEST CHECKLIST
# ===================================================================
1. Apply FIX A → restart frontend → bookmark a repo → go to /bookmarks → it should appear.
2. Apply FIX B → restart backend → run `python seed_repos.py` once (wait for it to finish).
3. Make sure your Atlas Vector Search index `ronin_vector_index` exists (the manual step from
   the earlier IMPROVEMENTS file — 768 dimensions, cosine, on the `repos` collection).
4. Sign in → go to feed → after your skills are detected, the "AI Picks for You" section with
   the purple MongoDB badge should appear at the top.
5. If AI Picks doesn't show: your skills might be empty (browse once to trigger sync) or the
   Atlas index isn't built yet. Check the backend terminal for "[vector search] failed" logs.

# DEMO TIP
For the hackathon video: have the AI Picks section visible, then cut to MongoDB Atlas showing
the `repos` collection with the `summary_embedding` array and the Vector Search index page.
That visually proves the Atlas Vector Search story end to end.