import google.generativeai as genai
import os
import json
from datetime import datetime

# Initialize Gemini only if API key is present
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)
    model = genai.GenerativeModel("gemini-1.5-flash")
else:
    model = None

async def generate_repo_summary(repo_name: str, description: str, topics: list, language: str) -> str:
    """AI summary — cached in MongoDB to avoid repeat API calls"""
    if not model:
        return "Gemini API key is not configured. AI summaries are disabled."

    prompt = f"""You are a developer analyst. In exactly 2 sentences, describe what this GitHub repository does and why developers find it valuable.

Repository: {repo_name}
Description: {description}
Language: {language}
Topics: {', '.join(topics)}

Be specific and technical. No marketing fluff."""
    response = model.generate_content(prompt)
    return response.text.strip()

async def score_issue_impact(issue_title: str, repo_name: str) -> dict:
    if not model:
        return {"score": 50, "level": "Med", "reason": "AI disabled - no API key"}

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
    if not model:
        return "Gemini API key is not configured. AI dossiers are disabled."

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
