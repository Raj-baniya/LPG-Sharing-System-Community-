import { useEffect, useMemo, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapView } from '../components/MapView';
import { resourceApi } from '@/lib/resourceApi';
import { emergencyApi } from '@/lib/emergencyApi';
import { getStoredUser, getToken } from '@/lib/trustAuth';

type PanelKey = 'offers' | 'emergency' | 'requests';

// Using Material Symbols font spans instead of MUI icons to match the design system exactly.
export default function Dashboard() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState('');
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };
  const [activePanel, setActivePanel] = useState<PanelKey>('offers');
  const [resources, setResources] = useState<any[]>([]);
  const [emergencies, setEmergencies] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const token = getToken();
  const user = getStoredUser();

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      setError('');
      try {
        const [resourceRes, emergencyRes, requestRes] = await Promise.all([
          resourceApi.listResources(),
          token ? emergencyApi.listRequests() : Promise.resolve({ requests: [] }),
          token ? resourceApi.myRequests(token) : Promise.resolve({ requests: [] }),
        ]);

        setResources(resourceRes.resources || []);
        setEmergencies(emergencyRes.requests || []);
        setRequests(requestRes.requests || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [token]);

  const matchesQuery = (values: unknown[]) =>
    values.some((value) => String(value || '').toLowerCase().includes(searchQuery.trim().toLowerCase()));

  const filteredResources = useMemo(() => {
    if (!searchQuery.trim()) return resources;
    return resources.filter((item) =>
      matchesQuery([item.title, item.location, item.description, item.resource_type])
    );
  }, [resources, searchQuery]);

  const filteredEmergencies = useMemo(() => {
    if (!searchQuery.trim()) return emergencies;
    return emergencies.filter((item) =>
      matchesQuery([item.location, item.notes, item.intensity, item.reporter?.name, item.assigned_provider?.name])
    );
  }, [emergencies, searchQuery]);

  const filteredRequests = useMemo(() => {
    if (!searchQuery.trim()) return requests;
    return requests.filter((item) =>
      matchesQuery([item.status, item.resource?.title, item.resource?.location, item.resource?.owner?.name])
    );
  }, [requests, searchQuery]);

  const panelItems =
    activePanel === 'offers' ? filteredResources : activePanel === 'emergency' ? filteredEmergencies : filteredRequests;

  const renderPanelContent = () => {
    if (!token && activePanel !== 'offers') {
      return <div className="rounded-2xl border border-white/10 bg-black/40 p-4 text-sm text-white/65">Login required.</div>;
    }
    if (loading) {
      return <div className="rounded-2xl border border-white/10 bg-black/40 p-4 text-sm text-white/65">Loading...</div>;
    }
    if (error) {
      return <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-200">{error}</div>;
    }
    if (panelItems.length === 0) {
      return <div className="rounded-2xl border border-white/10 bg-black/40 p-4 text-sm text-white/65">No records found.</div>;
    }

    if (activePanel === 'offers') {
      return filteredResources.map((item) => (
        <div key={item.id} className="rounded-2xl border border-white/10 bg-black/40 p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="font-bold text-white">{item.title}</h3>
              <p className="mt-1 text-sm text-white/60">{item.description || 'No description added.'}</p>
            </div>
            <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-emerald-300">{item.resource_type}</span>
          </div>
          <div className="mt-4 flex items-center justify-between text-xs text-white/55">
            <span>{item.location || 'Unknown location'}</span>
            <span>Rs. {item.price || 0}</span>
          </div>
        </div>
      ));
    }

    if (activePanel === 'emergency') {
      return filteredEmergencies.map((item) => (
        <div key={item.id} className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="font-bold text-white">{item.location || 'Unknown location'}</h3>
              <p className="mt-1 text-sm text-white/65">{item.reporter?.name || 'Community user'} reported {String(item.intensity || 'an issue').toLowerCase()} leakage.</p>
            </div>
            <span className="rounded-full bg-red-500/20 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-red-200">{item.status}</span>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-white/60">
            <span>Sound: {item.leakage_sound || 'n/a'}</span>
            <span>Severity: {item.severity || 'n/a'}</span>
            <span>Duration: {item.duration || 'n/a'}</span>
            <span>Assigned: {item.assigned_provider?.name || 'Pending'}</span>
          </div>
        </div>
      ));
    }

    return filteredRequests.map((item) => (
      <div key={item.id} className="rounded-2xl border border-white/10 bg-black/40 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-bold text-white">{item.resource?.title || 'Unavailable listing'}</h3>
            <p className="mt-1 text-sm text-white/60">Owner: {item.resource?.owner?.name || 'Unknown'} | {item.resource?.location || 'Unknown location'}</p>
          </div>
          <span className="rounded-full bg-white/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-white">{item.status}</span>
        </div>
        <div className="mt-4 flex items-center justify-between text-xs text-white/55">
          <span>{item.resource?.resource_type || 'resource'}</span>
          <span>Rs. {item.resource?.price || 0}</span>
        </div>
      </div>
    ));
  };

  return (
    <div className="h-screen bg-surface text-on-surface font-body selection:bg-white selection:text-black overflow-hidden flex flex-col">
      
      {/* Top Navigation Bar */}
      <nav className="w-full z-50 bg-[#131313]/80 backdrop-blur-xl border-b border-white/5 shadow-[0_20px_40px_rgba(0,0,0,0.4)] flex justify-between items-center px-8 h-16 shrink-0 transition-all">
        <div className="flex items-center gap-8">
          <span className="text-xl font-bold tracking-tighter text-white font-headline cursor-pointer" onClick={() => navigate('/')}>LPG Hub</span>
          <div className="hidden md:flex gap-6">
            <Link className="text-[#C5C7C1] hover:text-white transition-colors text-sm font-manrope font-medium" to="/community">Community</Link>
            <Link className="text-white border-b-2 border-white pb-1 text-sm font-manrope font-medium" to="/dashboard">Map</Link>
            <Link className="text-[#C5C7C1] hover:text-white transition-colors text-sm font-manrope font-medium" to="/resources">Resources</Link>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative group hidden sm:block">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant !text-sm">search</span>
            <input 
              className="bg-surface-container-low border-none rounded-md pl-10 pr-4 py-1.5 text-sm focus:ring-1 focus:ring-outline-variant/40 transition-all w-64 text-white placeholder:text-on-surface-variant/30" 
              placeholder="Search areas..." 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button 
            onClick={() => showToast("🔔 Notifications synced. You have no pending safety alerts.")}
            className="p-2 hover:bg-white/10 transition-all rounded-full flex items-center justify-center"
          >
            <span className="material-symbols-outlined text-white">notifications</span>
          </button>
          <button 
            onClick={() => navigate('/profile')}
            className="p-2 hover:bg-white/10 transition-all rounded-full flex items-center justify-center"
            title="Profile Settings"
          >
            <span className="material-symbols-outlined text-white">settings</span>
          </button>
          <div className="h-8 w-8 rounded-full border border-white/10 overflow-hidden cursor-pointer bg-white/5 flex items-center justify-center text-xs font-black text-white" onClick={() => navigate('/profile')}>
            {user?.name?.slice(0, 1).toUpperCase() || 'U'}
          </div>
        </div>
      </nav>

      {/* Main Layout Area */}
      <div className="flex flex-1 overflow-hidden relative">
        
        {/* Sidebar Navigation */}
        <aside className="hidden md:flex w-64 bg-[#0E0E0E] flex-col gap-2 pt-6 font-manrope text-sm font-medium border-r border-white/5">
          <div className="px-6 mb-6">
            <h2 className="text-lg font-black text-white">Community Insights</h2>
            <p className="text-xs text-on-surface-variant">Local LPG availability</p>
          </div>
          
          <nav className="flex flex-col gap-1">
            <button onClick={() => navigate('/community')} className="w-full text-left text-[#C5C7C1] mx-0 px-6 py-3 flex items-center gap-3 hover:bg-[#1F1F1F] transition-all duration-300 group">
              <span className="material-symbols-outlined">dashboard</span>
              <span>Home Feed</span>
            </button>
            <button
              onClick={() => navigate('/lpg-prediction')}
              className="w-full text-left text-[#C5C7C1] mx-0 px-6 py-3 flex items-center gap-3 hover:bg-[#1F1F1F] transition-all duration-300 group"
            >
              <span className="material-symbols-outlined text-emerald-400 group-hover:animate-pulse">online_prediction</span>
              <span>LPG Prediction Hub</span>
              <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[9px] font-black tracking-widest uppercase px-1.5 py-0.5 rounded-full ml-auto">
                AI
              </span>
            </button>
            <button
              onClick={() => setActivePanel('emergency')}
              className={`w-full text-left mx-0 px-6 py-3 flex items-center gap-3 transition-all duration-300 ${activePanel === 'emergency' ? 'bg-white/5 text-white' : 'text-[#C5C7C1] hover:bg-[#1F1F1F]'}`}
            >
              <span className="material-symbols-outlined">emergency_home</span>
              <span>Emergency Alerts</span>
            </button>
            <button
              onClick={() => setActivePanel('offers')}
              className={`w-full text-left mx-0 px-6 py-3 flex items-center gap-3 transition-all duration-300 ${activePanel === 'offers' ? 'bg-white/5 text-white' : 'text-[#C5C7C1] hover:bg-[#1F1F1F]'}`}
            >
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>gas_meter</span>
              <span>Active Offers</span>
            </button>
            <button
              onClick={() => setActivePanel('requests')}
              className={`w-full text-left mx-0 px-6 py-3 flex items-center gap-3 transition-all duration-300 ${activePanel === 'requests' ? 'bg-white/5 text-white' : 'text-[#C5C7C1] hover:bg-[#1F1F1F]'}`}
            >
              <span className="material-symbols-outlined">history</span>
              <span>My Requests</span>
            </button>
          </nav>

          <div className="mt-auto p-4 flex flex-col gap-3 border-t border-white/5 pb-20">
            <button 
              onClick={() => navigate('/lpg-prediction')}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-md active:scale-[0.98] transition-all text-center text-sm flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined !text-sm">trending_up</span>
              LPG Prediction Hub
            </button>
            <button 
              onClick={() => navigate('/register')}
              className="bg-white text-black font-bold py-3 rounded-md hover:bg-white/90 active:scale-[0.98] transition-all text-center text-sm"
            >
              Register Cylinder
            </button>
            <div className="flex flex-col gap-1">
              <a 
                className="text-[#C5C7C1] px-4 py-2 flex items-center gap-3 text-xs hover:text-white transition-colors" 
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  showToast("📞 GasSahayak Support Helpline: +91 90000 88888");
                }}
              >
                <span className="material-symbols-outlined !text-sm">help</span>
                <span>Support</span>
              </a>
              <a 
                className="text-[#C5C7C1] px-4 py-2 flex items-center gap-3 text-xs hover:text-white transition-colors" 
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  showToast("📄 Terms of Service version 2.4 active.");
                }}
              >
                <span className="material-symbols-outlined !text-sm">description</span>
                <span>Terms</span>
              </a>
            </div>
          </div>
        </aside>

        {/* Content Viewport */}
        <main className="flex-1 relative overflow-hidden bg-surface-container-lowest">
          
          {/* Real Leaflet Map */}
          <div className="absolute inset-0 z-0 grayscale-[0.5] contrast-[1.1] brightness-[0.8] transition-all duration-700">
            <MapView mode={activePanel === 'emergency' ? 'emergency' : 'discovery'} />
          </div>

          {/* UI Overlays */}
          
          {/* Search / Filter Chips */}
          <div className="absolute top-6 left-6 flex gap-3 z-10 overflow-x-auto max-w-[calc(100%-200px)] no-scrollbar">
            <button onClick={() => setActivePanel('emergency')} className={`border px-4 py-2 rounded-full text-sm text-white flex items-center gap-2 transition-all whitespace-nowrap ${activePanel === 'emergency' ? 'bg-red-500/20 border-red-500/30' : 'bg-surface-bright/80 backdrop-blur-md border-white/10 hover:bg-white/20'}`}>
              <span className="w-2 h-2 rounded-full bg-red-500 blur-[2px]"></span>
              Emergency Requests
            </button>
            <button onClick={() => setActivePanel('offers')} className={`border px-4 py-2 rounded-full text-sm text-white flex items-center gap-2 transition-all whitespace-nowrap ${activePanel === 'offers' ? 'bg-emerald-500/20 border-emerald-500/30' : 'bg-surface-bright/80 backdrop-blur-md border-white/10 hover:bg-white/20'}`}>
              <span className="w-2 h-2 rounded-full bg-emerald-500 blur-[2px]"></span>
              Bulk Availability
            </button>
            <button onClick={() => setActivePanel('requests')} className={`border px-4 py-2 rounded-full text-sm text-white flex items-center gap-2 transition-all whitespace-nowrap ${activePanel === 'requests' ? 'bg-white/20 border-white/20' : 'bg-surface-bright/80 backdrop-blur-md border-white/10 hover:bg-white/20'}`}>
              <span className="material-symbols-outlined !text-sm">history</span>
              My Requests
            </button>
          </div>

          <section className="absolute inset-y-6 right-6 z-10 w-[min(420px,calc(100%-3rem))] rounded-[2rem] border border-white/10 bg-[#101010]/88 p-6 backdrop-blur-xl shadow-[0_20px_60px_rgba(0,0,0,0.55)] overflow-hidden">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h3 className="text-xl font-black text-white">
                  {activePanel === 'offers' ? 'Active Offers' : activePanel === 'emergency' ? 'Emergency Alerts' : 'My Requests'}
                </h3>
                <p className="mt-1 text-xs text-white/45">
                  {activePanel === 'offers' ? 'Live LPG listings' : activePanel === 'emergency' ? 'Open emergency cases' : 'Requests from your account'}
                </p>
              </div>
              <span className="rounded-full bg-white/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-white/75">
                {panelItems.length}
              </span>
            </div>

            <div className="h-[calc(100%-4rem)] overflow-y-auto space-y-4 pr-1">
              {renderPanelContent()}
            </div>
          </section>

          {/* Floating Controls (Zoom / Location) */}
          <div className="absolute top-6 right-6 flex flex-col gap-2 z-10">
            <div className="bg-surface-container/80 backdrop-blur-md rounded-lg p-1 border border-white/5 flex flex-col shadow-2xl">
              <button 
                onClick={() => showToast("➕ Map Discovery Zoom Level Increased")}
                className="p-2 hover:bg-white/10 text-white transition-all rounded-md flex items-center justify-center"
              >
                <span className="material-symbols-outlined">add</span>
              </button>
              <div className="h-px bg-white/5 mx-2"></div>
              <button 
                onClick={() => showToast("➖ Map Discovery Zoom Level Decreased")}
                className="p-2 hover:bg-white/10 text-white transition-all rounded-md flex items-center justify-center"
              >
                <span className="material-symbols-outlined">remove</span>
              </button>
            </div>
            <button 
              onClick={() => showToast("📍 Recalculating your current coordinates...")}
              className="bg-surface-container/80 backdrop-blur-md p-2 rounded-lg border border-white/5 text-white hover:bg-white/10 transition-all shadow-2xl flex items-center justify-center"
            >
              <span className="material-symbols-outlined">my_location</span>
            </button>
          </div>

          {/* Mode Toggle (Map / Feed) */}
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10">
            <div className="bg-surface-container-highest/80 backdrop-blur-xl p-1.5 rounded-full border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.6)] flex items-center gap-2">
              <button className="px-6 py-2 rounded-full text-sm font-bold flex items-center gap-2 transition-all bg-white text-black shadow-lg scale-[1.05]">
                <span className="material-symbols-outlined !text-sm">map</span>
                Map View
              </button>
              <button
                onClick={() => navigate('/community')}
                className="px-6 py-2 rounded-full text-sm font-medium flex items-center gap-2 transition-all text-on-surface-variant hover:text-white"
              >
                <span className="material-symbols-outlined !text-sm">view_agenda</span>
                Feed View
              </button>
            </div>
          </div>

          {/* Map Legend (Bottom Right) */}
          <div className="absolute bottom-10 right-10 z-10 hidden lg:block">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-surface-container/60 backdrop-blur-lg border border-white/5 rounded-2xl p-6 shadow-2xl min-w-[200px]"
            >
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant/60 mb-4">Live Legend</h4>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]"></div>
                  <span className="text-xs text-white font-medium">Critical Need</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                  <span className="text-xs text-white font-medium">Verified Stock</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-gray-400 shadow-[0_0_10px_rgba(156,163,175,0.5)]"></div>
                  <span className="text-xs text-white font-medium">Community Refill</span>
                </div>
                <div className="flex items-center gap-3 pt-2 border-t border-white/5">
                  <span className="material-symbols-outlined text-blue-400 !text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                  <span className="text-xs text-white font-medium">Verified Source</span>
                </div>
              </div>
            </motion.div>
          </div>

        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden w-full bg-[#131313]/90 backdrop-blur-xl z-50 flex justify-around items-center h-16 border-t border-white/5 shrink-0">
        <button onClick={() => navigate('/community')} className="flex flex-col items-center gap-1 text-on-surface-variant hover:text-white transition-colors">
          <span className="material-symbols-outlined">dashboard</span>
          <span className="text-[10px] uppercase tracking-tighter font-bold">Feed</span>
        </button>
        <button className="flex flex-col items-center gap-1 text-white">
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>map</span>
          <span className="text-[10px] uppercase tracking-tighter font-bold">Map</span>
        </button>
        <div className="-mt-10">
          <button 
            onClick={() => navigate('/community/create')}
            className="bg-white text-black p-4 rounded-full shadow-[0_10px_30px_rgba(255,255,255,0.2)] active:scale-90 transition-transform flex items-center justify-center"
          >
            <span className="material-symbols-outlined !text-2xl">add</span>
          </button>
        </div>
        <button onClick={() => setActivePanel('offers')} className={`flex flex-col items-center gap-1 transition-colors ${activePanel === 'offers' ? 'text-white' : 'text-on-surface-variant hover:text-white'}`}>
          <span className="material-symbols-outlined">gas_meter</span>
          <span className="text-[10px] uppercase tracking-tighter font-bold">Offers</span>
        </button>
        <button onClick={() => setActivePanel('requests')} className={`flex flex-col items-center gap-1 transition-colors ${activePanel === 'requests' ? 'text-white' : 'text-on-surface-variant hover:text-white'}`}>
          <span className="material-symbols-outlined">history</span>
          <span className="text-[10px] uppercase tracking-tighter font-bold">Requests</span>
        </button>
      </nav>

      {/* Dynamic Interactive Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed bottom-20 right-6 z-50 bg-[#161616] border border-white/10 text-white text-xs px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 animate-bounce">
          <span className="material-symbols-outlined text-cyan-400 !text-sm animate-pulse">info</span>
          <span>{toastMessage}</span>
        </div>
      )}

    </div>
  );
}

