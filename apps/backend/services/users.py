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
        if res.status_code != 200:
            return []
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
