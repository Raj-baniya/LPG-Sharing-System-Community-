import { useEffect, useMemo, useState } from 'react';
import { RoleHub, type FeatureCard } from '@/components/RoleHub';
import { trustApi } from '@/lib/trustApi';
import { AuthenticatedRoute } from '@/components/trust/AuthenticatedRoute';
import { MapView } from '@/components/MapView';
import { emergencyApi } from '@/lib/emergencyApi';
import { resourceApi } from '@/lib/resourceApi';
import { getToken } from '@/lib/trustAuth';
import { Map, Navigation, Shield, AlertTriangle, ListFilter, ClipboardList, Info } from 'lucide-react';

function ConsumerHomeContent() {
  const token = getToken();

  // Stats
  const [loading, setLoading] = useState(true);
  const [trustScore, setTrustScore] = useState(0);
  const [providerCount, setProviderCount] = useState(0);
  const [openDisputes, setOpenDisputes] = useState(0);

  // Tab control inside Workspace
  const [workspaceTab, setWorkspaceTab] = useState<'map' | 'tracking'>('map');

  // Map & Listings Data
  const [resources, setResources] = useState<any[]>([]);
  const [emergencies, setEmergencies] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [activePanel, setActivePanel] = useState<'offers' | 'emergencies' | 'my-requests'>('offers');
  const [mapError, setMapError] = useState('');

  // Tracking Data
  const [trackingRequest, setTrackingRequest] = useState<any>(null);
  const [trackingProvider, setTrackingProvider] = useState<any>(null);

  useEffect(() => {
    const loadWorkspaceData = async () => {
      setLoading(true);
      try {
        // Core Stats
        const [trustRes, providersRes, disputesRes] = await Promise.all([
          trustApi.getMyTrust(),
          trustApi.listProviders(),
          trustApi.listDisputes(),
        ]);

        setTrustScore(Number(trustRes.trust.trustScore || 0));
        setProviderCount(providersRes.count);
        setOpenDisputes(disputesRes.disputes.filter((item) => item.status !== 'resolved').length);

        // Map Listings & Requests
        const [resourceRes, emergencyRes, requestRes] = await Promise.all([
          resourceApi.listResources(),
          token ? emergencyApi.listRequests() : Promise.resolve({ requests: [] }),
          token ? resourceApi.myRequests(token) : Promise.resolve({ requests: [] }),
        ]);

        setResources(resourceRes.resources || []);
        setEmergencies(emergencyRes.requests || []);
        setRequests(requestRes.requests || []);

        // Prefill tracking with the first active emergency request if available
        const activeEm = emergencyRes.requests?.find((r: any) => r.status === 'assigned' || r.status === 'pending');
        if (activeEm) {
          setTrackingRequest(activeEm);
          setTrackingProvider(activeEm.assigned_provider || null);
        }

      } catch (err) {
        console.error('Error loading consumer workspace data:', err);
        setMapError('Unable to sync dynamic workspace database streams.');
      } finally {
        setLoading(false);
      }
    };

    loadWorkspaceData();
  }, [token]);

  const consumerStats = useMemo(
    () => [
      { label: 'Trust Score', value: String(trustScore), loading },
      { label: 'Nearby Resellers', value: String(providerCount), loading },
      { label: 'Pending Disputes', value: String(openDisputes), loading },
    ],
    [trustScore, providerCount, openDisputes, loading]
  );

  const consumerFeatures: FeatureCard[] = [
    {
      title: 'LPG Prediction Hub',
      description: 'Track cylinder empty-date predictions and quickly access leakage-safe planning actions.',
      to: '/lpg-prediction',
      badge: 'Predictive',
      stateLabel: 'Live forecasting',
      stateTone: 'good',
    },
    {
      title: 'Disputes Workspace',
      description: 'Raise, manage, and resolve disputes on shared cylinder exchanges.',
      to: '/disputes',
      badge: 'Escrow',
      stateLabel: openDisputes > 0 ? `${openDisputes} active` : 'No active disputes',
      stateTone: openDisputes > 0 ? 'warn' : 'good',
    },
    {
      title: 'Emergency Request',
      description: 'File emergency leaks or safety alerts with live telemetry dispatching.',
      to: '/emergency',
      badge: 'SOS',
    },
    {
      title: 'Resource Sharing',
      description: 'Offer, trade or swap LPG cylinders to earn reward points.',
      to: '/resources',
      badge: 'Eco-Share',
    },
    {
      title: 'Nearby Providers',
      description: 'Search nearby verified LPG providers and emergency responders.',
      to: '/providers/nearby',
      badge: 'Resellers',
      stateLabel: loading ? 'Loading' : `${providerCount} live`,
      stateTone: 'good',
    },
  ];

  const filteredPanelItems = useMemo(() => {
    if (activePanel === 'offers') return resources;
    if (activePanel === 'emergencies') return emergencies;
    return requests;
  }, [activePanel, resources, emergencies, requests]);

  return (
    <RoleHub
      roleTitle="Consumer"
      subtitle="Unified task-focused workspace for providers, dynamic predictive metrics, and real-time cylinder swapping."
      accentClass="border-amber-300/50 bg-amber-500/10 text-amber-200"
      stats={consumerStats}
      features={consumerFeatures}
    >
      {/* Unified Map & Tracking Workspace Section */}
      <div className="bg-gradient-to-b from-neutral-900 to-black border border-white/5 rounded-3xl overflow-hidden shadow-2xl mt-10">
        
        {/* Console Navigation Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between border-b border-white/5 bg-black/40 px-6 py-4 gap-4">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-amber-500" />
            <h2 className="text-base font-black uppercase tracking-widest">Active Workspace Console</h2>
          </div>
          <div className="flex bg-white/5 rounded-xl p-1 border border-white/5">
            <button
              onClick={() => setWorkspaceTab('map')}
              className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 ${
                workspaceTab === 'map' ? 'bg-white text-black shadow' : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Map className="w-4 h-4" />
              Live Sharing Map
            </button>
            <button
              onClick={() => setWorkspaceTab('tracking')}
              className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 ${
                workspaceTab === 'tracking' ? 'bg-white text-black shadow' : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Navigation className="w-4 h-4" />
              Cylinder Order Tracking
            </button>
          </div>
        </div>

        {/* Tab Content 1: Live Map View & Sharing Listings */}
        {workspaceTab === 'map' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 h-[600px] items-stretch relative">
            
            {/* Map Container */}
            <div className="lg:col-span-2 relative border-r border-white/5 bg-[#080808]">
              <div className="absolute inset-0 z-0 grayscale-[0.4] contrast-[1.1] brightness-[0.8]">
                <MapView mode={activePanel === 'emergencies' ? 'emergency' : 'discovery'} />
              </div>
            </div>

            {/* Sidebar Overlay inside Workspace */}
            <div className="lg:col-span-1 bg-[#0c0c0c] flex flex-col justify-between h-[600px] border-t lg:border-t-0 border-white/5">
              
              {/* Overlay Header / Control */}
              <div className="p-5 border-b border-white/5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-black uppercase tracking-widest text-neutral-400">Community Terminal</h3>
                  <span className="bg-white/10 px-2 py-0.5 rounded-full text-[9px] font-black">
                    {filteredPanelItems.length} listed
                  </span>
                </div>
                
                {/* Category filters */}
                <div className="grid grid-cols-3 gap-1.5 bg-black/40 p-1 rounded-xl border border-white/5">
                  <button
                    onClick={() => setActivePanel('offers')}
                    className={`py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${
                      activePanel === 'offers' ? 'bg-white text-black' : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    Offers
                  </button>
                  <button
                    onClick={() => setActivePanel('emergencies')}
                    className={`py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${
                      activePanel === 'emergencies' ? 'bg-white text-black' : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    SOS Leaks
                  </button>
                  <button
                    onClick={() => setActivePanel('my-requests')}
                    className={`py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${
                      activePanel === 'my-requests' ? 'bg-white text-black' : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    Mine
                  </button>
                </div>
              </div>

              {/* Listings Registry */}
              <div className="flex-1 overflow-y-auto p-5 space-y-3 scrollbar-thin">
                {mapError && (
                  <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-200 text-xs rounded-xl flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
                    <span>{mapError}</span>
                  </div>
                )}

                {filteredPanelItems.length === 0 ? (
                  <div className="py-20 text-center text-neutral-500 text-xs">
                    No active listings for this query.<br />
                    Select a different category tab.
                  </div>
                ) : activePanel === 'offers' ? (
                  filteredPanelItems.map((item) => (
                    <div key={item.id} className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl hover:border-white/10 transition-all space-y-2">
                      <div className="flex justify-between items-start">
                        <h4 className="font-bold text-sm text-neutral-200 line-clamp-1">{item.title}</h4>
                        <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[8px] font-black uppercase px-2 py-0.5 rounded-full">
                          {item.resource_type}
                        </span>
                      </div>
                      <p className="text-xs text-neutral-400 line-clamp-2">{item.description || 'Verified LPG share node.'}</p>
                      <div className="flex justify-between items-center text-[10px] text-neutral-500 pt-1">
                        <span>{item.location || 'Mumbai'}</span>
                        <span className="text-neutral-300 font-bold">₹{item.price}</span>
                      </div>
                    </div>
                  ))
                ) : activePanel === 'emergencies' ? (
                  filteredPanelItems.map((item) => (
                    <div key={item.id} className="p-4 bg-red-500/5 border border-red-500/20 rounded-2xl hover:border-red-500/30 transition-all space-y-2">
                      <div className="flex justify-between items-start">
                        <h4 className="font-bold text-sm text-red-200 line-clamp-1">{item.location || 'Emergency Leak'}</h4>
                        <span className="bg-red-500/20 text-red-300 text-[8px] font-black uppercase px-2 py-0.5 rounded-full">
                          {item.status}
                        </span>
                      </div>
                      <p className="text-xs text-red-300/80">Severity: {item.severity || 'Critical'} • Intensity: {item.intensity || 'High'}</p>
                      <p className="text-[10px] text-neutral-500">Assigned: {item.assigned_provider?.name || 'Awaiting dispatch'}</p>
                    </div>
                  ))
                ) : (
                  filteredPanelItems.map((item) => (
                    <div key={item.id} className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl hover:border-white/10 transition-all space-y-2">
                      <div className="flex justify-between items-start">
                        <h4 className="font-bold text-sm text-neutral-200 line-clamp-1">{item.resource?.title || 'Swap request'}</h4>
                        <span className="bg-white/10 text-neutral-300 border border-white/10 text-[8px] font-black uppercase px-2 py-0.5 rounded-full">
                          {item.status}
                        </span>
                      </div>
                      <p className="text-xs text-neutral-400">Owner: {item.resource?.owner?.name || 'Self'} • Price: ₹{item.resource?.price || 0}</p>
                    </div>
                  ))
                )}
              </div>

              {/* Sidebar Action Footer */}
              <div className="p-5 border-t border-white/5 bg-black/40">
                <button
                  onClick={() => window.location.href = '/resources'}
                  className="w-full bg-white text-black py-2.5 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-neutral-200 transition-all"
                >
                  Create Cylinder Listing
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab Content 2: Dynamic Timeline Tracking */}
        {workspaceTab === 'tracking' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 h-[600px] items-stretch">
            
            {/* Left Column: Visual tracking Map widget */}
            <div className="lg:col-span-2 relative bg-[#080808] border-r border-white/5">
              <div className="absolute inset-0 z-0 grayscale-[0.4] contrast-[1.1] brightness-[0.8]">
                <MapView mode="emergency" />
              </div>
            </div>

            {/* Right Column: Tracking Timeline and Telemetry */}
            <div className="lg:col-span-1 bg-[#0c0c0c] p-6 flex flex-col justify-between h-[600px] border-t lg:border-t-0 border-white/5 overflow-y-auto">
              <div className="space-y-6">
                <div>
                  <h3 className="text-xs font-black uppercase tracking-widest text-neutral-500 mb-1">Cylinder Logistics Registry</h3>
                  <p className="text-xs text-neutral-400">Dynamically tracks active provider route telemetry within 10km.</p>
                </div>

                {/* 10km radius overview box */}
                <div className="bg-white/[0.02] border border-white/5 p-4 rounded-2xl space-y-2">
                  <div className="flex items-center gap-2">
                    <ListFilter className="w-4 h-4 text-amber-500" />
                    <h4 className="text-xs font-black uppercase tracking-wider">10km Area Telemetry</h4>
                  </div>
                  <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
                    <div>
                      <p className="text-neutral-500 text-[10px] uppercase font-black">Active Resellers</p>
                      <p className="text-lg font-black text-white mt-0.5">{providerCount} providers</p>
                    </div>
                    <div>
                      <p className="text-neutral-500 text-[10px] uppercase font-black">Pending SOS</p>
                      <p className="text-lg font-black text-red-400 mt-0.5">{emergencies.length} cases</p>
                    </div>
                  </div>
                </div>

                {/* Tracking order detailed status timeline */}
                <div className="bg-white/[0.02] border border-white/5 p-5 rounded-2xl space-y-4">
                  <div className="flex items-center gap-2">
                    <ClipboardList className="w-4 h-4 text-emerald-500" />
                    <h4 className="text-xs font-black uppercase tracking-wider text-neutral-300">Active Request Tracking</h4>
                  </div>

                  <div className="space-y-3 text-xs text-neutral-300">
                    <div className="flex justify-between">
                      <span className="text-neutral-500">Logistics Status:</span>
                      <span className="font-bold text-white capitalize">{trackingRequest?.status || 'Pending Dispatch'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-500">Assigned Carrier:</span>
                      <span className="font-bold text-white">{trackingProvider?.name || 'Awaiting carrier'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-500">Cylinder Rating:</span>
                      <span className="font-bold text-white">{trackingRequest?.intensity || 'Standard'}</span>
                    </div>
                  </div>

                  {/* Visual timeline indicators */}
                  <div className="pt-4 flex items-center justify-between relative">
                    <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-0.5 bg-neutral-800 z-0"></div>
                    <div className={`w-3.5 h-3.5 rounded-full z-10 border-2 ${
                      trackingRequest ? 'bg-emerald-500 border-emerald-400' : 'bg-neutral-800 border-neutral-700'
                    }`}></div>
                    <div className={`w-3.5 h-3.5 rounded-full z-10 border-2 ${
                      trackingRequest?.status === 'assigned' || trackingRequest?.status === 'resolved'
                        ? 'bg-emerald-500 border-emerald-400'
                        : 'bg-neutral-800 border-neutral-700'
                    }`}></div>
                    <div className={`w-3.5 h-3.5 rounded-full z-10 border-2 ${
                      trackingRequest?.status === 'resolved' ? 'bg-emerald-500 border-emerald-400' : 'bg-neutral-800 border-neutral-700'
                    }`}></div>
                  </div>
                  <div className="flex justify-between text-[8px] font-black uppercase tracking-widest text-neutral-500">
                    <span>1. Created</span>
                    <span>2. Dispatched</span>
                    <span>3. Completed</span>
                  </div>
                </div>
              </div>

              {/* Dynamic Information Banner */}
              <div className="mt-4 p-4 bg-white/[0.01] border border-white/5 rounded-2xl flex gap-2 text-xs text-neutral-400 leading-relaxed">
                <Info className="w-4 h-4 text-neutral-500 flex-shrink-0 mt-0.5" />
                <span>
                  Telemetry syncs every 10 seconds. Live reseller vectors update dynamically as transport agents cross geographic coordinates.
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </RoleHub>
  );
}

export default function ConsumerHome() {
  return (
    <AuthenticatedRoute>
      <ConsumerHomeContent />
    </AuthenticatedRoute>
  );
}
