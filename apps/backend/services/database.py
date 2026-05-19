from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv, find_dotenv
import os

load_dotenv(find_dotenv())

MONGODB_URI = os.getenv("MONGODB_URI")

client = AsyncIOMotorClient(MONGODB_URI)
db = client["project_ronin"]

# Collections
repos_collection = db["repos"]
activity_collection = db["activity"]
edges_collection = db["edges"]
users_collection = db["users"]
agent_memory_collection = db["agent_memory"]

async def ping_db():
    try:
        await client.admin.command("ping")
        print("[SUCCESS] MongoDB connected!")
        return True
    except Exception as e:
        print(f"[ERROR] MongoDB connection failed: {e}")
        return False
