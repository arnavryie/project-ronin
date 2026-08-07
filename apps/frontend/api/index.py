from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from dotenv import load_dotenv, find_dotenv
from services.database import ping_db, db
from services import social, users
from core.gemini import get_or_generate_summary, score_issue_impact, generate_developer_dossier, get_or_score_issue, get_or_generate_dossier
from core.embeddings import get_or_generate_repo_embedding, get_user_skill_embedding, generate_embedding, index_repo
from pydantic import BaseModel
import os
from datetime import datetime

load_dotenv(find_dotenv())

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

async def startup_logic():
    connected = await ping_db()
    if not connected:
        print("[WARNING] MongoDB connection unavailable. Backend running in fallback mode.")
        return

    try:
        # Indexes for performance
        await db["posts"].create_index([("created_at", -1)])
        await db["follows"].create_index([("follower_id", 1)])
        await db["communities"].create_index([("slug", 1)], unique=True)
        await db["ai_cache"].create_index([("repo", 1), ("type", 1)])
        await db["ai_cache"].create_index([("created_at", 1)], expireAfterSeconds=604800)

        # Seed communities
        for community in SEED_COMMUNITIES:
            await db["communities"].update_one(
                {"slug": community["slug"]},
                {"$setOnInsert": {**community, "member_count": 0, "members": []}},
                upsert=True
            )
    except Exception as e:
        print(f"[WARNING] Index creation warning: {e}")

@asynccontextmanager
async def lifespan(app: FastAPI):
    await startup_logic()
    yield

app = FastAPI(title="Project Ronin API", version="1.0.0", lifespan=lifespan)

ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000")
origins = [o.strip() for o in ALLOWED_ORIGINS.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
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

@app.post("/users/{username}/status")
async def set_user_status(username: str, data: dict):
    await db["users"].update_one(
        {"github_username": username},
        {"$set": {"status": data.get("status", ""), "updated_at": datetime.utcnow()}},
        upsert=True
    )
    return {"success": True}

@app.get("/users/{username}/status")
async def get_user_status(username: str):
    user = await db["users"].find_one({"github_username": username})
    return {"status": user.get("status", "") if user else ""}

@app.post("/sync-user")
async def sync_user(data: dict):
    skills = await users.sync_github_user(db, data["token"], data["username"])
    return {"skills": skills}

@app.get("/ai/repo-summary")
async def repo_summary(repo: str, description: str = "", language: str = "", topics: str = ""):
    summary = await get_or_generate_summary(db, repo, description, topics.split(","), language)
    return {"summary": summary}

@app.get("/ai/issue-score")
async def issue_score(repo: str, issue_number: int, issue_title: str):
    return await get_or_score_issue(db, repo, issue_number, issue_title)

@app.post("/ai/developer-dossier")
async def developer_dossier(data: dict):
    dossier = await get_or_generate_dossier(db, data["username"], data.get("skills", []), data.get("top_repos", []))
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

class BookmarkData(BaseModel):
    user_id: str
    repo_full_name: str
    repo_data: dict

@app.post("/bookmarks")
async def add_bookmark(data: BookmarkData):
    await db["bookmarks"].update_one(
        {"user_id": data.user_id, "repo_full_name": data.repo_full_name},
        {"$set": {
            "user_id": data.user_id,
            "repo_full_name": data.repo_full_name,
            "repo_data": data.repo_data,
            "created_at": datetime.utcnow()
        }},
        upsert=True
    )
    return {"success": True}

@app.delete("/bookmarks/{user_id}/{repo_full_name:path}")
async def remove_bookmark(user_id: str, repo_full_name: str):
    await db["bookmarks"].delete_one({"user_id": user_id, "repo_full_name": repo_full_name})
    return {"success": True}

@app.get("/bookmarks/{user_id}")
async def get_bookmarks(user_id: str):
    cursor = db["bookmarks"].find({"user_id": user_id}).sort("created_at", -1)
    bookmarks = await cursor.to_list(length=100)
    for b in bookmarks:
        b["_id"] = str(b["_id"])
    return bookmarks


@app.post("/ai/index-repos")
async def index_repos_endpoint(data: dict):
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

@app.post("/ai/store-repo-embedding")
async def store_repo_embedding(data: dict):
    """Store a repo's summary embedding for vector search."""
    repo = data.get("repo", "")
    summary = data.get("summary", "")
    description = data.get("description", "")
    text = summary or description
    if not text:
        return {"success": False, "reason": "no text"}
    embedding = await get_or_generate_repo_embedding(db, repo, text)
    return {"success": bool(embedding), "dimensions": len(embedding)}

@app.get("/recommendations/{username}")
async def get_recommendations(username: str):
    """Use MongoDB Atlas Vector Search to find repos matching user's skills."""
    user = await db["users"].find_one({"github_username": username})
    if not user or not user.get("skills"):
        return {"repos": [], "reason": "no skills found"}

    skill_embedding = await get_user_skill_embedding(db, username, user["skills"])
    if not skill_embedding:
        return {"repos": [], "reason": "could not generate embedding"}

    try:
        # MongoDB Atlas Vector Search pipeline
        pipeline = [
            {
                "$vectorSearch": {
                    "index": "ronin_vector_index",
                    "path": "summary_embedding",
                    "queryVector": skill_embedding,
                    "numCandidates": 50,
                    "limit": 10,
                }
            },
            {
                "$project": {
                    "_id": 0,
                    "full_name": 1, "owner": 1, "name": 1, "description": 1,
                    "language": 1, "languageColor": 1, "stars": 1, "forks": 1,
                    "topics": 1, "avatarUrl": 1,
                    "score": {"$meta": "vectorSearchScore"},
                }
            }
        ]
        cursor = db["repos"].aggregate(pipeline)
        results = await cursor.to_list(length=10)
        return {"repos": results, "source": "vector_search"}
    except Exception as e:
        print(f"[vector search] failed: {e}")
        return {"repos": [], "reason": str(e)}


