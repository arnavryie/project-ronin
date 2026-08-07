from google import genai
import os
from datetime import datetime

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
client = genai.Client(api_key=GEMINI_API_KEY) if GEMINI_API_KEY else None

async def generate_embedding(text: str) -> list[float]:
    """Generate a vector embedding using Gemini text-embedding-004."""
    if not client:
        return []
    try:
        result = client.models.embed_content(
            model="text-embedding-004",
            contents=text,
        )
        return result.embeddings[0].values
    except Exception as e:
        print(f"[embeddings] Failed to generate embedding: {e}")
        return []

async def get_or_generate_repo_embedding(db, repo_full_name: str, text: str) -> list[float]:
    """Get cached embedding from MongoDB or generate and store a new one."""
    doc = await db["repos"].find_one({"full_name": repo_full_name}, {"summary_embedding": 1})
    if doc and doc.get("summary_embedding"):
        return doc["summary_embedding"]

    embedding = await generate_embedding(text)
    if embedding:
        await db["repos"].update_one(
            {"full_name": repo_full_name},
            {"$set": {
                "full_name": repo_full_name,
                "summary_embedding": embedding,
                "updated_at": datetime.utcnow(),
            }},
            upsert=True,
        )
    return embedding

async def get_user_skill_embedding(db, github_username: str, skills: list[str]) -> list[float]:
    """Generate and cache an embedding for the user's skill profile."""
    if not skills:
        return []
    doc = await db["users"].find_one({"github_username": github_username}, {"skill_embedding": 1})
    if doc and doc.get("skill_embedding"):
        return doc["skill_embedding"]

    skill_text = f"Developer skilled in: {', '.join(skills)}. Looking for relevant open source repositories."
    embedding = await generate_embedding(skill_text)
    if embedding:
        await db["users"].update_one(
            {"github_username": github_username},
            {"$set": {"skill_embedding": embedding}},
            upsert=True,
        )
    return embedding

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
