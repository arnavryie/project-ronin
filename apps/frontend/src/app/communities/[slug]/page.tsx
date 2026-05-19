import React from 'react';
import { getReposByTopic } from '@/lib/github-api';
import { auth } from "@/app/api/auth/[...nextauth]/route";
import RepoCard from '@/components/feed/RepoCard';
import DependencyGraph from '@/components/communities/DependencyGraph';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Compass, MessageSquare, ShieldAlert } from 'lucide-react';

const COMMUNITY_MAP: Record<string, { name: string; icon: string; description: string; topic: string; color: string }> = {
  "ai-ml":       { name: "AI & Machine Learning", icon: "🤖", description: "LLMs, neural networks, AI tools and frameworks", topic: "machine-learning", color: "#58a6ff" },
  "ui-frontend": { name: "UI & Frontend",          icon: "⚛️", description: "React, Vue, Svelte, CSS frameworks, design systems", topic: "react",  color: "#8957e5" },
  "devops":      { name: "DevOps & Infrastructure",icon: "⚙️", description: "Docker, Kubernetes, CI/CD, cloud-native tools",        topic: "kubernetes", color: "#238636" },
  "databases":   { name: "Databases",              icon: "🗄️", description: "SQL, NoSQL, vector databases, ORMs",                    topic: "database", color: "#d76027" },
  "systems":     { name: "Systems & Rust",         icon: "⚡", description: "Systems programming, performance engineering",          topic: "rust", color: "#dea584" },
  "python":      { name: "Python",                 icon: "🐍", description: "Python libraries, frameworks, and tools",               topic: "python", color: "#3572A5" },
  "web3":        { name: "Web3 & Blockchain",      icon: "⛓️", description: "DeFi, smart contracts, crypto protocols",               topic: "blockchain", color: "#f1e05a" },
  "mobile":      { name: "Mobile Dev",             icon: "📱", description: "iOS, Android, Flutter, React Native",                   topic: "flutter", color: "#00B4AB" },
};

export default async function CommunitySlugPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const community = COMMUNITY_MAP[slug] || {
    name: slug, icon: "⚡", description: `Repos tagged with #${slug}`, topic: slug, color: "#58a6ff",
  };

  let repos: any[] = [];
  try {
    repos = await getReposByTopic(community.topic);
  } catch (e) {
    repos = [];
  }

  const session = await auth();
  let userSkills: string[] = [];

  if (session?.user?.name) {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
      const res = await fetch(`${apiUrl}/users/${session.user.name}/skills`, { next: { revalidate: 300 } });
      if (res.ok) {
        const data = await res.json();
        userSkills = data.skills || [];
      }
    } catch (e) {
      console.error("Failed to fetch user skills", e);
    }
  }

  return (
    <div className="p-6 max-w-[1000px] mx-auto flex flex-col gap-6">
      {/* Header card */}
      <div
        className="p-5 bg-gh-surface border border-gh-border rounded-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
        style={{ borderLeftColor: community.color, borderLeftWidth: 3 }}
      >
        <div className="flex gap-4 items-center">
          <span className="text-4xl p-2.5 rounded-md bg-gh-bg border border-gh-border select-none">{community.icon}</span>
          <div className="flex flex-col leading-tight">
            <h2 className="text-xl font-bold text-white tracking-tight">{community.name}</h2>
            <span className="text-xs text-gh-muted mt-1">/c/{slug} · #{community.topic} on GitHub</span>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs text-gh-muted select-none">
          <div className="text-center bg-gh-bg px-3 py-1.5 rounded border border-gh-border">
            <span className="font-semibold text-white block text-sm">{repos.length}+</span>
            <span>Repos</span>
          </div>
        </div>
      </div>

      <p className="text-sm text-gh-muted leading-relaxed max-w-[800px] -mt-2">
        {community.description}
      </p>

      {/* Tabs */}
      <Tabs defaultValue="repos" className="w-full">
        <TabsList className="bg-[#161b22] border border-gh-border p-0.5 rounded-md flex self-start gap-1 select-none">
          <TabsTrigger
            value="repos"
            className="flex items-center gap-1.5 px-4 py-1.5 text-xs text-gh-muted data-[state=active]:bg-gh-surface2 data-[state=active]:text-white rounded-md font-medium cursor-pointer"
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Repositories ({repos.length})</span>
          </TabsTrigger>
          <TabsTrigger
            value="graph"
            className="flex items-center gap-1.5 px-4 py-1.5 text-xs text-gh-muted data-[state=active]:bg-gh-surface2 data-[state=active]:text-white rounded-md font-medium cursor-pointer"
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Dependency Graph</span>
          </TabsTrigger>
          <TabsTrigger
            value="discussions"
            className="flex items-center gap-1.5 px-4 py-1.5 text-xs text-gh-muted data-[state=active]:bg-gh-surface2 data-[state=active]:text-white rounded-md font-medium cursor-pointer"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Discussions</span>
          </TabsTrigger>
        </TabsList>

        <div className="mt-4">
          <TabsContent value="repos" className="flex flex-col gap-4">
            {repos.length === 0 ? (
              <div className="text-center py-12 border border-gh-border bg-gh-surface rounded-md">
                <span className="text-gh-muted text-sm">No repositories found for this community.</span>
              </div>
            ) : (
              repos.map(repo => (
                <RepoCard key={repo.id} repo={repo} userSkills={userSkills} />
              ))
            )}
          </TabsContent>

          <TabsContent value="graph">
            <DependencyGraph />
          </TabsContent>

          <TabsContent value="discussions" className="flex flex-col gap-4">
            <div className="p-4 bg-gh-surface border border-gh-border rounded-md">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-gh-blue">#general</span>
                <span className="text-[10px] text-gh-muted">Updated 2 hours ago</span>
              </div>
              <h4 className="text-sm font-semibold text-white mt-1">Which framework is best for streaming gRPC logs?</h4>
              <p className="text-xs text-gh-muted mt-2">
                "We are experiencing high resource consumption using standard HTTP long-polling. Anyone here implemented custom streaming adapters?"
              </p>
            </div>
            <div className="p-4 bg-gh-surface border border-gh-border rounded-md">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-gh-blue">#announcements</span>
                <span className="text-[10px] text-gh-muted">Updated yesterday</span>
              </div>
              <h4 className="text-sm font-semibold text-white mt-1">Hackathon project registrations are open!</h4>
              <p className="text-xs text-gh-muted mt-2">
                "Form groups and register your repository for the social intelligence platform challenge. Top 3 projects receive funding."
              </p>
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
