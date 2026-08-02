import React from 'react';
import Link from 'next/link';
import { searchRepos } from '@/lib/github-api';
import { formatNumber } from '@/lib/utils';
import LanguageDot from '@/components/shared/LanguageDot';
import { Search as SearchIcon } from 'lucide-react';

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const { q } = await searchParams;
  const query = q || "";

  let results: any[] = [];
  if (query) {
    try {
      results = await searchRepos(query);
    } catch (e) {
      results = [];
    }
  }

  return (
    <div className="p-6 max-w-[900px] mx-auto flex flex-col gap-6">
      <div className="border-b border-gh-border pb-4">
        <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          <SearchIcon className="w-5 h-5 text-gh-muted" />
          <span>Search results</span>
        </h2>
        {query && <p className="text-xs text-gh-muted mt-1">Showing repositories for &quot;{query}&quot;</p>}
      </div>

      {!query ? (
        <div className="text-center py-12 text-gh-muted text-sm">Type something in the search bar above.</div>
      ) : results.length === 0 ? (
        <div className="text-center py-12 border border-gh-border bg-gh-surface rounded-md text-gh-muted text-sm">
          No repositories found for &quot;{query}&quot;.
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {results.map((repo) => (
            <Link
              key={repo.id}
              href={`/repo/${repo.owner}/${repo.name}`}
              className="gh-card p-4 flex flex-col gap-2 hover:border-gh-blue transition-colors"
            >
              <div className="flex items-center gap-2">
                <img src={repo.avatarUrl} className="w-5 h-5 rounded" alt="" />
                <span className="text-gh-blue font-semibold text-sm">{repo.owner}/{repo.name}</span>
              </div>
              {repo.description && <p className="text-gh-muted text-sm">{repo.description}</p>}
              <div className="flex items-center gap-4 text-xs text-gh-muted">
                {repo.language !== "Unknown" && <LanguageDot language={repo.language} />}
                <span className="mono">★ {formatNumber(repo.stars)}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
