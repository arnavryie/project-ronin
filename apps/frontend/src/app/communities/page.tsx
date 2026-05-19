import React from 'react';
import Link from 'next/link';
import { Award } from 'lucide-react';

export default async function CommunitiesPage() {
  let communities = [];
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'}/communities`, { next: { revalidate: 60 } });
    if (res.ok) {
      communities = await res.json();
    }
  } catch (e) {
    console.error("Failed to fetch communities", e);
  }

  return (
    <div className="p-6 max-w-[1000px] mx-auto flex flex-col gap-6">
      <div className="border-b border-gh-border pb-4">
        <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          <Award className="w-5 h-5 text-gh-blue" />
          <span>Explore Communities</span>
        </h2>
        <p className="text-xs text-gh-muted mt-1">Connect with developers working in specialized technical domains. Real repos pulled from GitHub topics.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {communities.map((comm: any) => (
          <div
            key={comm.slug}
            className="p-5 bg-gh-surface border border-gh-border border-l-[3px] border-l-[var(--comm-color)] rounded-md hover:border-gh-blue transition-colors flex flex-col gap-4"
            style={{ '--comm-color': comm.color } as React.CSSProperties}
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
                className="gh-btn-secondary py-1.5 px-3 text-xs font-semibold shrink-0"
              >
                Enter
              </Link>
            </div>

            <p className="text-sm text-gh-muted leading-relaxed">
              {comm.description}
            </p>

            <div className="flex items-center gap-2 text-xs text-gh-muted pt-3 border-t border-gh-border/40 mt-auto justify-between">
              <div className="flex items-center gap-2">
                <span 
                  className="px-2 py-0.5 bg-gh-bg border border-gh-border rounded-full font-mono text-[var(--comm-color)]" 
                  style={{ '--comm-color': comm.color } as React.CSSProperties}
                >
                  #{comm.github_topic}
                </span>
                <span>GitHub topic</span>
              </div>
              <span className="font-semibold">{comm.member_count} members</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
