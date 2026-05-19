import React from 'react';
import { getGitHubUser, getUserRepos } from '@/lib/github-api';
import ContributionGraph from '@/components/profile/ContributionGraph';
import SkillBadge from '@/components/shared/SkillBadge';
import LanguageDot from '@/components/shared/LanguageDot';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Users, MapPin, Star, BookOpen, BrainCircuit, Globe, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { FollowButton } from '@/components/profile/FollowButton';
import { DeveloperDossier } from '@/components/profile/DeveloperDossier';

export default async function ProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;

  let user: any = null;
  let repos: any[] = [];

  try {
    [user, repos] = await Promise.all([
      getGitHubUser(username),
      getUserRepos(username),
    ]);
  } catch (e) {
    user = {
      username,
      displayName: username,
      avatar: `https://github.com/${username}.png`,
      bio: "",
      location: "",
      website: "",
      followers: 0,
      following: 0,
      publicRepos: 0,
    };
  }

  // Derive top languages from repos
  const langCounts: Record<string, number> = {};
  repos.forEach(r => {
    if (r.language && r.language !== "Unknown") {
      langCounts[r.language] = (langCounts[r.language] || 0) + 1;
    }
  });
  const topLanguages = Object.entries(langCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([lang]) => lang);

  return (
    <div className="p-6 max-w-[1200px] mx-auto">
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Left Column */}
        <div className="w-full lg:w-[280px] shrink-0 flex flex-col gap-4">
          <div className="flex flex-row lg:flex-col items-center lg:items-start gap-4 lg:gap-2">
            <img
              src={user.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${user.username}`}
              alt={user.displayName}
              className="w-20 h-20 lg:w-[260px] lg:h-[260px] rounded-full border border-gh-border bg-gh-surface shrink-0"
            />
            <div className="flex flex-col leading-snug">
              <h2 className="text-xl lg:text-2xl font-bold text-white tracking-tight mt-2">{user.displayName}</h2>
              <span className="text-sm text-gh-muted select-all">@{user.username}</span>
            </div>
          </div>

          {user.bio && (
            <p className="text-sm text-gh-text mt-1 leading-relaxed">{user.bio}</p>
          )}
          
          <FollowButton targetUserId={user.username} targetUsername={user.username} />

          <div className="flex items-center gap-2.5 text-xs text-gh-muted select-none">
            <div className="flex items-center gap-1 hover:text-gh-blue cursor-pointer">
              <Users className="w-3.5 h-3.5" />
              <span className="font-semibold text-white">{user.followers.toLocaleString()}</span>
              <span>followers</span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-1 hover:text-gh-blue cursor-pointer">
              <span className="font-semibold text-white">{user.following.toLocaleString()}</span>
              <span>following</span>
            </div>
          </div>

          {user.location && (
            <div className="flex items-center gap-1.5 text-xs text-gh-muted">
              <MapPin className="w-3.5 h-3.5 shrink-0" />
              <span>{user.location}</span>
            </div>
          )}

          {user.website && (
            <div className="flex items-center gap-1.5 text-xs text-gh-muted">
              <Globe className="w-3.5 h-3.5 shrink-0" />
              <a href={user.website} target="_blank" rel="noopener noreferrer" className="hover:text-gh-blue truncate">
                {user.website}
              </a>
            </div>
          )}

          {user.twitterUsername && (
            <div className="flex items-center gap-1.5 text-xs text-gh-muted">
              <ExternalLink className="w-3.5 h-3.5 shrink-0" />
              <a href={`https://twitter.com/${user.twitterUsername}`} target="_blank" rel="noopener noreferrer" className="hover:text-gh-blue">
                @{user.twitterUsername}
              </a>
            </div>
          )}

          <hr className="border-gh-border my-2" />

          {/* Top Languages */}
          {topLanguages.length > 0 && (
            <div className="flex flex-col gap-2">
              <span className="text-xs font-bold text-gh-muted uppercase tracking-wider">Top Languages</span>
              <div className="flex flex-wrap gap-1.5">
                {topLanguages.map((lang) => (
                  <SkillBadge key={lang} skill={lang} />
                ))}
              </div>
            </div>
          )}
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
                {/* Repos */}
                <div className="flex flex-col gap-3">
                  <h3 className="text-sm font-semibold text-white select-none">
                    Top Repositories
                    <span className="ml-2 text-xs text-gh-muted font-normal">{user.publicRepos} public repos</span>
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {repos.map((repo) => (
                      <div
                        key={repo.id}
                        className="p-4 bg-gh-surface border border-gh-border rounded-md hover:border-gh-blue transition-colors flex flex-col gap-3"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <Link
                            href={`/repo/${repo.owner}/${repo.name}`}
                            className="text-sm text-gh-blue font-bold hover:underline truncate"
                          >
                            {repo.name}
                          </Link>
                          <span className="text-[10px] text-gh-muted border border-gh-border px-2 py-0.5 rounded-full select-none">
                            {repo.isPrivate ? "Private" : "Public"}
                          </span>
                        </div>

                        <p className="text-xs text-gh-muted line-clamp-2 leading-relaxed">
                          {repo.description || "No description provided."}
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

              <TabsContent value="dossier" className="mt-0 outline-none border-none">
                <DeveloperDossier 
                  username={user.username} 
                  skills={topLanguages} 
                  topRepos={repos.map(r => r.name)} 
                />
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
