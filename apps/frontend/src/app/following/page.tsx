'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Users, Award, MapPin } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { mockDevelopers, mockCommunities } from '@/lib/mock-data';
import LanguageDot from '@/components/shared/LanguageDot';
import { getLanguageColor } from '@/lib/utils';

export default function FollowingPage() {
  const [followingStates, setFollowingStates] = useState<Record<string, boolean>>(
    Object.fromEntries(mockDevelopers.map(dev => [dev.username, dev.following]))
  );

  const toggleFollow = (username: string) => {
    setFollowingStates(prev => ({
      ...prev,
      [username]: !prev[username]
    }));
  };

  return (
    <div className="p-6 max-w-[1000px] mx-auto flex flex-col gap-6">
      <div className="border-b border-gh-border pb-3">
        <h2 className="text-xl font-bold text-white tracking-tight">Following</h2>
        <p className="text-xs text-gh-muted mt-1">Keep track of developers and communities you are following.</p>
      </div>

      <Tabs defaultValue="developers" className="w-full">
        <TabsList className="bg-[#161b22] border border-gh-border p-0.5 rounded-md flex self-start gap-1 select-none">
          <TabsTrigger 
            value="developers"
            className="flex items-center gap-1.5 px-4 py-1.5 text-xs text-gh-muted data-[state=active]:bg-gh-surface2 data-[state=active]:text-white rounded-md font-medium cursor-pointer"
          >
            <Users className="w-3.5 h-3.5" />
            <span>Developers</span>
            <span className="bg-gh-surface2 px-1.5 py-0.5 rounded-full text-[10px] text-gh-text border border-gh-border">{mockDevelopers.length}</span>
          </TabsTrigger>
          <TabsTrigger 
            value="communities"
            className="flex items-center gap-1.5 px-4 py-1.5 text-xs text-gh-muted data-[state=active]:bg-gh-surface2 data-[state=active]:text-white rounded-md font-medium cursor-pointer"
          >
            <Award className="w-3.5 h-3.5" />
            <span>Communities</span>
            <span className="bg-gh-surface2 px-1.5 py-0.5 rounded-full text-[10px] text-gh-text border border-gh-border">{mockCommunities.length}</span>
          </TabsTrigger>
        </TabsList>

        <div className="mt-4">
          <TabsContent value="developers" className="flex flex-col gap-4">
            {mockDevelopers.map((dev) => (
              <div 
                key={dev.username}
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-gh-surface border border-gh-border rounded-md hover:border-gh-border/80 transition-colors"
              >
                <div className="flex gap-3 overflow-hidden">
                  <img 
                    src={dev.avatar}
                    alt={dev.displayName}
                    className="w-12 h-12 rounded-full border border-gh-border shrink-0 bg-gh-bg"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = `https://api.dicebear.com/7.x/initials/svg?seed=${dev.username}`;
                    }}
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
                      {dev.bio}
                    </p>

                    <div className="flex items-center gap-4 mt-2 text-[11px] text-gh-muted flex-wrap">
                      {dev.location && (
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 shrink-0" />
                          <span>{dev.location}</span>
                        </div>
                      )}
                      
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-white">Top languages:</span>
                        <div className="flex items-center gap-2">
                          {dev.topLanguages.map(lang => (
                            <LanguageDot key={lang} language={lang} color={getLanguageColor(lang)} />
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="text-[10px] text-purple-400 bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 rounded mt-2 self-start select-none font-medium">
                      {dev.recentActivity}
                    </div>
                  </div>
                </div>

                <button 
                  onClick={() => toggleFollow(dev.username)}
                  className={`shrink-0 text-xs px-3.5 py-1.5 rounded-md font-semibold transition-colors select-none cursor-pointer ${
                    followingStates[dev.username] 
                      ? 'bg-gh-surface2 border border-gh-border text-gh-text hover:bg-gh-surface' 
                      : 'bg-gh-blue hover:bg-blue-600 border border-transparent text-black'
                  }`}
                >
                  {followingStates[dev.username] ? 'Unfollow' : 'Follow'}
                </button>
              </div>
            ))}
          </TabsContent>

          <TabsContent value="communities" className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {mockCommunities.map((comm) => (
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
                    <span className="font-semibold text-white">{comm.members.toLocaleString()}</span> members
                  </div>
                  <div>
                    <span className="font-semibold text-white">{comm.repos}</span> repos
                  </div>
                </div>
              </div>
            ))}
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
