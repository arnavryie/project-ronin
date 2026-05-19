from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv, find_dotenv
from services.database import ping_db, db
from services import social, users
from core.gemini import get_or_generate_summary, score_issue_impact, generate_developer_dossier
from pydantic import BaseModel
import os

load_dotenv(find_dotenv())

app = FastAPI(title="Project Ronin API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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
    for community in SEED_COMMUNITIES:
        await db["communities"].update_one(
            {"slug": community["slug"]},
            {"$setOnInsert": {**community, "member_count": 0, "members": []}},
            upsert=True
        )

@app.get("/")
async def root():
    return {"status": "Ronin backend alive 🔥"}

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

@app.post("/posts/{post_id}/unlike")
async def unlike_post(post_id: str, like: LikePost):
    await social.unlike_post(db, post_id, like.user_id)
    return {"success": True}

@app.get("/posts")
async def get_posts(limit: int = 20, skip: int = 0):
    return await social.get_feed_posts(db, limit, skip)

@app.post("/follow")
async def follow(data: FollowUser):
    await social.follow_user(db, data.follower_id, data.following_id, data.following_username)
    return {"success": True}

@app.post("/unfollow")
async def unfollow(data: FollowUser):
    await social.unfollow_user(db, data.follower_id, data.following_id)
    return {"success": True}

@app.get("/following/{user_id}")
async def get_following(user_id: str):
    following = await social.get_following(db, user_id)
    return {"following": following}

@app.get("/users/{username}/skills")
async def get_skills(username: str):
    skills = await users.get_user_skills(db, username)
    return {"skills": skills}

@app.post("/sync-user")
async def sync_user(data: dict):
    skills = await users.sync_github_user(db, data["token"], data["username"])
    return {"skills": skills}

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


