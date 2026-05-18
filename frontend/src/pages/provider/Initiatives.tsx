import { FormEvent, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, PlusCircle, Sparkles, ArrowLeft } from 'lucide-react';
import { initiativeApi, type InitiativeItem, type InitiativeOffer } from '@/lib/initiativeApi';

const initialForm = {
  initiativeId: '',
  title: '',
  description: '',
  location: '',
  quantityKg: 14.2,
  unitPrice: 850,
  subsidyPercent: 10,
  availableUnits: 10,
};

export default function ProviderInitiatives() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [initiatives, setInitiatives] = useState<InitiativeItem[]>([]);
  const [myOffers, setMyOffers] = useState<InitiativeOffer[]>([]);
  const [form, setForm] = useState(initialForm);

  const loadData = async () => {
    setLoading(true);
    setError('');

    try {
      const [initiativesRes, mineRes] = await Promise.all([
        initiativeApi.listInitiatives(),
        initiativeApi.listMyOffers(),
      ]);

      setInitiatives(initiativesRes.initiatives || []);
      setMyOffers(mineRes.offers || []);
      if (!form.initiativeId && initiativesRes.initiatives && initiativesRes.initiatives.length > 0) {
        setForm((prev) => ({ ...prev, initiativeId: initiativesRes.initiatives[0].id }));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load initiatives workspace.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setMessage('');

    try {
      const result = await initiativeApi.createOffer(form);
      setMessage(result.message);
      setForm((prev) => ({
        ...initialForm,
        initiativeId: prev.initiativeId,
      }));
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to publish offer.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-6 md:p-12 flex flex-col font-sans">
      <div className="max-w-6xl w-full mx-auto">
        
        {/* Back navigation to Provider Workspace */}
        <button 
          onClick={() => navigate('/provider/home')}
          className="mb-8 flex items-center gap-2 text-gray-500 hover:text-white transition-colors text-sm"
        >
          <ArrowLeft className="w-4 h-4" /> 
          Back to Provider Workspace
        </button>

        {/* Page Header */}
        <section className="space-y-4 mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-widest text-cyan-200">
              Provider Initiative Console
            </span>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div>
              <h1 className="text-3xl font-black tracking-tight md:text-4xl text-white">
                Publish Subsidized LPG Listings
              </h1>
              <p className="mt-2 text-neutral-400 text-sm max-w-3xl">
                Create and manage LPG cylinder distributions sponsored by NGO, trust, and government subsidy campaigns.
              </p>
            </div>
          </div>
        </section>

        {error ? (
          <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-5 py-4 text-sm text-red-200 mb-6">
            {error}
          </div>
        ) : null}
        
        {message ? (
          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-5 py-4 text-sm text-emerald-200 mb-6">
            {message}
          </div>
        ) : null}

        <div className="grid grid-cols-1 xl:grid-cols-[1.2fr_1fr] gap-8">
          
          {/* Create Offer Form */}
          <form onSubmit={handleSubmit} className="liquid-glass border border-white/10 rounded-3xl p-6 md:p-8 space-y-6">
            <h2 className="text-xl font-bold tracking-tight text-white border-b border-white/5 pb-3">
              Publish Initiative Offer
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="text-xs font-black uppercase tracking-widest text-neutral-400">Select Initiative Campaign</label>
                <select
                  required
                  value={form.initiativeId}
                  onChange={(e) => setForm((prev) => ({ ...prev, initiativeId: e.target.value }))}
                  className="mt-2 w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-white/30 transition-all"
                >
                  <option value="" className="bg-black">Select initiative</option>
                  {initiatives.map((item) => (
                    <option key={item.id} value={item.id} className="bg-black">
                      {item.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="text-xs font-black uppercase tracking-widest text-neutral-400">Offer Title</label>
                <input
                  required
                  value={form.title}
                  onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                  className="mt-2 w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-white/30 transition-all"
                  placeholder="e.g. Government Subsidy Family Refill Scheme"
                />
              </div>

              <div className="md:col-span-2">
                <label className="text-xs font-black uppercase tracking-widest text-neutral-400">Description / Conditions</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="mt-2 w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-white/30 transition-all"
                  placeholder="Details eligibility guidelines, verify tokens, and other terms."
                />
              </div>

              <div>
                <label className="text-xs font-black uppercase tracking-widest text-neutral-400">Base Location</label>
                <input
                  value={form.location}
                  onChange={(e) => setForm((prev) => ({ ...prev, location: e.target.value }))}
                  className="mt-2 w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-white/30 transition-all"
                  placeholder="e.g. Powai, Andheri"
                />
              </div>

              <div>
                <label className="text-xs font-black uppercase tracking-widest text-neutral-400">Quantity (kg)</label>
                <input
                  type="number"
                  min="1"
                  step="0.1"
                  value={form.quantityKg}
                  onChange={(e) => setForm((prev) => ({ ...prev, quantityKg: Number(e.target.value) }))}
                  className="mt-2 w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-white/30 transition-all"
                />
              </div>

              <div>
                <label className="text-xs font-black uppercase tracking-widest text-neutral-400">Base Price (₹)</label>
                <input
                  type="number"
                  min="1"
                  value={form.unitPrice}
                  onChange={(e) => setForm((prev) => ({ ...prev, unitPrice: Number(e.target.value) }))}
                  className="mt-2 w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-white/30 transition-all"
                />
              </div>

              <div>
                <label className="text-xs font-black uppercase tracking-widest text-neutral-400">Subsidy (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={form.subsidyPercent}
                  onChange={(e) => setForm((prev) => ({ ...prev, subsidyPercent: Number(e.target.value) }))}
                  className="mt-2 w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-white/30 transition-all"
                />
              </div>

              <div className="md:col-span-2">
                <label className="text-xs font-black uppercase tracking-widest text-neutral-400">Available Units (Stock)</label>
                <input
                  type="number"
                  min="1"
                  value={form.availableUnits}
                  onChange={(e) => setForm((prev) => ({ ...prev, availableUnits: Number(e.target.value) }))}
                  className="mt-2 w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-white/30 transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting || loading}
              className="w-full bg-white text-black py-3 rounded-xl font-bold hover:bg-neutral-200 active:scale-[0.98] transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <PlusCircle className="w-4 h-4" />}
              Publish Subsidized Offer
            </button>
          </form>

          {/* Active Listings Sidebar */}
          <section className="liquid-glass border border-white/10 rounded-3xl p-6 md:p-8 flex flex-col">
            <h2 className="text-xl font-bold tracking-tight text-white mb-4 border-b border-white/5 pb-3">
              My Active Listings
            </h2>

            {loading ? (
              <div className="flex items-center gap-2 text-sm text-neutral-400 py-6">
                <Loader2 className="w-4 h-4 animate-spin text-cyan-400" /> Loading active offers...
              </div>
            ) : null}

            {!loading && !myOffers.length ? (
              <p className="text-sm text-neutral-500 py-6 text-center">
                No active subsidy listings found. Use the publisher form to post one.
              </p>
            ) : null}

            <div className="space-y-4 overflow-y-auto max-h-[500px] pr-1">
              {myOffers.map((offer) => (
                <article key={offer.id} className="rounded-2xl border border-white/5 bg-white/[0.02] hover:border-white/10 p-5 space-y-3 transition-all">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-white">{offer.title}</p>
                      <p className="text-xs text-neutral-500 mt-1">{offer.initiative?.name || 'Initiative Campaign'}</p>
                    </div>
                    <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[9px] font-black uppercase px-2 py-0.5 rounded-full">
                      {offer.status || 'Active'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-xs text-neutral-400 pt-1">
                    <p>Location: <span className="text-white">{offer.location || 'N/A'}</span></p>
                    <p>Size: <span className="text-white">{offer.quantity_kg} kg</span></p>
                    <p>Base Price: <span className="text-white">₹{Number(offer.unit_price || 0).toFixed(0)}</span></p>
                    <p>Subsidy: <span className="text-emerald-400 font-bold">{Number(offer.subsidy_percent || 0).toFixed(0)}%</span></p>
                    <p className="col-span-2">Stock Available: <span className="text-white">{offer.available_units} units</span></p>
                  </div>
                </article>
              ))}
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}
