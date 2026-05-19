from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv, find_dotenv
from services.database import ping_db
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
