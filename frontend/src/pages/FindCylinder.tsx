import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MapView } from '@/components/MapView';
import { mockMarkers } from '@/lib/mockData';

export default function FindCylinder() {
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState<'all' | 'verified'>('all');
  const navigate = useNavigate();

  // Filter cylinder markers dynamically
  const cylinderMarkers = mockMarkers.filter(m => {
    if (m.type !== 'cylinder') return false;
    
    // Filter by verification status (simulated by stock > 60%)
    if (filterMode === 'verified' && (m.stock || 0) < 60) {
      return false;
    }
    
    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const nameMatch = m.ownerName?.toLowerCase().includes(query);
      const priceMatch = m.price?.toLowerCase().includes(query);
      if (!nameMatch && !priceMatch) return false;
    }
    
    return true;
  });

  return (
    <div className="h-screen w-full bg-surface text-on-surface flex flex-col font-body overflow-hidden selection:bg-white selection:text-black">
      
      {/* Modern Header / Navigator */}
      <nav className="fixed top-0 w-full z-50 bg-[#131313]/80 backdrop-blur-xl border-b border-white/5 flex justify-between items-center px-8 h-16 shadow-[0_20px_40px_rgba(0,0,0,0.4)]">
        <div className="flex items-center gap-6">
          <button 
            onClick={() => navigate('/dashboard')}
            className="p-2 hover:bg-white/10 rounded-md transition-all text-on-surface-variant flex items-center justify-center"
          >
            <span className="material-symbols-outlined !text-xl">arrow_back</span>
          </button>
          <div className="text-xl font-bold tracking-tighter text-white font-headline">Find LPG</div>
        </div>

        <div className="flex-1 max-w-xl px-12 relative group hidden md:block">
          <span className="material-symbols-outlined absolute left-15 top-1/2 -translate-y-1/2 text-on-surface-variant/30 !text-sm">search</span>
          <input 
            className="w-full bg-surface-container-low border-none rounded-lg pl-10 pr-4 py-2 text-sm focus:ring-1 focus:ring-white/10 transition-all text-white placeholder:text-on-surface-variant/20" 
            placeholder="Search neighborhood or agency..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2">
          <div className="bg-surface-container-low p-1 rounded-lg border border-white/5 flex">
            <button 
              className={`px-4 py-1.5 rounded-md text-xs font-bold flex items-center gap-2 transition-all ${viewMode === 'list' ? 'bg-white text-black shadow-lg' : 'text-on-surface-variant hover:text-white'}`}
              onClick={() => setViewMode('list')}
            >
              <span className="material-symbols-outlined !text-sm">view_agenda</span> List
            </button>
            <button 
              className={`px-4 py-1.5 rounded-md text-xs font-bold flex items-center gap-2 transition-all ${viewMode === 'map' ? 'bg-white text-black shadow-lg' : 'text-on-surface-variant hover:text-white'}`}
              onClick={() => setViewMode('map')}
            >
              <span className="material-symbols-outlined !text-sm">map</span> Map
            </button>
          </div>
          <button 
            onClick={() => setFilterMode(prev => prev === 'all' ? 'verified' : 'all')}
            className={`p-2 rounded-md transition-all flex items-center justify-center border ml-2 ${
              filterMode === 'verified' 
                ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-300' 
                : 'hover:bg-white/10 text-on-surface-variant border-white/5'
            }`}
            title={filterMode === 'verified' ? 'Showing Verified Only' : 'Show All'}
          >
            <span className="material-symbols-outlined !text-xl">filter_list</span>
          </button>
        </div>
      </nav>

      <div className="flex-1 relative overflow-hidden pt-16">
        {/* VIEW: MAP */}
        <div className={`absolute inset-0 transition-opacity duration-700 ${viewMode === 'map' ? 'opacity-100 z-0' : 'opacity-0 -z-10 pointer-events-none'}`}>
          <div className="w-full h-full grayscale-[0.3] contrast-[1.1]">
            <MapView mode="discovery" />
          </div>
        </div>

        {/* VIEW: LIST (Glass Overlay) */}
        <AnimatePresence>
          {viewMode === 'list' && (
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="absolute inset-0 z-10 overflow-hidden bg-surface/40 backdrop-blur-md border-t border-white/5"
            >
               <div className="h-full overflow-y-auto p-8 md:p-12 max-w-6xl mx-auto custom-scrollbar">
                  <div className="flex items-center justify-between mb-10">
                    <h2 className="text-2xl font-headline font-black text-white tracking-tight">Cylinders Available Near You</h2>
                    <span className="text-xs font-black uppercase tracking-[0.2em] text-on-surface-variant/60">{cylinderMarkers.length} Results found</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                     {cylinderMarkers.map((c, i) => (
                       <motion.div 
                        key={c.id}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                       >
                         <div className="hub-glass glass-edge p-6 rounded-2xl group hover:-translate-y-2 transition-all duration-500 border border-white/5 shadow-2xl">
                           <div className="flex justify-between items-start mb-6">
                             <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-white group-hover:scale-110 transition-transform duration-500">
                               <span className="material-symbols-outlined !text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>gas_meter</span>
                             </div>
                             <span className="bg-emerald-500/10 text-emerald-400 text-[10px] font-black tracking-widest px-3 py-1 rounded-full uppercase border border-emerald-500/20">Verified</span>
                           </div>
                           
                           <h3 className="text-xl font-headline font-extrabold text-white mb-2 leading-tight">{c.ownerName || 'Independent Station'}</h3>
                           <div className="flex items-center gap-4 mb-6">
                             <p className="text-xs text-on-surface-variant flex items-center gap-1.5">
                               <span className="material-symbols-outlined !text-sm">location_on</span>
                               {`${(((c.position.lat - 19.1075) ** 2 + (c.position.lng - 72.8258) ** 2) ** 0.5 * 111).toFixed(1)} km away`}
                             </p>
                             <p className="text-xs text-on-surface-variant flex items-center gap-1.5">
                               <span className="material-symbols-outlined !text-sm">schedule</span>
                               Open now
                             </p>
                           </div>

                           <div className="pt-6 border-t border-white/5 flex items-center justify-between">
                             <div>
                               <p className="text-[10px] text-on-surface-variant uppercase tracking-widest font-black mb-1">Stock</p>
                               <p className="text-sm font-bold text-white">{c.stock ? `In Stock (${c.stock}%)` : 'In Stock'}</p>
                             </div>
                             <button 
                               onClick={() => navigate(`/booking/${c.id}`)}
                               className="bg-white text-black px-5 py-2 rounded font-black text-xs hover:bg-[#C9C6C0] active:scale-95 transition-all"
                             >
                               Request
                             </button>
                           </div>
                         </div>
                       </motion.div>
                     ))}
                  </div>
                  
                  {cylinderMarkers.length === 0 && (
                    <div className="h-96 flex flex-col items-center justify-center text-center">
                      <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center text-on-surface-variant mb-6">
                        <span className="material-symbols-outlined !text-4xl">search_off</span>
                      </div>
                      <h3 className="text-xl font-headline font-bold text-white mb-2">No Cylinders Found</h3>
                      <p className="text-on-surface-variant max-w-sm">We couldn't find any resources matching your search in this area. Try adjusting your filters.</p>
                    </div>
                  )}
               </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
