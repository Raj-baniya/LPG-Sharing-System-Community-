import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { communityApi } from "@/lib/communityApi";
import { getStoredUser, getToken } from "@/lib/trustAuth";
import { Navbar } from "@/components/Navbar";
import { ArrowLeft, Clock, MapPin, Trash2, MessageSquare, IndianRupee, Loader2, BadgeCheck } from "lucide-react";

type CommentNode = {
  id: string;
  content: string;
  createdAt: string;
  likeCount: number;
  author: { name: string; verified?: boolean };
  replies: CommentNode[];
};

export default function PostDetails() {
  const navigate = useNavigate();
  const { id = "" } = useParams();
  const [post, setPost] = useState<any>(null);
  const [comments, setComments] = useState<CommentNode[]>([]);
  const [reply, setReply] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(false);
  const storedUser = getStoredUser();
  const role = String(storedUser?.role || "").toLowerCase();
  const isProviderRole = ["provider", "verified_reseller", "mechanic"].includes(role);
  const isAdminRole = role === "admin";

  const communityBasePath = isProviderRole 
    ? "/provider/community" 
    : isAdminRole 
      ? "/admin/community" 
      : "/community";

  const load = async () => {
    try {
      const res = await communityApi.getPost(id);
      setPost(res.post);
      setComments(res.comments || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load post details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [id]);

  const handleReply = async () => {
    if (!reply.trim()) return;
    if (!getToken()) {
      setError("Please login to post a reply.");
      return;
    }
    try {
      await communityApi.addComment(id, { content: reply.trim() });
      setReply("");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to post reply");
    }
  };

  const handleDelete = async () => {
    if (!id || deleting) return;
    if (!window.confirm("Are you sure you want to delete this community post?")) return;
    setDeleting(true);
    setError("");
    try {
      await communityApi.deletePost(id);
      navigate(communityBasePath);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete post");
      setDeleting(false);
    }
  };

  const renderComment = (comment: CommentNode, depth = 0) => (
    <div key={comment.id} className={`${depth > 0 ? "ml-6 md:ml-10 mt-3 pl-3 border-l-2 border-white/5" : "mt-4 animate-scaleUp"}`}>
      <div className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-sm">
        <div className="flex items-center justify-between gap-4 mb-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black uppercase tracking-wider text-emerald-300">{comment.author.name}</span>
            {comment.author.verified && (
              <span className="text-[8px] font-black text-emerald-400 bg-emerald-500/10 px-1 rounded">VERIFIED</span>
            )}
          </div>
          <span className="text-[10px] text-neutral-500">{new Date(comment.createdAt).toLocaleString()}</span>
        </div>
        <p className="text-xs md:text-sm text-neutral-300 leading-relaxed">{comment.content}</p>
      </div>
      {comment.replies && comment.replies.map((item) => renderComment(item, depth + 1))}
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] flex items-center justify-center">
        <div className="flex items-center gap-3">
          <Loader2 className="w-5 h-5 text-emerald-400 animate-spin" />
          <span className="text-sm text-neutral-400 uppercase tracking-widest font-black">Loading Details...</span>
        </div>
      </div>
    );
  }

  const canDelete = post?.author?.id === storedUser?.id || ["admin", "volunteer_inspector"].includes(role);

  return (
    <div className="theme-page-shell min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] selection:bg-[var(--text-primary)] selection:text-[var(--bg-primary)] font-poppins">
      <Navbar />

      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-emerald-500/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-500/5 blur-[120px] rounded-full" />
      </div>

      <main className="relative z-10 max-w-4xl mx-auto px-6 pt-32 pb-32">
        <div className="mb-6">
          <button
            onClick={() => navigate(communityBasePath)}
            className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-neutral-400 hover:text-white transition"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Feed
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl border border-red-500/20 bg-red-500/10 text-red-400 text-xs font-semibold">
            {error}
          </div>
        )}

        {post && (
          <article className="liquid-glass border border-white/10 rounded-3xl p-6 md:p-8 mb-8">
            <div className="flex flex-wrap items-center gap-4 text-xs text-white/50 mb-4 pb-4 border-b border-white/5">
              <span className="flex items-center gap-1.5 font-bold text-emerald-300">
                {post.author.name}
                {post.author.verified && (
                  <BadgeCheck className="w-4 h-4 text-emerald-400 inline" />
                )}
              </span>
              {post.location && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" /> {post.location}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> {new Date(post.createdAt).toLocaleString()}
              </span>
            </div>

            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6">
              <h1 className="text-2xl md:text-3xl font-black tracking-tight">{post.title}</h1>
              {post.type === "sell" && (
                <div className="bg-emerald-500/20 border border-emerald-500/30 rounded-xl px-4 py-2 shrink-0">
                  <div className="text-[9px] uppercase tracking-wider text-emerald-300">Price Tag</div>
                  <div className="text-xl font-black text-emerald-400 flex items-center gap-0.5">
                    <IndianRupee className="w-4 h-4" /> {post.inventory?.price > 0 ? post.inventory.price : "Free"}
                  </div>
                </div>
              )}
            </div>

            {post.imageUrl && (
              <div className="mb-6 rounded-2xl overflow-hidden border border-white/10 max-h-[400px]">
                <img src={post.imageUrl} alt={post.title} className="w-full h-full object-cover" />
              </div>
            )}

            <p className="text-neutral-300 text-sm md:text-md leading-7 whitespace-pre-wrap">{post.content}</p>

            {post.type === "sell" && post.inventory?.productName && (
              <div className="mt-6 p-4 rounded-xl border border-white/10 bg-black/40 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-neutral-500 uppercase tracking-widest block mb-1">Target Product</span>
                  <span className="text-sm font-bold text-white">{post.inventory.productName}</span>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                  post.inventory.transactionStatus === "sold"
                    ? "bg-red-500/15 text-red-300 border border-red-500/20"
                    : "bg-emerald-500/15 text-emerald-300 border border-emerald-500/20"
                }`}>
                  {post.inventory.transactionStatus || "available"}
                </span>
              </div>
            )}

            {canDelete && (
              <div className="mt-8 pt-6 border-t border-white/5 flex justify-end">
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-500/15 hover:bg-red-500/20 border border-red-500/30 text-red-300 text-xs font-black uppercase tracking-widest transition"
                >
                  <Trash2 className="w-4 h-4" /> {deleting ? "Deleting..." : "Delete Post"}
                </button>
              </div>
            )}
          </article>
        )}

        <div className="liquid-glass border border-white/10 rounded-2xl p-6 mb-8">
          <div className="flex items-center gap-2 mb-4">
            <MessageSquare className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-black uppercase tracking-wider text-cyan-400">Post a Reply</span>
          </div>
          <textarea
            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:border-cyan-500/30 focus:bg-white/5 outline-none transition min-h-[100px]"
            placeholder="Add verified safety notes or request logistics detail..."
            value={reply}
            onChange={(e) => setReply(e.target.value)}
          />
          <div className="flex justify-end mt-4">
            <button
              onClick={handleReply}
              className="px-6 py-3 rounded-xl bg-white text-black font-black uppercase text-xs tracking-wider hover:bg-neutral-200 transition"
            >
              Post Reply
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-xs font-black uppercase tracking-widest text-neutral-500 mb-2">Discussion Replies ({comments.length})</h3>
          {comments.length === 0 ? (
            <p className="text-sm text-neutral-500 italic text-center py-6 bg-white/5 rounded-2xl border border-white/5">
              No replies yet. Be the first to start the conversation!
            </p>
          ) : (
            comments.map((comment) => renderComment(comment))
          )}
        </div>
      </main>

      <style>{`
        @keyframes scaleUp {
          from { transform: scale(0.98); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        .animate-scaleUp {
          animation: scaleUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </div>
  );
}
