"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import TextareaAutosize from "react-textarea-autosize";
import { 
  MessageSquare, 
  Repeat2, 
  Heart, 
  Bookmark, 
  Star, 
  Code2
} from "lucide-react";

// --- Mock Data ---
const MOCK_POSTS = [
  {
    id: "1",
    user: {
      name: "Alex Developer",
      handle: "@alexdev",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex",
    },
    timestamp: "2h ago",
    content: "Just open-sourced my new React animation library! It uses springs under the hood for incredibly fluid interactions. Check out the repo below 👇",
    repo: {
      owner: "alexdev",
      name: "spring-react",
      description: "A fluid, spring-based animation library for React applications.",
      stars: 1240,
      language: "TypeScript",
    },
    stats: { replies: 12, reposts: 5, likes: 342, bookmarks: 89 },
  },
  {
    id: "2",
    user: {
      name: "Sarah Hacker",
      handle: "@sarah_codes",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
    },
    timestamp: "4h ago",
    content: "Hot take: **TailwindCSS** + **Framer Motion** is the ultimate combo for building cinematic web experiences. You don't need anything else.",
    stats: { replies: 45, reposts: 12, likes: 890, bookmarks: 120 },
  },
  {
    id: "3",
    user: {
      name: "John Backend",
      handle: "@jbackend",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=John",
    },
    timestamp: "6h ago",
    content: "I've been playing around with Rust lately. The memory safety guarantees are incredible, but the borrow checker is definitely testing my patience today. 🦀\n\n```rust\nfn main() {\n    println!(\"Hello, borrow checker!\");\n}\n```",
    stats: { replies: 8, reposts: 2, likes: 156, bookmarks: 12 },
  },
];

// --- Subcomponents ---

const RepoPreview = ({ repo }: { repo: any }) => {
  if (!repo) return null;
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10, scale: 0.95 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className="mt-3 p-4 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition-colors backdrop-blur-md"
    >
      <div className="flex items-center gap-2 mb-2">
        <Bookmark className="w-4 h-4 text-gray-400" />
        <span className="font-semibold text-blue-400 text-sm">
          {repo.owner}/{repo.name}
        </span>
      </div>
      <p className="text-gray-300 text-sm mb-3">{repo.description}</p>
      <div className="flex items-center gap-4 text-xs text-gray-400">
        <span className="flex items-center gap-1">
          <Star className="w-3.5 h-3.5" /> {repo.stars}
        </span>
        <span className="flex items-center gap-1">
          <Code2 className="w-3.5 h-3.5" /> {repo.language}
        </span>
      </div>
    </motion.div>
  );
};

const PostComposer = ({ onPost }: { onPost: (post: any) => void }) => {
  const [content, setContent] = useState("");
  const [repoInput, setRepoInput] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  // Mock repo detection
  const showRepoPreview = repoInput.toLowerCase() === "facebook/react";
  const mockRepoData = showRepoPreview ? {
    owner: "facebook",
    name: "react",
    description: "A declarative, efficient, and flexible JavaScript library for building user interfaces.",
    stars: 212000,
    language: "JavaScript"
  } : null;

  const handlePost = () => {
    if (!content.trim()) return;
    
    const newPost = {
      id: Date.now().toString(),
      user: {
        name: "Current User",
        handle: "@you",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=You",
      },
      timestamp: "Just now",
      content: content,
      repo: mockRepoData,
      stats: { replies: 0, reposts: 0, likes: 0, bookmarks: 0 },
    };
    
    onPost(newPost);
    setContent("");
    setRepoInput("");
  };

  return (
    <div 
      className={`p-5 rounded-2xl bg-[#0d1117] border transition-all duration-500 relative overflow-hidden ${
        isFocused ? "border-[#58a6ff]/50 shadow-[0_0_30px_rgba(88,166,255,0.15)]" : "border-white/10 hover:border-white/20"
      }`}
    >
      <div className="flex gap-4 relative z-10">
        <img 
          src="https://api.dicebear.com/7.x/avataaars/svg?seed=You" 
          alt="Avatar" 
          className="w-12 h-12 rounded-full border border-white/10 bg-white/5"
        />
        <div className="flex-1">
          <TextareaAutosize
            minRows={2}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder="Share a repo, insight, or what you're building..."
            className="w-full bg-transparent text-gray-100 placeholder-gray-500 text-lg resize-none outline-none leading-relaxed"
          />
          
          <div className="mt-2 border-t border-white/5 pt-4">
            <input
              type="text"
              value={repoInput}
              onChange={(e) => setRepoInput(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder="Attach repo: owner/repo-name (e.g. facebook/react)"
              className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-[#58a6ff] placeholder-gray-600 outline-none focus:border-[#58a6ff]/50 transition-colors font-mono focus:shadow-[0_0_15px_rgba(88,166,255,0.1)]"
            />
            <AnimatePresence>
              {showRepoPreview && (
                <RepoPreview repo={mockRepoData} />
              )}
            </AnimatePresence>
          </div>

          <div className="flex justify-between items-center mt-4">
            <div className="text-xs text-gray-500">Markdown supported</div>
            <button
              onClick={handlePost}
              disabled={!content.trim()}
              className="px-6 py-2 rounded-full bg-[#238636] hover:bg-[#2ea043] text-white font-medium text-sm transition-all shadow-[0_0_15px_rgba(35,134,54,0.4)] hover:shadow-[0_0_25px_rgba(35,134,54,0.6)] disabled:opacity-50 disabled:shadow-none"
            >
              Post
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const InteractionButton = ({ icon: Icon, count, colorClass, activeClass }: any) => {
  const [active, setActive] = useState(false);
  const [currentCount, setCurrentCount] = useState(count);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActive(!active);
    setCurrentCount((prev: number) => active ? prev - 1 : prev + 1);
  };

  return (
    <motion.button
      whileTap={{ scale: 0.85 }}
      onClick={handleClick}
      className={`flex items-center gap-2 group transition-colors ${active ? activeClass : "text-gray-500 hover:" + colorClass}`}
    >
      <div className={`p-2 rounded-full transition-colors group-hover:bg-white/5 ${active ? "bg-white/5" : ""}`}>
        <Icon className={`w-4 h-4 transition-colors ${active ? "fill-current" : ""}`} />
      </div>
      <span className="text-xs font-medium">{currentCount > 0 ? currentCount : ""}</span>
    </motion.button>
  );
};

const Post = ({ post }: { post: any }) => {
  // Simple mock markdown parsing for bold and code blocks
  const parseContent = (text: string) => {
    let html = text
      .replace(/\*\*(.*?)\*\*/g, '<strong class="text-white font-bold">$1</strong>')
      .replace(/```([a-z]*)\n([\s\S]*?)```/g, '<pre class="bg-[#010409] border border-white/10 p-3 rounded-lg my-2 overflow-x-auto text-sm font-mono text-gray-300 shadow-inner"><code>$2</code></pre>')
      .replace(/\n/g, '<br/>');
    return <div dangerouslySetInnerHTML={{ __html: html }} className="text-gray-300 leading-relaxed text-sm whitespace-pre-wrap" />;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      layout
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      className="p-5 rounded-2xl bg-[#0d1117] border border-white/5 hover:border-white/10 hover:bg-[#161b22] transition-colors cursor-pointer group"
    >
      <div className="flex gap-4">
        <img 
          src={post.user.avatar} 
          alt={post.user.name} 
          className="w-10 h-10 rounded-full border border-white/10"
        />
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="font-semibold text-gray-100">{post.user.name}</span>
            <span className="text-gray-500 text-sm">{post.user.handle}</span>
            <span className="text-gray-600 text-sm">·</span>
            <span className="text-gray-500 text-sm hover:underline">{post.timestamp}</span>
          </div>
          
          <div className="mb-3">
            {parseContent(post.content)}
          </div>

          {post.repo && (
            <div className="mb-3">
              <RepoPreview repo={post.repo} />
            </div>
          )}

          <div className="flex justify-between items-center mt-4 pr-10">
            <InteractionButton 
              icon={MessageSquare} 
              count={post.stats.replies} 
              colorClass="text-[#58a6ff]"
              activeClass="text-[#58a6ff]"
            />
            <InteractionButton 
              icon={Repeat2} 
              count={post.stats.reposts} 
              colorClass="text-[#238636]"
              activeClass="text-[#238636]"
            />
            <InteractionButton 
              icon={Heart} 
              count={post.stats.likes} 
              colorClass="text-pink-500"
              activeClass="text-pink-500"
            />
            <InteractionButton 
              icon={Bookmark} 
              count={post.stats.bookmarks} 
              colorClass="text-[#58a6ff]"
              activeClass="text-[#58a6ff]"
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default function CinematicFeed() {
  const [posts, setPosts] = useState(MOCK_POSTS);

  const handleNewPost = (newPost: any) => {
    setPosts([newPost, ...posts]);
  };

  return (
    <div className="min-h-screen bg-[#010409] text-white p-4 md:p-8 font-sans selection:bg-[#58a6ff]/30">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-gray-100">
            For You
          </h1>
          <button className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-sm text-gray-300">
            <Star className="w-4 h-4" />
            Trending
          </button>
        </div>

        {/* Composer */}
        <PostComposer onPost={handleNewPost} />

        {/* Feed */}
        <div className="space-y-4 pt-4 relative">
          <AnimatePresence initial={false}>
            {posts.map((post) => (
              <Post key={post.id} post={post} />
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
