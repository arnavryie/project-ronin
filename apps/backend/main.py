from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv, find_dotenv
from services.database import ping_db, db
from services import social
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

@app.on_event("startup")
async def startup():
    await ping_db()

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
