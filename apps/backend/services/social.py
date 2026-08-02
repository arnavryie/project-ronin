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
