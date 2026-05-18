import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { communityApi } from "@/lib/communityApi";
import { getStoredUser } from "@/lib/trustAuth";
import { Navbar } from "@/components/Navbar";
import { Activity, FileText, IndianRupee, MapPin } from "lucide-react";

export default function CreatePost() {
  const navigate = useNavigate();
  const user = getStoredUser();
  const role = String(user?.role || "").toLowerCase();
  const isProviderRole = ["provider", "verified_reseller", "mechanic"].includes(role);
  const communityBasePath = isProviderRole ? "/provider/community" : "/community";

  const [postType, setPostType] = useState("update");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [location, setLocation] = useState("");
  const [urgency, setUrgency] = useState("medium");
  const [productName, setProductName] = useState("");
  const [price, setPrice] = useState("");
  const [imageDataUrl, setImageDataUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      setImageDataUrl("");
      return;
    }

    if (!file.type.startsWith("image/")) {
      setError("Please choose an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be 5MB or smaller");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setError("");
      setImageDataUrl(typeof reader.result === "string" ? reader.result : "");
    };
    reader.onerror = () => setError("Failed to read image");
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError("");

    try {
      const inventoryPayload = postType === "sell" ? {
        productName,
        price: Number(price) || 0,
        transactionStatus: "available",
        buyerId: null
      } : {};

      await communityApi.createPost({
        postType,
        title,
        content,
        location,
        urgency,
        inventory: inventoryPayload,
        imageDataUrl: imageDataUrl || undefined,
      });
      navigate(communityBasePath);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create post");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="theme-page-shell min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] selection:bg-[var(--text-primary)] selection:text-[var(--bg-primary)] font-poppins">
      <Navbar />

      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-emerald-500/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-500/5 blur-[120px] rounded-full" />
      </div>

      <main className="relative z-10 max-w-3xl mx-auto px-6 pt-32 pb-32">
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-4 h-4 text-emerald-400" />
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-400">Resource Sharing</span>
          </div>
          <h1 className="text-4xl font-black tracking-tighter uppercase italic leading-none mb-3">
            Create a <span className="text-transparent border-text">Post</span>
          </h1>
          <p className="text-neutral-400">Share updates, report emergencies, or sell community resources & help peers.</p>
        </div>

        <form onSubmit={handleSubmit} className="liquid-glass border border-white/10 rounded-3xl p-8 shadow-2xl space-y-6">
          
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-wider text-neutral-400">Post Type</label>
            <select
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-emerald-500/30 focus:bg-white/5 outline-none transition"
              value={postType}
              onChange={(e) => setPostType(e.target.value)}
            >
              <option value="update">Update / Announcement</option>
              <option value="emergency">Emergency Help Required</option>
              <option value="sell">Resource For Sale / Share</option>
            </select>
          </div>

          {postType === "sell" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5">
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-wider text-emerald-300">Resource / Product Name</label>
                <div className="relative">
                  <FileText className="absolute left-3 top-3.5 w-4 h-4 text-emerald-400/60" />
                  <input
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 pl-10 text-white placeholder:text-white/30 focus:border-emerald-500/30 focus:bg-white/5 outline-none transition"
                    placeholder="e.g. HP Gas 14.2kg Empty Cylinder"
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    required={postType === "sell"}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-wider text-emerald-300">Price (₹ INR)</label>
                <div className="relative">
                  <IndianRupee className="absolute left-3 top-3.5 w-4 h-4 text-emerald-400/60" />
                  <input
                    type="number"
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 pl-10 text-white placeholder:text-white/30 focus:border-emerald-500/30 focus:bg-white/5 outline-none transition"
                    placeholder="e.g. 500 (Set to 0 for Free / Share)"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    min="0"
                    required={postType === "sell"}
                  />
                </div>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-wider text-neutral-400">Post Title</label>
            <input
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:border-emerald-500/30 focus:bg-white/5 outline-none transition"
              placeholder="Give your post a concise title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-wider text-neutral-400">Content / Description</label>
            <textarea
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:border-emerald-500/30 focus:bg-white/5 outline-none transition min-h-[140px]"
              placeholder="What are the details? Mention condition, availability rules, and instructions."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-wider text-neutral-400">Location</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3.5 w-4 h-4 text-white/40" />
                <input
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 pl-10 text-white placeholder:text-white/30 focus:border-emerald-500/30 focus:bg-white/5 outline-none transition"
                  placeholder="e.g. Pune Sector 4"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-wider text-neutral-400">Urgency Level</label>
              <select
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-emerald-500/30 focus:bg-white/5 outline-none transition"
                value={urgency}
                onChange={(e) => setUrgency(e.target.value)}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-xs font-black uppercase tracking-wider text-neutral-400 block">Attach Image (Optional)</label>
            <input
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-neutral-400 file:mr-4 file:border-0 file:bg-white file:px-3 file:py-2 file:text-xs file:font-black file:uppercase file:text-black file:rounded-lg file:cursor-pointer"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
            />
            {imageDataUrl && (
              <div className="relative mt-2 rounded-xl overflow-hidden border border-white/10">
                <img src={imageDataUrl} alt="Post preview" className="w-full max-h-[300px] object-cover" />
              </div>
            )}
          </div>

          {error && <p className="text-red-400 text-xs font-semibold">{error}</p>}

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => navigate(communityBasePath)}
              className="px-6 py-3 rounded-xl border border-white/20 hover:bg-white/5 font-black uppercase text-xs tracking-wider transition"
            >
              Cancel
            </button>
            <button
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-black font-black uppercase text-xs tracking-wider hover:opacity-90 transition disabled:opacity-50"
              type="submit"
              disabled={busy}
            >
              {busy ? "Publishing..." : "Publish Post"}
            </button>
          </div>
        </form>
      </main>

      <style>{`
        .border-text {
          -webkit-text-stroke: 1px rgba(255,255,255,0.2);
          color: transparent;
        }
      `}</style>
    </div>
  );
}
