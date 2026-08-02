from google import genai
import os
import json
from datetime import datetime

# Initialize Gemini only if API key is present
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
client = genai.Client(api_key=GEMINI_API_KEY) if GEMINI_API_KEY else None

async def generate_repo_summary(repo_name: str, description: str, topics: list, language: str) -> str:
    """AI summary — cached in MongoDB to avoid repeat API calls"""
    if not client:
        return "Gemini API key is not configured. AI summaries are disabled."

    prompt = f"""You are a developer analyst. In exactly 2 sentences, describe what this GitHub repository does and why developers find it valuable.

Repository: {repo_name}
Description: {description}
Language: {language}
Topics: {', '.join(topics)}

Be specific and technical. No marketing fluff."""
    response = client.models.generate_content(model="gemini-1.5-flash", contents=prompt)
    return response.text.strip()

async def score_issue_impact(issue_title: str, repo_name: str) -> dict:
    if not client:
        return {"score": 50, "level": "Med", "reason": "AI disabled - no API key"}

    prompt = f"""You are a senior engineer triaging GitHub issues.
Score this issue's impact 0-100.

Repository: {repo_name}
Issue: {issue_title}

Respond in JSON only, no markdown:
{{"score": <number>, "level": "<High|Med|Low>", "reason": "<one sentence>"}}"""
    response = client.models.generate_content(model="gemini-1.5-flash", contents=prompt)
    try:
        text = response.text.strip().replace("```json", "").replace("```", "")
        return json.loads(text)
    except:
        return {"score": 50, "level": "Med", "reason": "Unable to analyze"}

async def generate_developer_dossier(username: str, skills: list, top_repos: list) -> str:
    if not client:
        return "Gemini API key is not configured. AI dossiers are disabled."

    prompt = f"""You are a technical analyst writing a developer intelligence report.
Write 2 paragraphs analyzing this GitHub developer's profile.

Developer: {username}
Core Skills: {', '.join(skills)}
Top Repositories: {', '.join(top_repos[:5])}

Cover: technical specialization and what kinds of problems they solve best."""
    response = client.models.generate_content(model="gemini-1.5-flash", contents=prompt)
    return response.text.strip()

async def get_or_generate_summary(db, repo_full_name: str, description: str, topics: list, language: str) -> str:
    """Check MongoDB cache first, only call Gemini if not cached"""
    cached = await db["ai_cache"].find_one({"repo": repo_full_name, "type": "summary"})
    if cached:
        return cached["content"]
    
    summary = await generate_repo_summary(repo_full_name, description, topics, language)
    
    # Cache the summary
    await db["ai_cache"].insert_one({
        "repo": repo_full_name,
        "type": "summary",
        "content": summary,
        "created_at": datetime.utcnow()
    })

    # Also store the embedding for vector search
    try:
        from core.embeddings import get_or_generate_repo_embedding
        await get_or_generate_repo_embedding(db, repo_full_name, summary)
    except Exception as e:
        print(f"[embeddings] Warning: {e}")

    return summary

async def get_or_score_issue(db, repo_full_name: str, issue_number: int, issue_title: str) -> dict:
    """Score an issue once with Gemini, then serve from MongoDB cache forever."""
    cache_key = f"{repo_full_name}#{issue_number}"
    cached = await db["ai_cache"].find_one({"repo": cache_key, "type": "issue_score"})
    if cached:
        return cached["content"]

    result = await score_issue_impact(issue_title, repo_full_name)

    await db["ai_cache"].insert_one({
        "repo": cache_key,
        "type": "issue_score",
        "content": result,
        "created_at": datetime.utcnow(),
    })
    return result

async def get_or_generate_dossier(db, username: str, skills: list, top_repos: list) -> str:
    """Generate a developer dossier once, then serve from MongoDB cache."""
    cached = await db["ai_cache"].find_one({"repo": username, "type": "dossier"})
    if cached:
        return cached["content"]

    dossier = await generate_developer_dossier(username, skills, top_repos)

    await db["ai_cache"].insert_one({
        "repo": username,
        "type": "dossier",
        "content": dossier,
        "created_at": datetime.utcnow(),
    })
    return dossier
