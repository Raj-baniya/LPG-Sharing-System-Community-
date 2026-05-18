import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, ShieldAlert, Users, Activity, ArrowRight } from 'lucide-react';
import { trustApi, type ProviderDatasetItem, type IdReviewQueueItem } from '@/lib/trustApi';

const sampleProviders: ProviderDatasetItem[] = [
  {
    user: {
      id: 'prov_demo_001',
      name: 'Sanjay Cylinder Care',
      role: 'provider',
      isSuspended: false,
    },
    trust: {
      userId: 'prov_demo_001',
      role: 'provider',
      isPhoneVerified: true,
      verification: {
        addressText: 'Baner, Pune',
        pinCode: '411045',
        idStatus: 'approved',
        mobileNumber: '+91 99880 11223',
        idType: 'AADHAAR',
        providerName: 'Sanjay Cylinder Care',
      },
      metrics: {
        totalExchanges: 124,
        successfulExchanges: 120,
        safetyChecksCompleted: 118,
        disputesCount: 2,
        acceptedEmergencyRequests: 11,
        avgResponseSeconds: 42,
      },
      trustScore: 88,
      badges: ['Verified Provider', 'Fast Response'],
    },
  },
  {
    user: {
      id: 'prov_demo_002',
      name: 'Riya LPG Connect',
      role: 'provider',
      isSuspended: false,
    },
    trust: {
      userId: 'prov_demo_002',
      role: 'provider',
      isPhoneVerified: true,
      verification: {
        addressText: 'Indiranagar, Bengaluru',
        pinCode: '560038',
        idStatus: 'under_review',
        mobileNumber: '+91 98111 22446',
        idType: 'PAN',
        providerName: 'Riya LPG Connect',
      },
      metrics: {
        totalExchanges: 41,
        successfulExchanges: 38,
        safetyChecksCompleted: 37,
        disputesCount: 1,
        acceptedEmergencyRequests: 5,
        avgResponseSeconds: 67,
      },
      trustScore: 73,
      badges: ['Reliable'],
    },
  },
];

const sampleQueue: IdReviewQueueItem[] = [
  {
    user: {
      id: 'prov_demo_101',
      name: 'Karan Fuel Link',
      email: 'karan.demo@example.com',
      role: 'provider',
      isSuspended: false,
    },
    verification: {
      addressText: 'Gachibowli, Hyderabad',
      pinCode: '500032',
      idStatus: 'under_review',
      mobileNumber: '+91 97000 88001',
      idType: 'AADHAAR',
      idNumber: 'XXXX-XXXX-5512',
      providerName: 'Karan Fuel Link',
    },
    trustScore: 81,
  },
];

export default function TrustOverview() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [providers, setProviders] = useState<ProviderDatasetItem[]>([]);
  const [pendingReviews, setPendingReviews] = useState<IdReviewQueueItem[]>([]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');

      try {
        const [providersRes, reviewRes] = await Promise.allSettled([
          trustApi.listProviders(),
          trustApi.listIdReviewQueue(),
        ]);

        if (providersRes.status === 'fulfilled') {
          setProviders(providersRes.value.providers || []);
        }

        if (reviewRes.status === 'fulfilled') {
          setPendingReviews(reviewRes.value.queue || []);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unable to load trust overview');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const stats = useMemo(() => {
    const verified = providers.filter((item) => item.trust.verification.idStatus === 'approved');
    const suspended = providers.filter((item) => item.user.isSuspended);
    const highTrust = providers.filter((item) => item.trust.trustScore >= 75);

    return [
      { label: 'Providers', value: String(providers.length), icon: Users, tone: 'text-blue-400' },
      { label: 'Verified', value: String(verified.length), icon: ShieldCheck, tone: 'text-emerald-400' },
      { label: 'High Trust', value: String(highTrust.length), icon: Activity, tone: 'text-cyan-400' },
      { label: 'Suspended', value: String(suspended.length), icon: ShieldAlert, tone: 'text-red-400' },
    ];
  }, [providers]);

  const visibleProviders = providers.length ? providers : sampleProviders;
  const visibleReviews = pendingReviews.length ? pendingReviews : sampleQueue;

  return (
    <div className="space-y-10">
      
      {/* Dynamic Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-cyan-400 mb-2">Trust Command</p>
          <h1 className="text-4xl font-black uppercase italic tracking-tighter">Provider Trust Snapshot</h1>
          <p className="mt-2 text-sm text-neutral-400 max-w-2xl">
            Review provider identity verification statuses, active suspensions, and real-time trust score metrics.
          </p>
        </div>
        <Link 
          to="/admin/id-review-queue" 
          className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-2.5 text-xs font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all self-start"
        >
          Review IDs <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.label} className="hub-glass border border-white/5 rounded-3xl p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] uppercase tracking-[0.25em] text-neutral-500 font-black">{stat.label}</span>
              <stat.icon className={`w-5 h-5 ${stat.tone}`} />
            </div>
            <p className="text-4xl font-black tracking-tight">{loading ? '...' : stat.value}</p>
          </div>
        ))}
      </div>

      {error ? (
        <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-5 py-4 text-sm text-red-200">
          {error}
        </div>
      ) : null}

      {/* Verification Queue Section */}
      <section className="rounded-3xl border border-white/5 bg-white/[0.03] p-8 shadow-2xl">
        <div className="flex items-center justify-between gap-3 mb-6">
          <div>
            <h2 className="text-2xl font-black italic uppercase tracking-tight">Identity Review Queue</h2>
            <p className="mt-1 text-sm text-neutral-400">
              Identity documents pending administrative approval before the green verification badge is granted.
            </p>
          </div>
          <Link 
            to="/admin/id-review-queue" 
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all"
          >
            Open Queue <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {visibleReviews.slice(0, 6).map((item) => (
            <div key={item.user.id} className="rounded-2xl border border-white/10 bg-black/25 p-5 shadow-lg">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-lg font-black tracking-tight">{item.user.name}</p>
                  <p className="text-xs text-neutral-500 mt-1 break-all">{item.user.email}</p>
                </div>
                <span className="rounded-full border border-amber-300/40 bg-amber-400/15 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-amber-200">
                  Under Review
                </span>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3 text-xs text-neutral-400">
                <div>
                  <p className="uppercase tracking-[0.2em] text-neutral-500 font-black">Provider</p>
                  <p className="mt-1">{item.verification.providerName || 'n/a'}</p>
                </div>
                <div>
                  <p className="uppercase tracking-[0.2em] text-neutral-500 font-black">ID Status</p>
                  <p className="mt-1 uppercase">{item.verification.idStatus || 'pending'}</p>
                </div>
              </div>
            </div>
          ))}
          {!pendingReviews.length ? (
            <div className="rounded-2xl border border-dashed border-white/15 bg-white/5 p-5 text-sm text-neutral-400 md:col-span-2 xl:col-span-3">
              Showing demo verification cards because the live queue is empty.
            </div>
          ) : null}
        </div>
      </section>

      {/* Active Provider List */}
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-black italic uppercase tracking-tight">Active Providers Status</h2>
          <p className="text-sm text-neutral-400">Detailed list of providers showing active verification details and baseline trust ratings.</p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {visibleProviders.map((item) => (
            <div key={item.user.id} className="hub-glass border border-white/5 rounded-3xl p-6 shadow-2xl">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xl font-black tracking-tight">{item.user.name}</p>
                  <p className="text-xs text-neutral-500 mt-1 break-all">{item.user.id}</p>
                </div>
                <span className={`rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-widest ${item.user.isSuspended ? 'border-red-300/40 bg-red-500/10 text-red-200' : 'border-emerald-300/40 bg-emerald-500/10 text-emerald-200'}`}>
                  {item.user.isSuspended ? 'Suspended' : 'Active'}
                </span>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4 shadow-inner">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-neutral-500 font-black">Trust Score</p>
                  <p className="mt-1 text-2xl font-black">{item.trust.trustScore}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4 shadow-inner">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-neutral-500 font-black">ID Status</p>
                  <p className="mt-1 text-sm font-bold uppercase">{item.trust.verification.idStatus || 'pending'}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4 shadow-inner">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-neutral-500 font-black">Phone Verified</p>
                  <p className="mt-1 text-sm font-bold">{item.trust.isPhoneVerified ? 'Yes' : 'No'}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4 shadow-inner">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-neutral-500 font-black">Badges</p>
                  <p className="mt-1 text-sm font-bold">{item.trust.badges.length ? item.trust.badges.join(', ') : 'None'}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {!loading && providers.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-white/15 bg-white/5 p-8 text-center text-neutral-400">
          Showing demo provider trust data because the live dataset is empty.
        </div>
      ) : null}
    </div>
  );
}