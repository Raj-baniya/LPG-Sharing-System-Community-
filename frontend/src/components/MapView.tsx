import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { getMarkers, MarkerData } from '../lib/mockData';
import { useTheme } from '../context/ThemeContext';

// Helper to update map center dynamically
function ChangeView({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
}

// Custom DivIcons for modern look
const createHtmlIcon = (type: string, img?: string) => {
  let content = '';
  if (type === 'user') {
    content = `<div class="w-8 h-8 rounded-full bg-white border-4 border-black/20 shadow-2xl flex items-center justify-center animate-pulse">
                <div class="w-2 h-2 bg-black rounded-full"></div>
               </div>`;
  } else if (type === 'emergency') {
    content = `<div class="relative group">
                <div class="absolute -inset-4 bg-red-500/30 rounded-full blur-xl animate-pulse"></div>
                <div class="relative bg-red-600 text-white w-8 h-8 rounded-full border-2 border-surface flex items-center justify-center shadow-lg active:scale-90 transition-all">
                  <span class="material-symbols-outlined !text-sm">priority_high</span>
                </div>
               </div>`;
  } else if (type === 'cylinder') {
    content = `<div class="relative group">
                <div class="absolute -inset-4 bg-emerald-500/10 rounded-full blur-xl"></div>
                <div class="relative bg-[#131313] text-white w-10 h-10 rounded-full flex items-center justify-center shadow-lg border-2 border-white/20 active:scale-90 transition-transform overflow-hidden">
                  <img src="${img || 'https://lh3.googleusercontent.com/aida-public/AB6AXuAwyqWqo7k-o3a7le2NPd1aXrSehP1cR9DX7LMWev0qOxnhYl47UXLPSJSkLBQUgo_C5keAENuuQNYBH0CTWh3Ho9bV54sAeDCpvGDO8feTcuci-Fqi7uWjzKcJl6NykgbAwPIdK7I-O9EBToyfFMHaaEhMTXRy8Uzkq89JLXlciApUrfS8zdZMh5CS57gkxSMpeDZ9uKfgtDAG_zGfzDg07lLzcG7LXbcmnscmmvKVSYFbnxpPNwNcDUbCf019NsX5yDsxXee5hg'}" class="w-full h-full object-cover">
                </div>
               </div>`;
  } else {
    content = `<div class="bg-primary text-on-primary w-10 h-10 rounded-full flex items-center justify-center shadow-lg border-2 border-surface active:scale-90 transition-transform">
                  <span class="material-symbols-outlined">local_gas_station</span>
                </div>`;
  }

  return L.divIcon({
    html: content,
    className: 'custom-leaflet-marker',
    iconSize: [40, 40],
    iconAnchor: [20, 20],
  });
};

export function MapView({ mode = 'discovery' }: { mode?: 'discovery' | 'emergency' }) {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [markers, setMarkers] = useState<MarkerData[]>([]);

  const tileUrl = theme === 'dark'
    ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
    : "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png";

  // Map markers remain static for realistic placement
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const latLng: [number, number] = [position.coords.latitude, position.coords.longitude];
          setUserLocation(latLng);
          setMarkers(getMarkers(latLng));
        },
        () => {
          const defaultLoc: [number, number] = [19.1075, 72.8258];
          setUserLocation(defaultLoc);
          setMarkers(getMarkers(defaultLoc));
        }
      );
    } else {
      const defaultLoc: [number, number] = [19.1075, 72.8258];
      setUserLocation(defaultLoc);
      setMarkers(getMarkers(defaultLoc));
    }
  }, []);

  if (!userLocation) {
    return (
      <div className="h-full w-full bg-[#0e0e0e] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-2 border-white/10 border-t-white rounded-full animate-spin"></div>
          <span className="text-white/40 font-headline text-xs uppercase tracking-widest font-black">Syncing Geo-Node...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full relative z-0">
      <MapContainer center={userLocation} zoom={15} className="h-full w-full bg-[#0e0e0e]" zoomControl={false}>
        <ChangeView center={userLocation} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url={tileUrl}
        />

        {/* User Marker */}
        <Marker position={userLocation} icon={createHtmlIcon('user')}>
          <Popup className="lumina-popup">
            <div className="text-black font-bold p-1">Your Location</div>
          </Popup>
        </Marker>

        {/* Dynamic Markers */}
        {markers
          .filter(m => mode === 'emergency' ? (m.type === 'mechanic' || m.type === 'emergency') : m.type === 'cylinder')
          .map((m) => (
            <Marker
              key={m.id}
              position={[m.position.lat, m.position.lng]}
              icon={createHtmlIcon(m.type)}
            >
              <Popup className="lumina-popup">
                <div className="w-[280px] p-0 m-0 overflow-hidden bg-transparent border-none">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-headline font-bold text-white leading-tight">
                        {m.type === 'emergency' ? 'Critical Need' : m.ownerName || 'Station Depot'}
                        {m.type !== 'emergency' && (
                          <span className="inline-flex items-center ml-2 bg-blue-500/20 text-blue-400 text-[9px] px-1.5 py-0.5 rounded-sm border border-blue-500/30 font-bold uppercase tracking-wider">
                            <span className="material-symbols-outlined text-[10px] mr-0.5" style={{ fontVariationSettings: "'FILL' 1, 'wght' 700" }}>verified</span>Verified
                          </span>
                        )}
                      </h3>
                      <p className="text-[10px] text-white/50">{m.type === 'emergency' ? 'Action Required' : `LPG Fill Level: ${m.stock || 0}%`}</p>
                    </div>
                    <span className={`text-[9px] px-2 py-0.5 rounded-full uppercase tracking-widest font-black ${m.type === 'emergency' ? 'bg-red-500 text-white' : 'bg-white/10 text-white'}`}>
                      {m.type === 'emergency' ? 'URGENT' : 'IN STOCK'}
                    </span>
                  </div>

                  <div className="aspect-video w-full rounded-lg overflow-hidden mb-3 bg-white/5">
                    <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuAMRxzITWvNs3-beaoFwGQq2kCw34uwn_CbqRydnxVN4y3kqRHV4NvFgJapCNd9XcgJZ36aPrT0V6JqhZoKO9jWOb3YD1KXoHiI4Eiwu4HWWHqVLnXPm7fxc6hU3-wm73v6_-Y0O9eymp1a4JKWiCYj8mznRCNjB7olx9kEVyA1a3vU6eD_wEGX-Kc_sAYilAaKtEp-b4oP5qT_4vHg0FHPfQoRIMrwmCyPxOVzR3rQK4_rRZHhn0fHY3ZD-E4CtGJ-nG2HZdVF-g" className="w-full h-full object-cover" />
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">{m.price || '₹850'} <span className="text-[9px] font-normal text-white/40">/ refill</span></span>
                    <button
                      onClick={() => navigate(`/booking/${m.id}`, {
                        state: { owner: m.ownerName, price: m.price, fill: `${m.stock}%` }
                      })}
                      className="text-[10px] font-black text-white px-3 py-1 bg-white/10 rounded hover:bg-white/20 transition-all flex items-center gap-1 uppercase tracking-tight"
                    >
                      View Details
                      <span className="material-symbols-outlined !text-[12px]">arrow_forward</span>
                    </button>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
      </MapContainer>

      <style>{`
        .lumina-popup .leaflet-popup-content-wrapper {
          background: rgba(19, 19, 19, 0.7);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          color: white;
          padding: 8px;
          box-shadow: 0 20px 40px rgba(0,0,0,0.4);
        }
        .lumina-popup .leaflet-popup-tip {
          background: rgba(19, 19, 19, 0.7);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        .lumina-popup .leaflet-popup-content {
          margin: 8px;
        }
        .custom-leaflet-marker {
          background: transparent;
          border: none;
        }
      `}</style>
    </div>
  );
}
