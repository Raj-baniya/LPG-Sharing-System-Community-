import { useEffect, useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Users,
  MapPin,
  MessageSquare,
  ThumbsUp,
  Plus,
  Search,
  Activity,
  Loader2,
  Clock,
  Flame,
  Layers3,
  BadgeCheck,
  MessageCircle,
  IndianRupee,
  ShoppingBag,
  CheckCircle,
  ShieldCheck,
  ArrowLeft
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { communityApi } from "@/lib/communityApi";
import { getStoredUser, getToken } from "@/lib/trustAuth";

type CommunityPost = {
  id: string;
  title: string;
  content: string;
  post_type: string;
  location?: string;
  urgency?: string;
  helpfulCount: number;
  commentCount: number;
  createdAt: string;
  imageUrl?: string | null;
  author: {
    id: string;
    name: string;
    role?: string;
    verified?: boolean;
  };
  inventory?: {
    productName?: string;
    price?: number;
    transactionStatus?: "available" | "sold";
    buyerId?: string | null;
  };
};

export default function Community() {
  const navigate = useNavigate();
  const user = getStoredUser();
  const role = String(user?.role || "").toLowerCase();
  const isProviderRole = ["provider", "verified_reseller", "mechanic"].includes(role);
  const isAdminRole = role === "admin";
  
  // Route context configuration
  const communityBasePath = isProviderRole 
    ? "/provider/community" 
    : isAdminRole 
      ? "/admin/community" 
      : "/community";

  const [searchQuery, setSearchQuery] = useState("");
  const [activeTypeFilter, setActiveTypeFilter] = useState<"all" | "emergency" | "sell" | "update">("all");
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [postError, setPostError] = useState("");
  const [expandedCommentPostId, setExpandedCommentPostId] = useState<string | null>(null);
  const [commentDrafts, setCommentDrafts] = useState<Record<string, string>>({});
  
  // State managers for active click activities
  const [likingPostId, setLikingPostId] = useState<string | null>(null);
  const [commentingPostId, setCommentingPostId] = useState<string | null>(null);

  // UPI Mock Payment Modal Drawer States
  const [payingPost, setPayingPost] = useState<CommunityPost | null>(null);
  const [upiId, setUpiId] = useState("");
  const [paymentStep, setPaymentStep] = useState<"idle" | "processing" | "success">("idle");
  const [paymentError, setPaymentError] = useState("");

  const fetchPosts = async () => {
    try {
      const response = await communityApi.listPosts();
      const postList = Array.isArray(response?.posts) ? response.posts : [];
      
      // Clean mapping and normalizing to support database schema variants
      const normalized = postList.map((post: any) => ({
        id: post.id,
        title: post.title,
        content: post.content,
        post_type: post.post_type || post.type || "update",
        location: post.location || "",
        urgency: post.urgency || "medium",
        helpfulCount: Number(post.helpfulCount ?? post.helpful_count ?? 0),
        commentCount: Number(post.commentCount ?? post.comment_count ?? 0),
        createdAt: post.createdAt || post.created_at || new Date().toISOString(),
        imageUrl: post.imageUrl || post.inventory?.imageUrl || null,
        author: {
          id: post.author?.id || post.author_id || "",
          name: post.author?.name || "Anonymous Member",
          role: post.author?.role || "consumer",
          verified: Boolean(post.author?.verified),
        },
        inventory: post.inventory || {},
      }));

      setPosts(normalized);
    } catch (error) {
      setPostError(error instanceof Error ? error.message : "Failed to fetch posts");
    } finally {
      setLoadingPosts(false);
    }
  };

  useEffect(() => {
    fetchPosts();
    const interval = setInterval(fetchPosts, 8000);
    return () => clearInterval(interval);
  }, []);

  const sortedPosts = useMemo(
    () => [...posts].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [posts]
  );

  const filteredPosts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return sortedPosts.filter((post) => {
      const matchesType = activeTypeFilter === "all" || post.post_type.toLowerCase() === activeTypeFilter;
      if (!query) {
        return matchesType;
      }

      const matchesQuery =
        post.title.toLowerCase().includes(query) ||
        post.content.toLowerCase().includes(query) ||
        post.location?.toLowerCase().includes(query) ||
        post.inventory?.productName?.toLowerCase().includes(query) ||
        post.post_type.toLowerCase().includes(query);

      return matchesType && matchesQuery;
    });
  }, [sortedPosts, searchQuery, activeTypeFilter]);

  const insightStats = useMemo(() => {
    const totalLikes = posts.reduce((sum, post) => sum + Number(post.helpfulCount || 0), 0);
    const totalComments = posts.reduce((sum, post) => sum + Number(post.commentCount || 0), 0);
    const emergencyCount = posts.filter((post) => post.post_type.toLowerCase() === "emergency").length;
    const resourcesCount = posts.filter((post) => post.post_type.toLowerCase() === "sell").length;
    return {
      totalPosts: posts.length,
      totalLikes,
      totalComments,
      emergencyCount,
      resourcesCount,
    };
  }, [posts]);

  const getPostTypeColor = (type: string) => {
    switch (type?.toLowerCase()) {
      case "emergency":
        return "text-red-400 bg-red-500/10 border border-red-500/20";
      case "sell":
        return "text-emerald-400 bg-emerald-500/10 border border-emerald-500/20";
      case "update":
      case "info":
        return "text-cyan-400 bg-cyan-500/10 border border-cyan-500/20";
      default:
        return "text-white/60 bg-white/5 border border-white/10";
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

      if (diffInSeconds < 60) return "Just now";
      if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
      if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
      if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;

      return date.toLocaleDateString();
    } catch {
      return "Recently";
    }
  };

  const handleCreatePost = () => {
    if (!getToken()) {
      navigate("/login");
      return;
    }
    navigate(`${communityBasePath}/create`);
  };

  const handleLikePost = async (postId: string) => {
    if (!getToken()) {
      navigate("/login");
      return;
    }

    setLikingPostId(postId);
    try {
      const response = await communityApi.likePost(postId);
      const nextHelpfulCount = Number(response?.helpfulCount ?? response?.helpful_count ?? 0);
      setPosts((current) =>
        current.map((post) =>
          post.id === postId
            ? {
                ...post,
                helpfulCount: nextHelpfulCount || post.helpfulCount + 1,
              }
            : post
        )
      );
    } catch (error) {
      console.error("Failed to like post", error);
    } finally {
      setLikingPostId(null);
    }
  };

  const handleCommentSubmit = async (postId: string) => {
    if (!getToken()) {
      navigate("/login");
      return;
    }

    const content = (commentDrafts[postId] || "").trim();
    if (!content) {
      return;
    }

    setCommentingPostId(postId);
    try {
      await communityApi.addComment(postId, { content });
      setCommentDrafts((current) => ({ ...current, [postId]: "" }));
      setPosts((current) =>
        current.map((post) =>
          post.id === postId
            ? {
                ...post,
                commentCount: post.commentCount + 1,
              }
            : post
        )
      );
      setExpandedCommentPostId(null);
      fetchPosts(); // Reload for comments tree
    } catch (error) {
      console.error("Failed to submit comment", error);
    } finally {
      setCommentingPostId(null);
    }
  };

  // UPI Secure mock payments execution trigger
  const executeMockPayment = async () => {
    if (!payingPost) return;
    if (!upiId.trim().includes("@")) {
      setPaymentError("Please enter a valid UPI address (e.g., name@okaxis)");
      return;
    }

    setPaymentError("");
    setPaymentStep("processing");

    try {
      // Dispatch buy transaction call
      const res = await communityApi.buyPost(payingPost.id);
      
      if (res?.success) {
        // Success animation trigger
        setTimeout(() => {
          setPaymentStep("success");
          fetchPosts(); // Instant live update state
        }, 2200);
      } else {
        throw new Error(res?.message || "Transaction failed");
      }
    } catch (err) {
      setPaymentStep("idle");
      setPaymentError(err instanceof Error ? err.message : "Secure payment gateway failed");
    }
  };

  const handleMessageAuthor = (authorId?: string) => {
    if (!authorId) return;
    if (!getToken()) {
      navigate("/login");
      return;
    }
    navigate(`/chat/${authorId}`);
  };

  return (
    <div className="theme-page-shell min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] selection:bg-[var(--text-primary)] selection:text-[var(--bg-primary)] font-poppins">
      <Navbar />

      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-emerald-500/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-500/5 blur-[120px] rounded-full" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(18,18,18,0.2)_1px,transparent_1px),linear-gradient(90deg,rgba(18,18,18,0.2)_1px,transparent_1px)] bg-[size:60px_60px] opacity-10" />
      </div>

      <main className="relative z-10 max-w-5xl mx-auto px-6 pt-32 pb-32">
        
        {/* Workspace dynamic back navigations */}
        <div className="mb-6 flex justify-between items-center">
          <Link
            to={isProviderRole ? "/provider/home" : isAdminRole ? "/admin/dashboard" : "/consumer"}
            className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-neutral-400 hover:text-white transition"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </Link>
        </div>

        <section className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-4 h-4 text-emerald-500" />
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-500">Resource Sharing Board</span>
          </div>
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div>
              <h1 className="text-4xl md:text-5xl font-black tracking-tighter italic uppercase leading-none mb-3">
                Community <br /> <span className="text-transparent border-text">Marketplace</span>
              </h1>
              <p className="text-neutral-400 max-w-xl">
                Social help board. Buy or acquire cylinders, swap resource units, share safety compliance alerts, or ask for local help securely.
              </p>
            </div>
            <button
              onClick={handleCreatePost}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 border border-emerald-500/30 text-emerald-200 font-black uppercase text-xs tracking-widest hover:from-emerald-500/35 hover:to-cyan-500/35 transition-all shadow-[0_12px_30px_rgba(16,185,129,0.18)]"
            >
              <Plus className="w-4 h-4" /> Create Listing
            </button>
          </div>
        </section>

        {/* Dashboard Insight Statistics */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
            <div className="text-[10px] uppercase tracking-[0.22em] text-white/45 mb-1">Total Posts</div>
            <div className="text-2xl font-black tracking-tight">{insightStats.totalPosts}</div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-emerald-500/10 p-4 backdrop-blur-sm">
            <div className="text-[10px] uppercase tracking-[0.22em] text-emerald-300/70 mb-1">Resources & Sales</div>
            <div className="text-2xl font-black tracking-tight text-emerald-300">{insightStats.resourcesCount} listings</div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-cyan-500/10 p-4 backdrop-blur-sm">
            <div className="text-[10px] uppercase tracking-[0.22em] text-cyan-300/70 mb-1">Comments</div>
            <div className="text-2xl font-black tracking-tight text-cyan-300">{insightStats.totalComments} replies</div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-red-500/10 p-4 backdrop-blur-sm">
            <div className="text-[10px] uppercase tracking-[0.22em] text-red-300/70 mb-1">Active SOS</div>
            <div className="text-2xl font-black tracking-tight text-red-300">{insightStats.emergencyCount} alerts</div>
          </div>
        </section>

        {/* Filters and Searches */}
        <div className="mb-8 space-y-4">
          <div className="relative">
            <Search className="absolute left-4 top-3.5 w-4 h-4 text-white/40" />
            <input
              type="text"
              placeholder="Search resource name, locations, safety tips..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pl-10 outline-none placeholder:text-white/40 focus:border-emerald-500/30 focus:bg-white/10 transition"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setActiveTypeFilter("all")}
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-[0.18em] border transition ${
                activeTypeFilter === "all"
                  ? "bg-white text-black border-white"
                  : "bg-white/5 border-white/10 text-white/70 hover:bg-white/10 hover:text-white"
              }`}
            >
              <Layers3 className="w-3.5 h-3.5 inline mr-2" /> All Feed
            </button>
            <button
              onClick={() => setActiveTypeFilter("sell")}
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-[0.18em] border transition ${
                activeTypeFilter === "sell"
                  ? "bg-emerald-500 text-white border-emerald-500 shadow-md"
                  : "bg-emerald-500/10 border-emerald-500/20 text-emerald-300 hover:bg-emerald-500/20"
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5 inline mr-2" /> Resources For Sale
            </button>
            <button
              onClick={() => setActiveTypeFilter("emergency")}
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-[0.18em] border transition ${
                activeTypeFilter === "emergency"
                  ? "bg-red-500 text-white border-red-500 shadow-md"
                  : "bg-red-500/10 border-red-500/20 text-red-300 hover:bg-red-500/20"
              }`}
            >
              <Flame className="w-3.5 h-3.5 inline mr-2" /> SOS Alerts
            </button>
            <button
              onClick={() => setActiveTypeFilter("update")}
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-[0.18em] border transition ${
                activeTypeFilter === "update"
                  ? "bg-cyan-500 text-white border-cyan-500 shadow-md"
                  : "bg-cyan-500/10 border-cyan-500/20 text-cyan-300 hover:bg-cyan-500/20"
              }`}
            >
              Updates
            </button>
          </div>
        </div>

        {/* Posts feed */}
        <div className="space-y-6">
          {loadingPosts && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 text-emerald-500 animate-spin" />
              <span className="ml-3 text-white/60">Syncing live database...</span>
            </div>
          )}

          {!loadingPosts && postError && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-6 text-red-300">
              {postError}
            </div>
          )}

          {!loadingPosts && !postError && filteredPosts.length === 0 && (
            <div className="bg-white/5 border border-white/10 rounded-2xl p-12 text-center">
              <p className="text-white/60">No social help posts matching your parameters yet.</p>
              <button
                onClick={handleCreatePost}
                className="mt-4 inline-flex items-center gap-2 px-6 py-2 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-sm font-bold hover:bg-emerald-500/25 transition"
              >
                <Plus className="w-4 h-4" /> Create First Listing
              </button>
            </div>
          )}

          {!loadingPosts && filteredPosts.map((post) => {
            const isResourcePost = post.post_type === "sell";
            const price = post.inventory?.price ?? 0;
            const status = post.inventory?.transactionStatus || "available";
            const isSold = status === "sold";
            const isMyPost = post.author?.id === user?.id;

            return (
              <article
                key={post.id}
                className="group relative overflow-hidden liquid-glass border border-white/10 rounded-2xl p-6 hover:border-[var(--accent-blue)]/50 hover:bg-white/5 transition-all duration-300"
              >
                {/* Horizontal mesh neon separator */}
                <div className={`absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-${post.post_type === 'emergency' ? 'red' : 'emerald'}-400/60 to-transparent`} />

                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-3">
                      <span className={`text-[10px] uppercase tracking-[0.2em] font-black px-2 py-1 rounded-full ${getPostTypeColor(post.post_type)}`}>
                        {isResourcePost ? "Marketplace / Swap" : post.post_type}
                      </span>
                      {post.urgency === "high" && (
                        <span className="text-[10px] font-black bg-red-500/20 text-red-300 px-2 py-1 rounded-full uppercase tracking-wider">
                          High Urgency
                        </span>
                      )}
                    </div>
                    <h3 className="text-xl font-bold group-hover:text-emerald-300 transition-colors">
                      {post.title}
                    </h3>
                  </div>

                  {/* Pricing dynamic badges */}
                  {isResourcePost && (
                    <div className="flex items-center gap-2">
                      <div className="bg-emerald-500/20 border border-emerald-500/30 rounded-xl px-4 py-2 text-right">
                        <div className="text-[9px] uppercase tracking-wider text-emerald-400">Listed Price</div>
                        <div className="text-xl font-black text-emerald-300 flex items-center justify-end gap-1">
                          <IndianRupee className="w-4 h-4" /> {price > 0 ? price : "Free / Share"}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <p className="text-white/80 text-sm leading-6 mb-4 whitespace-pre-wrap">
                  {post.content}
                </p>

                {post.imageUrl && (
                  <div className="mb-4 rounded-xl overflow-hidden border border-white/10 max-h-[360px]">
                    <img src={post.imageUrl} alt={post.title} className="w-full h-full object-cover" />
                  </div>
                )}

                {/* Sub-components layout for marketplace products */}
                {isResourcePost && post.inventory?.productName && (
                  <div className="mb-4 p-4 rounded-xl border border-white/10 bg-black/40 flex items-center justify-between">
                    <div>
                      <div className="text-[9px] uppercase tracking-wider text-neutral-500">Resource Target</div>
                      <div className="text-sm font-bold text-white">{post.inventory.productName}</div>
                    </div>
                    <div>
                      {isSold ? (
                        <span className="px-3 py-1.5 rounded-lg border border-red-500/30 bg-red-500/10 text-red-300 font-bold uppercase text-[10px] tracking-wider block">
                          🔒 Shared / Sold
                        </span>
                      ) : (
                        <span className="px-3 py-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 font-bold uppercase text-[10px] tracking-wider block">
                          ⚡ Available
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Author context line */}
                <div className="flex flex-wrap items-center gap-4 text-xs text-white/50 mb-4 pt-2 border-t border-white/5">
                  {post.location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-neutral-400" /> {post.location}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-neutral-400" /> {formatDate(post.createdAt)}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Users className="w-3 h-3 text-neutral-400" /> {post.author.name}
                    {post.author.verified && (
                      <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                        <BadgeCheck className="w-3 h-3" /> VERIFIED
                      </span>
                    )}
                  </span>
                </div>

                {/* Social interactive control actions */}
                <div className="flex flex-wrap items-center justify-between gap-4 mt-4">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleLikePost(post.id)}
                      disabled={likingPostId === post.id}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-semibold hover:bg-emerald-500/10 hover:border-emerald-500/30 transition disabled:opacity-60"
                    >
                      {likingPostId === post.id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <ThumbsUp className="w-3.5 h-3.5 text-neutral-400" />
                      )}
                      Like {post.helpfulCount}
                    </button>

                    <button
                      onClick={() => setExpandedCommentPostId((c) => (c === post.id ? null : post.id))}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-semibold hover:bg-cyan-500/10 hover:border-cyan-500/30 transition"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-neutral-400" /> Comments {post.commentCount}
                    </button>

                    {!isMyPost && (
                      <button
                        onClick={() => handleMessageAuthor(post.author.id)}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-semibold hover:bg-fuchsia-500/10 hover:border-fuchsia-500/30 transition"
                      >
                        <MessageCircle className="w-3.5 h-3.5 text-neutral-400" /> Message Seller
                      </button>
                    )}
                  </div>

                  {/* Dynamic checkout execution */}
                  {isResourcePost && (
                    <div>
                      {isSold ? (
                        <button
                          disabled
                          className="px-6 py-2 rounded-xl bg-neutral-800 text-neutral-500 text-xs font-black uppercase tracking-wider border border-neutral-700/50 cursor-not-allowed"
                        >
                          Sold Out
                        </button>
                      ) : isMyPost ? (
                        <button
                          disabled
                          className="px-6 py-2 rounded-xl bg-emerald-500/5 text-emerald-400 text-xs font-bold border border-emerald-500/20"
                        >
                          Your Listing
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            setPayingPost(post);
                            setUpiId("");
                            setPaymentStep("idle");
                            setPaymentError("");
                          }}
                          className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-black font-black uppercase text-xs tracking-widest hover:opacity-90 transition shadow-md"
                        >
                          Buy Resource
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* Inline Comment Drawer Section */}
                {expandedCommentPostId === post.id && (
                  <div className="mt-6 pt-6 border-t border-white/10 space-y-4">
                    <div className="space-y-3 max-h-[220px] overflow-y-auto pr-2">
                      <div className="text-xs text-neutral-500 font-bold uppercase tracking-wider">Discussion Board</div>
                      
                      {/* Comments will be dynamically loaded via details link or shown simply */}
                      <p className="text-xs text-neutral-400 italic">Click post header to view full threaded discussion tree.</p>
                    </div>

                    <div className="flex gap-2">
                      <input
                        value={commentDrafts[post.id] || ""}
                        onChange={(e) => setCommentDrafts((curr) => ({ ...curr, [post.id]: e.target.value }))}
                        placeholder="Join the discussion... Add supportive instructions"
                        className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm outline-none placeholder:text-white/30 focus:border-cyan-500/30 transition"
                      />
                      <button
                        onClick={() => handleCommentSubmit(post.id)}
                        disabled={commentingPostId === post.id}
                        className="px-4 py-2 rounded-xl bg-cyan-500 text-black text-xs font-bold hover:bg-cyan-400 transition disabled:opacity-50"
                      >
                        {commentingPostId === post.id ? "Posting..." : "Reply"}
                      </button>
                    </div>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      </main>

      {/* Premium Immersive Secure UPI Payment Drawer Modal */}
      {payingPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fadeIn">
          <div className="relative w-full max-w-md bg-[var(--bg-secondary)] border border-[var(--glass-border)] rounded-3xl p-6 shadow-2xl overflow-hidden">
            
            {/* Payment banner ambient glow */}
            <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-emerald-500 to-cyan-500" />
            
            {paymentStep === "idle" && (
              <>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-black uppercase tracking-wider flex items-center gap-2 text-white">
                    <ShieldCheck className="w-5 h-5 text-emerald-400" /> Mock Secure UPI
                  </h3>
                  <button
                    onClick={() => setPayingPost(null)}
                    className="text-neutral-500 hover:text-white text-sm font-bold uppercase transition"
                  >
                    Close
                  </button>
                </div>

                <div className="p-4 rounded-2xl border border-white/5 bg-white/5 mb-6 space-y-3">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-neutral-400">Resource</span>
                    <span className="font-bold text-white">{payingPost.inventory?.productName}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-neutral-400">Seller</span>
                    <span className="font-bold text-white">{payingPost.author.name}</span>
                  </div>
                  <div className="h-px bg-white/5" />
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-neutral-300 font-bold">Total Payable</span>
                    <span className="text-xl font-black text-emerald-400 flex items-center gap-0.5">
                      <IndianRupee className="w-4 h-4" /> {payingPost.inventory?.price || "0 (Free Swap)"}
                    </span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-wider text-neutral-400">Enter UPI ID</label>
                    <input
                      type="text"
                      placeholder="e.g. name@upi or customer@okaxis"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white outline-none placeholder:text-white/30 focus:border-emerald-500/30 transition text-center font-semibold"
                    />
                  </div>

                  {paymentError && <p className="text-red-400 text-xs font-semibold text-center">{paymentError}</p>}

                  <button
                    onClick={executeMockPayment}
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-black font-black uppercase text-xs tracking-widest hover:opacity-95 transition-all shadow-[0_12px_24px_rgba(16,185,129,0.15)]"
                  >
                    Confirm & Pay Securely
                  </button>
                  <p className="text-[10px] text-neutral-500 text-center uppercase tracking-widest">
                    🔒 Mock bank gateway. No real money will be charged.
                  </p>
                </div>
              </>
            )}

            {paymentStep === "processing" && (
              <div className="py-12 flex flex-col items-center justify-center space-y-4">
                <Loader2 className="w-12 h-12 text-emerald-400 animate-spin" />
                <h3 className="text-md font-black uppercase tracking-widest text-white">Authorizing Payment</h3>
                <p className="text-xs text-neutral-500 text-center px-6">
                  Reaching UPI switch. Simulating verified resource transfer protocols...
                </p>
              </div>
            )}

            {paymentStep === "success" && (
              <div className="py-6 flex flex-col items-center justify-center text-center space-y-4 animate-scaleUp">
                <CheckCircle className="w-16 h-16 text-emerald-400" />
                <h3 className="text-xl font-black uppercase tracking-wider text-emerald-400">Payment Success!</h3>
                <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 text-xs text-emerald-200/90 leading-6 space-y-2">
                  <p>
                    Verified transaction completed successfully! The resource has been securely locked.
                  </p>
                  <div className="h-px bg-emerald-500/20" />
                  <p className="font-bold text-white flex items-center justify-center gap-1.5">
                    🌟 +10 Trust score has been credited to {payingPost.author.name}'s profile!
                  </p>
                </div>

                <button
                  onClick={() => {
                    setPayingPost(null);
                    setPaymentStep("idle");
                  }}
                  className="w-full py-3 rounded-xl bg-white text-black font-black uppercase text-xs tracking-wider hover:bg-neutral-200 transition"
                >
                  Dismiss Drawer
                </button>
              </div>
            )}

          </div>
        </div>
      )}

      <style>{`
        .border-text {
          -webkit-text-stroke: 1px rgba(255,255,255,0.15);
          color: transparent;
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleUp {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
        }
        .animate-scaleUp {
          animation: scaleUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </div>
  );
}
