from pydantic import BaseModel, Field
from typing import Optional, List, Any
from datetime import datetime

class RepoSchema(BaseModel):
    github_id: str
    name: str
    owner: str
    description: Optional[str] = None
    stars: int = 0
    forks: int = 0
    fork_velocity: int = 0
    language: Optional[str] = None
    tags: List[str] = []
    summary: Optional[str] = None
    summary_embedding: Optional[List[float]] = None
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class ActivitySchema(BaseModel):
    repo_id: str
    event_type: str  # issue_opened, pr_merged, fork_spike, star_milestone
    content: str
    content_embedding: Optional[List[float]] = None
    impact_score: float = 0.0
    created_at: datetime = Field(default_factory=datetime.utcnow)

class EdgeSchema(BaseModel):
    source_id: str
    target_id: str
    relation: str  # DEPENDS_ON, COMPETES_WITH, FORKED_FROM
    weight: float = 0.5

class UserSchema(BaseModel):
    github_id: str
    username: str
    avatar_url: Optional[str] = None
    skills: List[str] = []
    watched_repos: List[str] = []
    created_at: datetime = Field(default_factory=datetime.utcnow)

class AgentMemorySchema(BaseModel):
    user_id: str
    summary: str
    embedding: Optional[List[float]] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
