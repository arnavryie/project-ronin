'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { mockUser, mockDevelopers, mockRepos } from '@/lib/mock-data';
import ContributionGraph from '@/components/profile/ContributionGraph';
import SkillBadge from '@/components/shared/SkillBadge';
import LanguageDot from '@/components/shared/LanguageDot';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Users, MapPin, Star, BookOpen, BrainCircuit } from 'lucide-react';

export default function ProfilePage() {
  const params = useParams();
  const username = params.username as string;

  const isSelf = username === mockUser.username;
  const devData = mockDevelopers.find(d => d.username === username);

  const profile = isSelf 
    ? {
        username: mockUser.username,
        displayName: mockUser.displayName,
        avatar: mockUser.avatar,
        bio: mockUser.bio,
        location: mockUser.location,
        followers: mockUser.followers,
        following: mockUser.following,
        skills: mockUser.skills,
        topLanguages: ["Python", "TypeScript", "JavaScript"],
      }
    : devData 
      ? {
          username: devData.username,
          displayName: devData.displayName,
          avatar: devData.avatar,
          bio: devData.bio,
          location: devData.location,
          followers: devData.followers,
          following: 120,
          skills: devData.topLanguages.concat(["OSS", "Git"]),
          topLanguages: devData.topLanguages,
        }
      : {
          username: username,
          displayName: username,
          avatar: `https://github.com/${username}.png`,
          bio: "Developer at Project Ronin platform.",
          location: "Global",
          followers: 12,
          following: 15,
          skills: ["Git"],
          topLanguages: ["Python"],
        };

  const pinnedRepos = mockRepos.filter(repo => {
    if (isSelf) return repo.owner === 'fastapi' || repo.owner === 'mongodb' || repo.owner === 'hwchase17';
    return repo.owner === username || repo.language === profile.topLanguages[0];
  }).slice(0, 4);

  return (
    <div className="p-6 max-w-[1200px] mx-auto">
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Left Column */}
        <div className="w-full lg:w-[280px] shrink-0 flex flex-col gap-4">
          <div className="flex flex-row lg:flex-col items-center lg:items-start gap-4 lg:gap-2">
            <img 
              src={profile.avatar}
              alt={profile.displayName}
              className="w-20 h-20 lg:w-[260px] lg:h-[260px] rounded-full border border-gh-border bg-gh-surface shrink-0"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = `https://api.dicebear.com/7.x/initials/svg?seed=${profile.username}`;
              }}
            />
            <div className="flex flex-col leading-snug">
              <h2 className="text-xl lg:text-2xl font-bold text-white tracking-tight mt-2">{profile.displayName}</h2>
              <span className="text-sm text-gh-muted select-all">@{profile.username}</span>
            </div>
          </div>

          <p className="text-sm text-gh-text mt-1 leading-relaxed">
            {profile.bio}
          </p>

          <div className="flex items-center gap-2.5 text-xs text-gh-muted select-none">
            <div className="flex items-center gap-1 hover:text-gh-blue cursor-pointer">
              <Users className="w-3.5 h-3.5" />
              <span className="font-semibold text-white">{profile.followers}</span>
              <span>followers</span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-1 hover:text-gh-blue cursor-pointer">
              <span className="font-semibold text-white">{profile.following}</span>
              <span>following</span>
            </div>
          </div>

          {profile.location && (
            <div className="flex items-center gap-1.5 text-xs text-gh-muted">
              <MapPin className="w-3.5 h-3.5 shrink-0" />
              <span>{profile.location}</span>
            </div>
          )}

          <hr className="border-gh-border my-2" />

          {/* Skills */}
          <div className="flex flex-col gap-2">
            <span className="text-xs font-bold text-gh-muted uppercase tracking-wider">Skills</span>
            <div className="flex flex-wrap gap-1.5">
              {profile.skills.map((skill) => (
                <SkillBadge key={skill} skill={skill} />
              ))}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="flex-1 flex flex-col gap-6 w-full">
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="bg-[#161b22] border border-gh-border p-0.5 rounded-md flex self-start gap-1 select-none">
              <TabsTrigger 
                value="overview"
                className="flex items-center gap-1.5 px-4 py-1.5 text-xs text-gh-muted data-[state=active]:bg-gh-surface2 data-[state=active]:text-white rounded-md font-medium cursor-pointer"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Overview</span>
              </TabsTrigger>
              <TabsTrigger 
                value="dossier"
                className="flex items-center gap-1.5 px-4 py-1.5 text-xs text-gh-muted data-[state=active]:bg-gh-surface2 data-[state=active]:text-white rounded-md font-medium cursor-pointer"
              >
                <BrainCircuit className="w-3.5 h-3.5" />
                <span>Developer Intelligence Dossier</span>
              </TabsTrigger>
            </TabsList>

            <div className="mt-4">
              <TabsContent value="overview" className="flex flex-col gap-6">
                {/* Pinned Repos */}
                <div className="flex flex-col gap-3">
                  <h3 className="text-sm font-semibold text-white select-none">Pinned Repositories</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {pinnedRepos.map((repo) => (
                      <div 
                        key={repo.id} 
                        className="p-4 bg-gh-surface border border-gh-border rounded-md hover:border-gh-blue transition-colors flex flex-col gap-3"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <a 
                            href={`/repo/${repo.owner}/${repo.name}`}
                            className="text-sm text-gh-blue font-bold hover:underline truncate"
                          >
                            {repo.name}
                          </a>
                          <span className="text-[10px] text-gh-muted border border-gh-border px-2 py-0.5 rounded-full select-none">
                            Public
                          </span>
                        </div>
                        
                        <p className="text-xs text-gh-muted line-clamp-2 leading-relaxed">
                          {repo.description}
                        </p>

                        <div className="flex items-center gap-4 text-xs text-gh-muted mt-auto pt-2 select-none">
                          <LanguageDot language={repo.language} color={repo.languageColor} />
                          <div className="flex items-center gap-1">
                            <Star className="w-3.5 h-3.5" />
                            <span className="mono">{repo.stars.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Heatmap */}
                <div className="flex flex-col gap-3">
                  <h3 className="text-sm font-semibold text-white select-none">Contribution History</h3>
                  <ContributionGraph />
                </div>
              </TabsContent>

              <TabsContent value="dossier" className="p-5 bg-gh-surface border border-gh-border rounded-md flex flex-col gap-4">
                <div className="border-b border-gh-border/60 pb-3 flex items-center gap-2 select-none">
                  <BrainCircuit className="w-5 h-5 text-gh-purple animate-pulse" />
                  <h3 className="text-sm font-bold text-white tracking-tight">AI Platform Analysis Dossier</h3>
                </div>

                <div className="flex flex-col gap-4 leading-relaxed">
                  <div className="flex flex-col gap-1">
                    <span className="text-xs font-semibold text-white">1. Developer Intelligence Persona</span>
                    <p className="text-[11px] text-gh-muted">
                      Collaborative system architecture specialist. Excels at high-performance asynchronous pipeline integrations in Python and TypeScript ecosystems. Focuses heavily on developer tooling, API stability, and schema validation.
                    </p>
                  </div>
                  
                  <div className="flex flex-col gap-1">
                    <span className="text-xs font-semibold text-white">2. Open Task Skill Mapping</span>
                    <p className="text-[11px] text-gh-muted">
                      Has excellent overlap (92%) with performance bottleneck issues in **langchain** and **fastapi**. Recommended as lead assignee for concurrent scheduling and gRPC streaming implementations.
                    </p>
                  </div>
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
