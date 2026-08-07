"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import TextareaAutosize from "react-textarea-autosize";
import { ChevronDown, Rocket, LogOut, Check, Search, MessageSquare, Repeat2, Heart, Bookmark, Code2 } from "lucide-react";
import { supabase } from "../../lib/supabase";

// --- Types ---
type Repo = {
  id: number;
  full_name: string;
  name: string;
  description: string | null;
  stargazers_count: number;
  language: string | null;
};

type Post = {
  id: string;
  user_id: string;
  username: string;
  content: string;
  repo_full_name: string | null;
  created_at: string;
};

export default function SupabaseFeed() {
  const [session, setSession] = useState<any>(null);
  const [providerToken, setProviderToken] = useState<string | null>(null);
  const [repos, setRepos] = useState<Repo[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  
  // Parallax Setup
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 1000], [0, 200]);
  const y2 = useTransform(scrollY, [0, 1000], [0, -200]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.provider_token) setProviderToken(session.provider_token);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.provider_token) {
        setProviderToken(session.provider_token);
      }
    });

    fetchPosts();

    // Subscribe to new posts
    const channel = supabase
      .channel("public:ronin_posts")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "ronin_posts" }, (payload) => {
        setPosts((current) => [payload.new as Post, ...current]);
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    if (providerToken && session) {
      // Fetch repos using GitHub token
      fetch("https://api.github.com/user/repos?sort=updated&per_page=20", {
        headers: {
          Authorization: `Bearer ${providerToken}`,
          Accept: "application/vnd.github.v3+json",
        },
      })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setRepos(data);
        }
      })
      .catch(console.error);
    }
  }, [providerToken, session]);

  const fetchPosts = async () => {
    const { data, error } = await supabase
      .from("ronin_posts")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);
      
    if (data) setPosts(data);
  };

  const handleGitHubLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "github",
      options: {
        scopes: "repo",
      },
    });
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setProviderToken(null);
  };

  if (!session) {
    return (
      <div className="min-h-screen bg-[#020202] text-white flex items-center justify-center font-sans relative overflow-hidden">
        {/* Animated Background Orbs */}
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none" 
        />
        <motion.div 
          animate={{ scale: [1, 1.5, 1], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 12, repeat: Infinity }}
          className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[150px] pointer-events-none" 
        />
        
        <div className="z-10 text-center max-w-md w-full p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl shadow-2xl">
          <h1 className="text-4xl font-extrabold mb-3 tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-white via-gray-200 to-gray-500">
            Project Ronin
          </h1>
          <p className="text-gray-400 mb-8 text-sm">The cinematic social layer for developers.</p>
          <button 
            onClick={handleGitHubLogin}
            className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-xl bg-[#0d1117] hover:bg-[#161b22] border border-white/10 hover:border-white/20 transition-all text-white font-medium shadow-[0_0_20px_rgba(255,255,255,0.05)] hover:shadow-[0_0_30px_rgba(255,255,255,0.1)] group"
          >
            <svg className="w-5 h-5 group-hover:scale-110 transition-transform fill-current" viewBox="0 0 24 24" aria-hidden="true"><path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"></path></svg>
            Connect with GitHub
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-indigo-500/30">
      {/* Background Elements */}
      <motion.div style={{ y: y1 }} className="fixed top-0 left-0 w-full h-[500px] bg-gradient-to-b from-indigo-900/10 to-transparent pointer-events-none" />
      <motion.div style={{ y: y2 }} className="fixed bottom-0 right-0 w-[800px] h-[800px] bg-purple-900/5 blur-[200px] rounded-full pointer-events-none" />

      {/* Top Navbar */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-[#050505]/70 backdrop-blur-xl">
        <div className="max-w-3xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="font-bold text-lg tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">
            Ronin Feed
          </div>
          <div className="flex items-center gap-4">
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-500" />
              </div>
              <input 
                type="text" 
                placeholder="Search feeds..." 
                className="bg-white/5 border border-white/10 rounded-full py-1.5 pl-9 pr-4 text-sm outline-none focus:bg-white/10 focus:border-indigo-500/50 transition-all w-64 placeholder-gray-500"
              />
            </div>
            <div className="flex items-center gap-3">
              <img src={session.user.user_metadata.avatar_url} alt="Avatar" className="w-8 h-8 rounded-full border border-white/10" />
              <button onClick={handleSignOut} className="p-2 rounded-full hover:bg-white/10 transition-colors text-gray-400 hover:text-white">
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-2xl mx-auto pt-24 pb-12 px-4 relative z-10">
        <Composer session={session} repos={repos} />
        
        <div className="mt-12 space-y-6">
          <AnimatePresence initial={false}>
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </AnimatePresence>
          {posts.length === 0 && (
            <div className="text-center text-gray-500 py-12">No posts yet. Be the first!</div>
          )}
        </div>
      </main>
    </div>
  );
}

// --- Composer Subcomponent ---
function Composer({ session, repos }: { session: any, repos: Repo[] }) {
  const [content, setContent] = useState("");
  const [selectedRepo, setSelectedRepo] = useState<string | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!content.trim()) return;
    setIsSubmitting(true);

    const { error } = await supabase.from("ronin_posts").insert({
      user_id: session.user.id,
      username: `@${session.user.user_metadata.preferred_username || session.user.user_metadata.name.replace(/\s+/g, '').toLowerCase()}`,
      content: content,
      repo_full_name: selectedRepo,
    });

    setIsSubmitting(false);
    if (!error) {
      setContent("");
      setSelectedRepo(null);
    } else {
      alert("Failed to post: " + error.message);
    }
  };

  return (
    <motion.div 
      className={`relative p-5 rounded-3xl bg-black/40 border transition-all duration-700 backdrop-blur-md ${
        isFocused ? "border-indigo-500/40 shadow-[0_0_40px_rgba(99,102,241,0.15)] bg-black/60" : "border-white/5 hover:border-white/10"
      }`}
    >
      <div className="flex gap-4">
        <img 
          src={session.user.user_metadata.avatar_url} 
          alt="Avatar" 
          className="w-12 h-12 rounded-full border border-white/10"
        />
        <div className="flex-1">
          <TextareaAutosize
            minRows={2}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder="What paradigm are you shifting today?"
            className="w-full bg-transparent text-gray-100 placeholder-gray-600 text-lg resize-none outline-none leading-relaxed"
          />
          
          <div className="mt-4 flex flex-col gap-3">
            {/* Repo Selector */}
            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center justify-between w-full md:w-auto px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-sm text-gray-300 transition-colors"
              >
                <span>{selectedRepo ? selectedRepo : "Attach a repository"}</span>
                <ChevronDown className={`w-4 h-4 ml-2 transition-transform duration-300 ${isDropdownOpen ? "rotate-180" : ""}`} />
              </button>

              <AnimatePresence>
                {isDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute top-full left-0 mt-2 w-full md:w-80 bg-[#0f0f13] border border-white/10 rounded-xl overflow-hidden z-20 shadow-2xl backdrop-blur-xl"
                  >
                    <div className="max-h-64 overflow-y-auto custom-scrollbar">
                      <button
                        onClick={() => { setSelectedRepo(null); setIsDropdownOpen(false); }}
                        className="w-full text-left px-4 py-3 text-sm text-gray-400 hover:bg-white/5 hover:text-white transition-colors border-b border-white/5 flex items-center justify-between"
                      >
                        No repo
                        {!selectedRepo && <Check className="w-4 h-4 text-indigo-400" />}
                      </button>
                      {repos.length === 0 ? (
                        <div className="px-4 py-3 text-sm text-gray-500">No repos found (or token missing).</div>
                      ) : (
                        repos.map(repo => (
                          <button
                            key={repo.id}
                            onClick={() => { setSelectedRepo(repo.full_name); setIsDropdownOpen(false); }}
                            className="w-full text-left px-4 py-3 hover:bg-white/5 transition-colors flex items-center justify-between group"
                          >
                            <div>
                              <div className="text-sm text-gray-200 font-medium group-hover:text-indigo-300 transition-colors">{repo.name}</div>
                              <div className="text-xs text-gray-500 truncate max-w-[200px]">{repo.description || "No description"}</div>
                            </div>
                            {selectedRepo === repo.full_name && <Check className="w-4 h-4 text-indigo-400" />}
                          </button>
                        ))
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="flex justify-end pt-2 border-t border-white/5">
              <button
                onClick={handleSubmit}
                disabled={!content.trim() || isSubmitting}
                className="relative overflow-hidden group px-6 py-2 rounded-full bg-indigo-600 disabled:bg-gray-800 disabled:text-gray-500 text-white font-medium text-sm transition-all shadow-[0_0_15px_rgba(79,70,229,0.3)] hover:shadow-[0_0_25px_rgba(79,70,229,0.5)] disabled:shadow-none"
              >
                <span className="relative z-10 flex items-center gap-2">
                  {isSubmitting ? "Transmitting..." : "Post"} 
                  {!isSubmitting && <Rocket className="w-4 h-4 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform" />}
                </span>
                {/* Button Glare Effect */}
                <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent z-0" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// --- Post Card Subcomponent ---
const PostCard = ({ post }: { post: Post }) => {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -40, filter: "blur(10px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      exit={{ opacity: 0, scale: 0.9, filter: "blur(10px)" }}
      transition={{ type: "spring", stiffness: 300, damping: 25, mass: 0.8 }}
      className="p-5 rounded-3xl bg-[#0a0a0d] border border-white/5 hover:border-white/10 hover:bg-[#0c0c10] transition-colors group"
    >
      <div className="flex items-start gap-4">
        {/* Placeholder avatar based on username */}
        <img 
          src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${post.username}`} 
          alt={post.username} 
          className="w-12 h-12 rounded-full border border-white/10 bg-white/5"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span className="font-bold text-gray-100 truncate">{post.username}</span>
            <span className="text-gray-600 text-xs">{new Date(post.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
          
          <p className="text-gray-300 text-[15px] leading-relaxed whitespace-pre-wrap mb-4">
            {post.content}
          </p>

          {post.repo_full_name && (
            <div className="mb-4 inline-block p-3 rounded-xl bg-gradient-to-br from-indigo-900/20 to-purple-900/10 border border-indigo-500/20 hover:border-indigo-500/40 transition-colors">
              <div className="flex items-center gap-2">
                <Bookmark className="w-4 h-4 text-indigo-400" />
                <span className="text-sm font-mono text-indigo-300">{post.repo_full_name}</span>
              </div>
            </div>
          )}

          <div className="flex items-center gap-8 text-gray-500 mt-2">
             <button className="flex items-center gap-2 hover:text-blue-400 transition-colors group/btn">
               <div className="p-1.5 rounded-full group-hover/btn:bg-blue-400/10 transition-colors">
                 <MessageSquare className="w-4 h-4" />
               </div>
             </button>
             <button className="flex items-center gap-2 hover:text-green-400 transition-colors group/btn">
               <div className="p-1.5 rounded-full group-hover/btn:bg-green-400/10 transition-colors">
                 <Repeat2 className="w-4 h-4" />
               </div>
             </button>
             <button className="flex items-center gap-2 hover:text-pink-500 transition-colors group/btn">
               <div className="p-1.5 rounded-full group-hover/btn:bg-pink-500/10 transition-colors">
                 <Heart className="w-4 h-4" />
               </div>
             </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
