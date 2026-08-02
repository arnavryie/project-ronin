# ⚔️ Project Ronin

> **The social intelligence layer for open-source developers — GitHub meets Twitter.**

Built for the [Google Cloud Rapid Agent Hackathon](https://rapid-agent.devpost.com) — MongoDB Partner Track.

## What is Ronin?

GitHub's social layer is broken. Developers discover repos through Twitter chaos, 
not GitHub Explore. Project Ronin is the missing layer — a personalized social 
feed for developers powered by real GitHub data and Gemini AI.

- **For You Feed** — trending repos filtered by your actual GitHub language stack
- **Communities** — topic-based hubs (AI/ML, Frontend, DevOps, Databases) with real repos
- **AI Insights** — Gemini-powered repo summaries + issue impact scoring
- **Skill Matching** — MongoDB Atlas Vector Search matches repos to your skills semantically
- **Developer Dossier** — AI-generated profile cards people actually want to share
- **Social Layer** — posts, likes, follows stored in MongoDB Atlas

## Tech Stack

| Layer | Tech |
|---|---|
| Frontend | Next.js 15, TypeScript, Tailwind CSS, shadcn/ui |
| Backend | FastAPI (Python), deployed on Cloud Run |
| AI | Gemini 1.5 Flash (summaries, scoring, dossiers) + text-embedding-004 |
| Database | MongoDB Atlas (social layer + Vector Search for recommendations) |
| Auth | GitHub OAuth via NextAuth.js v5 |
| Data | GitHub REST API + Search API |

## Google Cloud & MongoDB Usage

- **Gemini API** — repo summarization, issue impact scoring, developer dossier generation
- **text-embedding-004** — generates 768-dimension embeddings for repos and user skill profiles
- **MongoDB Atlas Vector Search** — cosine similarity search over repo embeddings to power personalized "For You" feed
- **MongoDB Atlas** — social graph (posts, likes, follows), AI cache (summaries, dossiers), user skill profiles, community membership

## Getting Started

### Prerequisites
- Node.js 18+, Python 3.11+, MongoDB Atlas account, GitHub OAuth app, Gemini API key

### Frontend
```bash
cd apps/frontend
npm install
cp .env.example .env.local  # fill in your keys
npm run dev
```

### Backend
```bash
cd apps/backend
pip install -r requirements.txt
cp .env.example .env  # fill in your keys
uvicorn main:app --reload --port 8000
```

### Environment Variables

**apps/frontend/.env.local**
```
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret
GITHUB_CLIENT_ID=your-github-oauth-client-id
GITHUB_CLIENT_SECRET=your-github-oauth-client-secret
NEXT_PUBLIC_API_URL=http://localhost:8000
```

**apps/backend/.env**
```
MONGODB_URI=your-mongodb-connection-string
GITHUB_PAT=your-github-pat
GEMINI_API_KEY=your-gemini-api-key
```

## License
**Proprietary / All Rights Reserved.** 
This code is the intellectual property of ryiefreaks. It may not be copied, modified, distributed, or sold without explicit written permission.
