"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import TextareaAutosize from "react-textarea-autosize";
import { ChevronDown, Rocket, Check, MessageSquare, Repeat2, Heart, Bookmark } from "lucide-react";
import { supabase } from "../../lib/supabase";

// --- Types ---
type Repo = {
  id: number;
  name: string;
  full_name: string;
  description: string;
  stargazers_count: number;
  language: string;
};

type Post = {
  id: string;
  user_id: string;
  username: string;
  content: string;
  repo_full_name: string | null;
  created_at: string;
};

export function SocialFeed() {
  const [session, setSession] = useState<any>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [content, setContent] = useState("");
  const [repoFullName, setRepoFullName] = useState("");
  const [repos, setRepos] = useState<Repo[]>([]);
  const [filteredRepos, setFilteredRepos] = useState<Repo[]>([]);
  const [showRepoDropdown, setShowRepoDropdown] = useState(false);
  const [selectedRepo, setSelectedRepo] = useState<Repo | null>(null);
  const [loadingRepos, setLoadingRepos] = useState(false);
  const [isPosting, setIsPosting] = useState(false);

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        fetchPosts();
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user) {
        fetchPosts();
      } else {
        setPosts([]);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Set up real-time post subscriptions
  useEffect(() => {
    if (!session?.user) return;

    const channel = supabase
      .channel("realtime-posts")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "ronin_posts",
        },
        (payload) => {
          const newPost = payload.new as Post;
          setPosts((prev) => [newPost, ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [session]);

  // Fetch posts from Supabase database
  const fetchPosts = async () => {
    const { data, error } = await supabase
      .from("ronin_posts")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching posts:", error);
    } else {
      setPosts(data || []);
    }
  };

  // Fetch user's GitHub repositories when they search or focus
  const fetchGitHubRepos = async (token: string) => {
    if (repos.length > 0) return; // already loaded
    setLoadingRepos(true);
    try {
      const res = await fetch("https://api.github.com/user/repos?sort=updated&per_page=100", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        setRepos(data);
        setFilteredRepos(data.slice(0, 5));
      }
    } catch (err) {
      console.error("Error fetching user repos:", err);
    } finally {
      setLoadingRepos(false);
    }
  };

  // Handle repository selection search filtering
  const handleRepoSearch = (val: string) => {
    setRepoFullName(val);
    if (!val) {
      setFilteredRepos(repos.slice(0, 5));
      setSelectedRepo(null);
      return;
    }

    const filtered = repos.filter(
      (r) =>
        r.name.toLowerCase().includes(val.toLowerCase()) ||
        r.full_name.toLowerCase().includes(val.toLowerCase())
    );
    setFilteredRepos(filtered.slice(0, 5));

    // Exact match check for mockup fallback
    const exact = repos.find((r) => r.full_name.toLowerCase() === val.toLowerCase());
    if (exact) {
      setSelectedRepo(exact);
    } else if (val.split("/").length === 2) {
      // Mock lookup fallback
      setSelectedRepo({
        id: Math.random(),
        name: val.split("/")[1],
        full_name: val,
        description: "An open source repository attached via Project Ronin",
        stargazers_count: 1420,
        language: "TypeScript",
      });
    } else {
      setSelectedRepo(null);
    }
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || !session?.user) return;

    setIsPosting(true);
    const username = session.user.user_metadata.user_name 
      ? `@${session.user.user_metadata.user_name}`
      : session.user.email.split("@")[0];

    const { error } = await supabase.from("ronin_posts").insert([
      {
        user_id: session.user.id,
        username: username,
        content: content,
        repo_full_name: selectedRepo ? selectedRepo.full_name : null,
      },
    ]);

    if (error) {
      console.error("Error inserting post:", error);
    } else {
      setContent("");
      setSelectedRepo(null);
      setRepoFullName("");
      setShowRepoDropdown(false);
      fetchPosts(); // Fallback trigger if realtime delay occurs
    }
    setIsPosting(false);
  };

  if (!session) {
    return (
      <div className="text-center py-12 border border-gh-border bg-gh-surface rounded-md">
        <span className="text-gh-muted text-sm">Please sign in to view the social feed.</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Cinematic Input area */}
      <motion.form 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={handleCreatePost}
        className="bg-[#0d1117]/80 backdrop-blur-md border border-gh-border rounded-xl p-5 shadow-2xl flex flex-col gap-4 relative overflow-hidden"
      >
        {/* Subtle top gradient */}
        <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-purple-500/30 to-transparent" />

        <div className="flex gap-4 items-start">
          <img 
            src={session.user.user_metadata.avatar_url} 
            alt="avatar" 
            className="w-10 h-10 rounded-full border border-white/10 mt-1"
          />
          <div className="flex-1">
            <TextareaAutosize
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Share a repo, insight, or what you're building..."
              className="w-full bg-transparent border-0 outline-none text-white placeholder-neutral-500 text-base resize-none focus:ring-0"
              minRows={2}
            />
          </div>
        </div>

        {/* Repo Selector input */}
        <div className="relative border-t border-gh-border pt-3">
          <div className="flex items-center gap-2 text-sm text-neutral-400">
            <span className="text-xs">Attach repository:</span>
            <input
              type="text"
              value={repoFullName}
              onChange={(e) => handleRepoSearch(e.target.value)}
              onFocus={() => {
                setShowRepoDropdown(true);
                if (session?.provider_token) fetchGitHubRepos(session.provider_token);
              }}
              placeholder="owner/repo-name"
              className="flex-1 bg-transparent border-0 outline-none focus:ring-0 text-white placeholder-neutral-600 text-sm font-mono"
            />
          </div>

          {/* Dropdown suggestions */}
          <AnimatePresence>
            {showRepoDropdown && filteredRepos.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 5 }}
                className="absolute left-0 right-0 mt-2 bg-[#161b22] border border-gh-border rounded-lg shadow-2xl z-50 overflow-hidden divide-y divide-gh-border"
              >
                {filteredRepos.map((repo) => (
                  <div
                    key={repo.id}
                    onClick={() => {
                      setSelectedRepo(repo);
                      setRepoFullName(repo.full_name);
                      setShowRepoDropdown(false);
                    }}
                    className="px-4 py-2.5 hover:bg-neutral-800 cursor-pointer flex justify-between items-center transition-colors"
                  >
                    <div>
                      <div className="text-sm font-semibold text-white">{repo.full_name}</div>
                      {repo.description && (
                        <div className="text-xs text-neutral-400 line-clamp-1 mt-0.5">{repo.description}</div>
                      )}
                    </div>
                    {selectedRepo?.full_name === repo.full_name && (
                      <Check className="w-4 h-4 text-purple-400" />
                    )}
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Repo Preview Card */}
        <AnimatePresence>
          {selectedRepo && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#161b22]/50 border border-white/10 rounded-lg p-4 flex flex-col gap-2 relative overflow-hidden group hover:border-purple-500/30 transition-colors"
            >
              <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/5 via-transparent to-transparent pointer-events-none" />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-sm font-bold text-white">
                  <span>📦</span>
                  <span>{selectedRepo.full_name}</span>
                </div>
                <span className="text-xs text-neutral-500 font-mono flex items-center gap-1">
                  ★ {selectedRepo.stargazers_count}
                </span>
              </div>
              {selectedRepo.description && (
                <p className="text-xs text-neutral-400">{selectedRepo.description}</p>
              )}
              {selectedRepo.language && (
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                  <span className="text-xs text-neutral-400 font-mono">{selectedRepo.language}</span>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action Buttons */}
        <div className="flex justify-between items-center mt-2">
          <button
            type="button"
            onClick={() => setShowRepoDropdown(!showRepoDropdown)}
            className="text-xs text-neutral-400 hover:text-white transition-colors flex items-center gap-1"
          >
            Browse repos <ChevronDown className="w-3 h-3" />
          </button>
          <button
            type="submit"
            disabled={isPosting || !content.trim()}
            className="bg-white text-black font-semibold text-sm px-4 py-2 rounded-md hover:bg-neutral-200 transition-all flex items-center gap-1.5 disabled:opacity-50 disabled:hover:bg-white"
          >
            <Rocket className="w-4 h-4" />
            {isPosting ? "Posting..." : "Post"}
          </button>
        </div>
      </motion.form>

      {/* Cinematic Real-time Feed */}
      <div className="flex flex-col gap-4">
        <AnimatePresence initial={false}>
          {posts.map((post) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: -30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ type: "spring", stiffness: 100, damping: 15 }}
              className="bg-[#0d1117]/60 border border-gh-border rounded-xl p-5 hover:border-white/10 transition-all relative overflow-hidden group shadow-lg"
            >
              {/* Subtle left border glow */}
              <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-purple-500/0 group-hover:bg-purple-500/40 transition-colors" />

              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-neutral-800 border border-white/10 flex items-center justify-center text-sm font-bold text-white uppercase select-none">
                  {post.username.charAt(1)}
                </div>

                <div className="flex-1 flex flex-col gap-2">
                  {/* Post Header */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-white hover:underline cursor-pointer">
                      {post.username}
                    </span>
                    <span className="text-xs text-neutral-500 font-mono">
                      {new Date(post.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
                    </span>
                  </div>

                  {/* Post Content */}
                  <p className="text-sm text-neutral-300 leading-relaxed break-words whitespace-pre-wrap">
                    {post.content}
                  </p>

                  {/* Linked Repository Preview */}
                  {post.repo_full_name && (
                    <div className="bg-[#161b22]/30 border border-gh-border rounded-lg p-3.5 mt-2 flex items-center justify-between hover:border-purple-500/20 transition-all cursor-pointer">
                      <div className="flex items-center gap-2 text-xs font-bold text-purple-300">
                        <span>📦</span>
                        <span>{post.repo_full_name}</span>
                      </div>
                      <span className="text-[10px] text-neutral-600 font-mono">Synced</span>
                    </div>
                  )}

                  {/* Interactive Icons */}
                  <div className="flex items-center gap-6 mt-3 text-neutral-500">
                    <button className="hover:text-purple-400 transition-colors">
                      <MessageSquare className="w-4 h-4" />
                    </button>
                    <button className="hover:text-purple-400 transition-colors">
                      <Repeat2 className="w-4 h-4" />
                    </button>
                    <button className="hover:text-purple-400 transition-colors">
                      <Heart className="w-4 h-4" />
                    </button>
                    <button className="hover:text-purple-400 transition-colors">
                      <Bookmark className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {posts.length === 0 && (
          <div className="text-center py-20 text-neutral-500 flex flex-col items-center gap-3">
            <span className="text-2xl">⚡</span>
            <p className="text-sm">The timeline is empty. Be the first to share an update!</p>
          </div>
        )}
      </div>
    </div>
  );
}
