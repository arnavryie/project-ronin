import React from 'react';
import Link from 'next/link';
import { Users, Award, MapPin } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import LanguageDot from '@/components/shared/LanguageDot';
import { getLanguageColor } from '@/lib/utils';
import { getGitHubUser } from '@/lib/github-api';
import { auth } from "@/app/api/auth/[...nextauth]/route";

export default async function FollowingPage() {
  const session = await auth();
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "/api";
  
  let followingUsers: any[] = [];
  let communities: any[] = [];
  
  if (session?.user?.name) {
    try {
      // Fetch followed users
      const followRes = await fetch(`${apiUrl}/following/${session.user.name}`, { next: { revalidate: 0 } });
      if (followRes.ok) {
        const followData = await followRes.json();
        const usernames = followData.following || [];
        // Fetch github info for each
        followingUsers = await Promise.all(
          usernames.map(async (u: string) => {
            try {
              return await getGitHubUser(u, (session as any).githubAccessToken);
            } catch (e) {
              return null;
            }
          })
        );
        followingUsers = followingUsers.filter(Boolean);
      }
      
      // Fetch communities
      const commRes = await fetch(`${apiUrl}/communities`, { next: { revalidate: 60 } });
      if (commRes.ok) {
        communities = await commRes.json();
      }
    } catch (e) {
      console.error("Failed to fetch following data", e);
    }
  }

  return (
    <div className="p-6 max-w-[1000px] mx-auto flex flex-col gap-6">
      <div className="border-b border-gh-border pb-3">
        <h2 className="text-xl font-bold text-white tracking-tight">Following</h2>
        <p className="text-xs text-gh-muted mt-1">Keep track of developers and communities you are following.</p>
      </div>

      {!session ? (
        <div className="text-center py-12 border border-gh-border bg-gh-surface rounded-md">
          <span className="text-gh-muted text-sm">Please sign in to see who you follow.</span>
        </div>
      ) : (
        <Tabs defaultValue="developers" className="w-full">
          <TabsList className="bg-[#161b22] border border-gh-border p-0.5 rounded-md flex self-start gap-1 select-none">
            <TabsTrigger 
              value="developers"
              className="flex items-center gap-1.5 px-4 py-1.5 text-xs text-gh-muted data-[state=active]:bg-gh-surface2 data-[state=active]:text-white rounded-md font-medium cursor-pointer"
            >
              <Users className="w-3.5 h-3.5" />
              <span>Developers</span>
              <span className="bg-gh-surface2 px-1.5 py-0.5 rounded-full text-[10px] text-gh-text border border-gh-border">{followingUsers.length}</span>
            </TabsTrigger>
            <TabsTrigger 
              value="communities"
              className="flex items-center gap-1.5 px-4 py-1.5 text-xs text-gh-muted data-[state=active]:bg-gh-surface2 data-[state=active]:text-white rounded-md font-medium cursor-pointer"
            >
              <Award className="w-3.5 h-3.5" />
              <span>Communities</span>
              <span className="bg-gh-surface2 px-1.5 py-0.5 rounded-full text-[10px] text-gh-text border border-gh-border">{communities.length}</span>
            </TabsTrigger>
          </TabsList>

          <div className="mt-4">
            <TabsContent value="developers" className="flex flex-col gap-4">
              {followingUsers.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 gap-4">
                  <div className="text-4xl">👥</div>
                  <h3 className="text-white font-semibold">You're not following anyone yet</h3>
                  <p className="text-gh-muted text-sm text-center max-w-xs">
                    Explore the feed and trending repos to find developers worth following.
                  </p>
                  <a href="/explore" className="text-gh-blue text-sm hover:underline">
                    Explore repositories →
                  </a>
                </div>
              ) : (
                followingUsers.map((dev) => (
                  <div 
                    key={dev.username}
                    className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-gh-surface border border-gh-border rounded-md hover:border-gh-border/80 transition-colors"
                  >
                    <div className="flex gap-3 overflow-hidden">
                      <img 
                        src={dev.avatar}
                        alt={dev.displayName}
                        className="w-12 h-12 rounded-full border border-gh-border shrink-0 bg-gh-bg"
                      />
                      <div className="flex flex-col overflow-hidden leading-tight justify-center">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Link 
                            href={`/profile/${dev.username}`}
                            className="text-sm font-semibold text-white hover:underline hover:text-gh-blue"
                          >
                            {dev.displayName}
                          </Link>
                          <span className="text-xs text-gh-muted">@{dev.username}</span>
                        </div>

                        <p className="text-xs text-gh-muted mt-1 leading-normal">
                          {dev.bio || "No bio available."}
                        </p>

                        <div className="flex items-center gap-4 mt-2 text-[11px] text-gh-muted flex-wrap">
                          {dev.location && (
                            <div className="flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5 shrink-0" />
                              <span>{dev.location}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-1">
                            <span>{dev.followers} followers</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </TabsContent>

            <TabsContent value="communities" className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {communities.length === 0 ? (
                <div className="text-center py-12 border border-gh-border bg-gh-surface rounded-md md:col-span-2">
                  <span className="text-gh-muted text-sm">No communities found.</span>
                </div>
              ) : (
                communities.map((comm) => (
                  <div 
                    key={comm.slug}
                    className="p-4 bg-gh-surface border border-gh-border rounded-md hover:border-gh-blue transition-colors flex flex-col gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl p-1.5 rounded-md bg-gh-bg border border-gh-border select-none">{comm.icon}</span>
                      <div className="flex flex-col leading-tight">
                        <Link 
                          href={`/communities/${comm.slug}`}
                          className="text-sm font-bold text-white hover:underline hover:text-gh-blue"
                        >
                          {comm.name}
                        </Link>
                        <span className="text-[10px] text-gh-muted">Community • {comm.slug}</span>
                      </div>
                    </div>

                    <p className="text-xs text-gh-muted line-clamp-2 leading-relaxed">
                      {comm.description}
                    </p>

                    <div className="flex items-center gap-4 text-xs text-gh-muted mt-auto pt-2 border-t border-gh-border/40 select-none">
                      <div>
                        <span className="font-semibold text-white">{comm.member_count}</span> members
                      </div>
                    </div>
                  </div>
                ))
              )}
            </TabsContent>
          </div>
        </Tabs>
      )}
    </div>
  );
}
