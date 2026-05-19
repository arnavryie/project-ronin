'use client';

import React from 'react';
import Link from 'next/link';
import { Award } from 'lucide-react';
import { mockCommunities } from '@/lib/mock-data';

export default function CommunitiesPage() {
  return (
    <div className="p-6 max-w-[1000px] mx-auto flex flex-col gap-6">
      <div className="border-b border-gh-border pb-4">
        <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          <Award className="w-5 h-5 text-gh-blue" />
          <span>Explore Communities</span>
        </h2>
        <p className="text-xs text-gh-muted mt-1">Connect with developers working in specialized technical domains.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {mockCommunities.map((comm) => (
          <div 
            key={comm.slug} 
            className="p-5 bg-gh-surface border border-gh-border rounded-md hover:border-gh-blue transition-colors flex flex-col gap-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="text-3xl p-2 rounded-md bg-gh-bg border border-gh-border select-none">{comm.icon}</span>
                <div className="flex flex-col leading-tight">
                  <Link 
                    href={`/communities/${comm.slug}`} 
                    className="text-base font-bold text-white hover:underline hover:text-gh-blue"
                  >
                    {comm.name}
                  </Link>
                  <span className="text-xs text-gh-muted mt-0.5">/c/{comm.slug}</span>
                </div>
              </div>
              
              <Link 
                href={`/communities/${comm.slug}`}
                className="gh-btn-secondary py-1.5 px-3 text-xs font-semibold"
              >
                Enter
              </Link>
            </div>

            <p className="text-sm text-gh-muted leading-relaxed">
              {comm.description}
            </p>

            <div className="flex items-center gap-5 text-xs text-gh-muted pt-3 border-t border-gh-border/40 mt-auto select-none">
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-white">{comm.members.toLocaleString()}</span> members
              </div>
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-white">{comm.repos}</span> repositories
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
