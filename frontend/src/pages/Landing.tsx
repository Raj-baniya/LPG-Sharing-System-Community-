import { useEffect, useMemo, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Siren } from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { AnimatedHeading } from '../components/AnimatedHeading';
import { FadeIn } from '../components/FadeIn';
import { communityApi } from '@/lib/communityApi';
import { contactApi } from '@/lib/contactApi';

type LandingPost = {
  id: string;
  title: string;
  content: string;
  type: string;
  imageUrl?: string | null;
  createdAt: string;
  author?: {
    name?: string;
  };
};

const testimonials = [
  {
    name: 'Aditi Sharma',
    role: 'Homeowner, Pune',
    quote: 'When I raised an LPG alert, a verified mechanic reached in minutes. The live timeline reduced panic instantly.',
  },
  {
    name: 'Rakesh Verma',
    role: 'Community Volunteer, Jaipur',
    quote: 'Community posts and emergency routing in one place helped us coordinate cylinder safety checks block-by-block.',
  },
  {
    name: 'Meena Patel',
    role: 'Family Caregiver, Ahmedabad',
    quote: 'The platform made reporting, tracking, and follow-up straightforward even for non-technical users in my family.',
  },
];

const qnaItems = [
  { q: 'How quickly can emergency requests be routed?', a: 'Requests are sent in real time to nearby verified responders, with status updates shown in your tracking flow.' },
  { q: 'Can I use the platform without posting publicly?', a: 'Yes. Emergency requests and account flows work independently from community posting.' },
  { q: 'What makes a mechanic or responder trusted?', a: 'Trust checks combine profile verification, past response quality, and admin oversight signals.' },
  { q: 'Can admins monitor unresolved incidents?', a: 'Yes. The admin workflow provides queue visibility, review actions, and status oversight for unresolved issues.' },
  { q: 'Does the platform support routine safety awareness?', a: 'Yes. Community updates and shared resources help spread preventive practices before emergencies happen.' },
  { q: 'Can I report incidents from multiple locations?', a: 'Yes. You can submit location-specific incidents and track each case independently.' },
  { q: 'How is response transparency maintained?', a: 'Every incident keeps a visible timeline so users can follow acknowledgements, assignments, and closure status.' },
  { q: 'Is support available for onboarding institutions?', a: 'Yes. Institutions and local groups can contact support for onboarding, training, and operational setup.' },
  { q: 'Can users verify post authenticity?', a: 'Posts include author and timing context, and moderators can intervene where authenticity concerns appear.' },
  { q: 'Where can I ask product-level questions?', a: 'Use the contact channel for platform questions, integrations, and support escalations.' },
];

export default function Landing() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState<LandingPost[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [postError, setPostError] = useState('');
  const [visiblePosts, setVisiblePosts] = useState(3);
  const [visibleQna, setVisibleQna] = useState(5);

  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [contactBusy, setContactBusy] = useState(false);
  const [contactStatus, setContactStatus] = useState('');

  useEffect(() => {
    const run = async () => {
      try {
        const response = await communityApi.listPosts();
        const list = Array.isArray(response?.posts) ? (response.posts as LandingPost[]) : [];
        setPosts(list);
      } catch (error) {
        setPostError(error instanceof Error ? error.message : 'Unable to fetch recent posts');
      } finally {
        setLoadingPosts(false);
      }
    };

    run();
  }, []);

  const sortedPosts = useMemo(
    () => [...posts].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [posts]
  );

  const displayedPosts = useMemo(() => sortedPosts.slice(0, visiblePosts), [sortedPosts, visiblePosts]);
  const displayedQna = useMemo(() => qnaItems.slice(0, visibleQna), [visibleQna]);

  const handleContactSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setContactStatus('');

    if (!contactName.trim() || !contactEmail.trim() || !contactMessage.trim()) {
      setContactStatus('Please fill all contact fields.');
      return;
    }

    setContactBusy(true);
    try {
      await contactApi.submit({
        name: contactName.trim(),
        email: contactEmail.trim(),
        message: contactMessage.trim(),
      });
      setContactName('');
      setContactEmail('');
      setContactMessage('');
      setContactStatus('Message sent successfully.');
    } catch (error) {
      setContactStatus(error instanceof Error ? error.message : 'Failed to send message');
    } finally {
      setContactBusy(false);
    }
  };

  return (
    <div className="relative min-h-screen text-white font-poppins" data-theme="dark">
      <video autoPlay loop muted playsInline className="fixed inset-0 w-full h-full object-cover z-0">
        <source
          src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260403_050628_c4e32401-fab4-4a27-b7a8-6e9291cd5959.mp4"
          type="video/mp4"
        />
      </video>

      <div className="relative z-10">
        <section className="min-h-screen w-full flex flex-col">
          <Navbar showThemeToggle={false} />

          <div className="px-6 md:px-12 lg:px-16 flex-1 flex flex-col justify-end pb-12 lg:pb-16 lg:grid lg:grid-cols-2 lg:items-end">
            <div>
              <AnimatedHeading
                text={'Responding instantly\nwhen safety matters most.'}
                className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-normal mb-4"
              />

              <FadeIn delayMs={800} durationMs={1000} className="mb-5 text-base md:text-lg text-gray-200 max-w-xl">
                Real-time LPG emergency assistance with verified mechanics, live tracking, secure response systems, and
                community intelligence.
              </FadeIn>

              <FadeIn delayMs={1200} durationMs={1000} className="flex flex-wrap gap-4 items-center">
                <button 
                  onClick={() => navigate('/emergency/assessment')}
                  className="bg-white text-black px-8 py-3 rounded-lg font-medium animate-pulse-red relative z-10 transition-transform active:scale-95 flex items-center gap-2"
                >
                  <Siren className="w-5 h-5 text-black" />
                  Raise Emergency
                </button>
                <button 
                  onClick={() => navigate('/community')}
                  className="liquid-glass border border-white/20 text-white px-8 py-3 rounded-lg font-medium hover:bg-white hover:text-black transition-all"
                >
                  Explore Platform
                </button>
              </FadeIn>
            </div>

            <div className="mt-8 lg:mt-0 flex lg:justify-end">
              <FadeIn delayMs={1400} durationMs={1000}>
                <div className="liquid-glass border border-white/20 px-6 py-3 rounded-xl inline-block">
                  <span className="text-lg md:text-xl lg:text-2xl font-light">Emergency. Safety. Response.</span>
                </div>
              </FadeIn>
            </div>
          </div>
        </section>

        <main className="px-6 md:px-12 lg:px-16 py-14 space-y-14">
          <section id="recent-post" className="max-w-5xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-semibold mb-3">Recent Community Posts</h2>
            <p className="text-white/70 mb-6">Latest posts appear below after scrolling.</p>

            <div className="space-y-4">
              {loadingPosts && (
                <div className="bg-white/10 border border-white/15 rounded-2xl p-6 md:p-8 text-white/70">Loading recent posts...</div>
              )}
              {!loadingPosts && postError && (
                <div className="bg-white/10 border border-white/15 rounded-2xl p-6 md:p-8 text-red-300">{postError}</div>
              )}
              {!loadingPosts && !postError && !sortedPosts.length && (
                <div className="bg-white/10 border border-white/15 rounded-2xl p-6 md:p-8 text-white/70">No posts yet.</div>
              )}

              {displayedPosts.map((post) => (
                <article key={post.id} className="bg-gradient-to-br from-white/10 to-white/5 border border-white/15 rounded-2xl p-6 md:p-8">
                  <div className="text-xs uppercase tracking-[0.2em] text-emerald-300 mb-3">{post.type}</div>
                  <h3 className="text-2xl md:text-3xl font-semibold mb-3">{post.title}</h3>
                  {post.imageUrl ? (
                    <img src={post.imageUrl} alt={post.title} className="w-full h-64 object-cover rounded-xl border border-white/15 mb-5" />
                  ) : null}
                  <p className="text-white/85 leading-7 mb-5 whitespace-pre-wrap">{post.content}</p>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-white/65">
                    <span>{post.author?.name || 'Community Member'}</span>
                    <span>{new Date(post.createdAt).toLocaleString()}</span>
                    <Link to={`/community/post/${post.id}`} className="text-cyan-300 hover:text-cyan-200">
                      Open full post
                    </Link>
                  </div>
                </article>
              ))}
            </div>

            {!loadingPosts && !postError && visiblePosts < sortedPosts.length && (
              <div className="mt-6">
                <button
                  type="button"
                  onClick={() => setVisiblePosts((prev) => prev + 5)}
                  className="border border-white/20 bg-white/10 px-5 py-3 rounded-lg hover:bg-white/20 transition-all"
                >
                  Show More
                </button>
              </div>
            )}
          </section>

          <section id="about" className="max-w-5xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-semibold mb-3">About</h2>
            <p className="text-white/80 leading-8 mb-4">
              GasSahayak is a community-based LPG safety platform where people support people. Households, mechanics,
              and administrators work together through one trusted network to report incidents, coordinate action,
              share reliable updates, and keep neighborhoods safer.
            </p>
            <p className="text-white/80 leading-8">
              The platform combines emergency intake, trust-aware routing, live status tracking, and community posting.
              For onboarding, support, partnerships, or platform details, email support@lpgsafetyhub.com with your
              city, issue type, and urgency so triage can start faster.
            </p>
          </section>

          <section id="vision-mission" className="max-w-5xl mx-auto grid md:grid-cols-2 gap-5">
            <article className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <h3 className="text-2xl font-semibold mb-3">Vision</h3>
              <p className="text-white/80 leading-7">
                Build the most dependable LPG safety ecosystem where every home can access verified help without delay.
              </p>
            </article>
            <article className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <h3 className="text-2xl font-semibold mb-3">Mission</h3>
              <p className="text-white/80 leading-7">
                Reduce response time, improve trust, and strengthen community preparedness through real-time digital
                coordination.
              </p>
            </article>
          </section>

          <section id="testimonials" className="max-w-5xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-semibold mb-6">Testimonials</h2>
            <div className="grid md:grid-cols-3 gap-4">
              {testimonials.map((item) => (
                <article key={item.name} className="bg-white/5 border border-white/10 rounded-2xl p-5">
                  <p className="text-white/85 leading-7 mb-4">"{item.quote}"</p>
                  <div className="text-sm font-semibold">{item.name}</div>
                  <div className="text-xs text-white/60 mt-1">{item.role}</div>
                </article>
              ))}
            </div>
          </section>

          <section id="qna" className="max-w-5xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-semibold mb-6">Q&A</h2>
            <div className="space-y-3">
              {displayedQna.map((item) => (
                <details key={item.q} className="bg-white/5 border border-white/10 rounded-xl px-5 py-4">
                  <summary className="cursor-pointer font-semibold">{item.q}</summary>
                  <p className="text-white/75 mt-3 leading-7">{item.a}</p>
                </details>
              ))}
            </div>

            {visibleQna < qnaItems.length && (
              <div className="mt-6">
                <button
                  type="button"
                  onClick={() => setVisibleQna((prev) => prev + 5)}
                  className="border border-white/20 bg-white/10 px-5 py-3 rounded-lg hover:bg-white/20 transition-all"
                >
                  Show More
                </button>
              </div>
            )}
          </section>

          <section id="contact" className="max-w-5xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-semibold mb-3">Contact</h2>
            <p className="text-white/70 mb-6">Reach the response team for onboarding, partnerships, or support.</p>
            <div className="grid md:grid-cols-2 gap-5">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-2">
                <p className="text-sm text-white/60">Email</p>
                <p>support@lpgsafetyhub.com</p>
                <p className="text-sm text-white/60 pt-3">Phone</p>
                <p>+91 98765 43210</p>
                <p className="text-sm text-white/60 pt-3">Operations</p>
                <p>24x7 emergency intake, daily platform support</p>
              </div>
              <form onSubmit={handleContactSubmit} className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-3">
                <input
                  type="text"
                  placeholder="Your name"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  className="w-full rounded-lg bg-black/30 border border-white/15 px-4 py-3 outline-none"
                />
                <input
                  type="email"
                  placeholder="Email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  className="w-full rounded-lg bg-black/30 border border-white/15 px-4 py-3 outline-none"
                />
                <textarea
                  rows={4}
                  placeholder="Message"
                  value={contactMessage}
                  onChange={(e) => setContactMessage(e.target.value)}
                  className="w-full rounded-lg bg-black/30 border border-white/15 px-4 py-3 outline-none resize-none"
                />
                {contactStatus ? <p className="text-sm text-white/80">{contactStatus}</p> : null}
                <button type="submit" disabled={contactBusy} className="bg-cyan-300 text-black px-5 py-3 rounded-lg font-semibold disabled:opacity-60">
                  {contactBusy ? 'Sending...' : 'Send'}
                </button>
              </form>
            </div>
          </section>
        </main>

        <footer className="border-t border-white/10 px-6 md:px-12 lg:px-16 py-8">
          <div className="max-w-5xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4 text-sm text-white/65">
            <p>© {new Date().getFullYear()} LPG Safety Response Platform</p>
            <div className="flex flex-wrap gap-4">
              <a href="#about" className="hover:text-white">About</a>
              <a href="#vision-mission" className="hover:text-white">Vision & Mission</a>
              <a href="#contact" className="hover:text-white">Contact</a>
              <Link to="/community" className="hover:text-white">Community</Link>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
