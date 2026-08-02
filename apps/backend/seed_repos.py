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
