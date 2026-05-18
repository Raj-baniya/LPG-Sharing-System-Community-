import React, { useState } from 'react';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import { mapCategories, mapPoints } from './mapData';
import { Compass, MapPin, ZoomIn, ZoomOut } from 'lucide-react';

export default function MumbaiMap() {
  const [activeCategory, setActiveCategory] = useState(null);
  const [hoveredPoint, setHoveredPoint] = useState(null);

  return (
    <div className="flex h-screen w-full bg-[#0F1115] text-gray-200 overflow-hidden font-sans">

      {/* LEFT SIDEBAR: Legend & Filter Panel */}
      <div className="w-1/4 h-full bg-[#14171F] border-r border-gray-800 p-6 flex flex-col justify-between z-10 shadow-2xl">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-white uppercase m-0">
            Opportunities
          </h1>
          <p className="text-xs font-semibold tracking-widest text-gray-400 uppercase mt-1 mb-8">
            Urban Metabolism Mumbai
          </p>

          <div className="space-y-6">
            {Object.entries(mapCategories).map(([key, value]) => (
              <div
                key={key}
                className={`p-3 rounded-lg cursor-pointer transition-all border ${
                  activeCategory === key
                    ? 'bg-gray-800/60 border-gray-700'
                    : 'bg-transparent border-transparent hover:bg-gray-800/30'
                }`}
                onClick={() => setActiveCategory(activeCategory === key ? null : key)}
              >
                <div className="text-xs font-bold uppercase tracking-wider text-gray-400">
                  {value.sub}
                </div>
                <div className="flex items-center gap-3 mt-1">
                  <span
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: value.color }}
                  />
                  <span className="text-base font-bold text-white">{value.title}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Dynamic Tooltip Display in Sidebar */}
        <div className="bg-[#1A1D26] p-4 rounded-xl border border-gray-800 min-h-[100px] flex flex-col justify-center">
          {hoveredPoint ? (
            <div>
              <span
                className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
                style={{
                  backgroundColor: `${mapCategories[hoveredPoint.category].color}22`,
                  color: mapCategories[hoveredPoint.category].color
                }}
              >
                {mapCategories[hoveredPoint.category].title}
              </span>
              <p className="text-sm font-semibold text-white mt-2">{hoveredPoint.label}</p>
            </div>
          ) : (
            <p className="text-xs text-gray-500 italic text-center">
              Hover over any map marker to view structural data insights.
            </p>
          )}
        </div>
      </div>

      {/* RIGHT SIDE: Interactive Map Viewport */}
      <div className="relative flex-1 h-full bg-[#0B0C10]">

        {/* Map Controls — wired to TransformWrapper via render props */}
        <TransformWrapper
          initialScale={1}
          initialPositionX={0}
          initialPositionY={0}
          minScale={0.8}
          maxScale={4}
        >
          {({ zoomIn, zoomOut, resetTransform }) => (
            <>
              {/* Zoom Buttons */}
              <div className="absolute top-6 right-6 flex flex-col gap-2 z-20">
                <button
                  onClick={() => zoomIn()}
                  className="p-2.5 bg-[#14171F] border border-gray-800 rounded-lg text-gray-400 hover:text-white transition-colors"
                  title="Zoom In"
                >
                  <ZoomIn size={18} />
                </button>
                <button
                  onClick={() => zoomOut()}
                  className="p-2.5 bg-[#14171F] border border-gray-800 rounded-lg text-gray-400 hover:text-white transition-colors"
                  title="Zoom Out"
                >
                  <ZoomOut size={18} />
                </button>
                <button
                  onClick={() => resetTransform()}
                  className="p-2.5 bg-[#14171F] border border-gray-800 rounded-lg text-gray-400 hover:text-white transition-colors"
                  title="Reset View"
                >
                  <Compass size={18} />
                </button>
              </div>

              {/* Canvas Engine */}
              <TransformComponent
                wrapperStyle={{ width: '100%', height: '100%' }}
                contentStyle={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <div className="relative w-[800px] h-[1000px] select-none">

                  {/* BASE LAYER: Custom Stylized SVG Map */}
                  <svg
                    className="w-full h-full object-contain"
                    style={{ filter: 'drop-shadow(0 10px 30px rgba(0,0,0,0.8))' }}
                    viewBox="0 0 800 1000"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    {/* Deep background water */}
                    <rect width="800" height="1000" fill="#0B0C10" />

                    {/* Mumbai Landmass Geometry */}
                    <path
                      d="M300 100 C350 120, 380 200, 400 300 C420 400, 500 450, 480 550 C460 650, 440 700, 420 800 C400 880, 370 920, 350 950 L330 950 C340 900, 330 850, 310 800 C290 750, 270 650, 300 550 C320 480, 280 400, 260 300 C240 200, 260 120, 300 100 Z"
                      fill="#1C2029"
                      stroke="#2D3446"
                      strokeWidth="2"
                    />

                    {/* Eco Parks & Forest Layer */}
                    <path
                      d="M360 220 C380 240, 420 250, 410 320 C400 380, 350 360, 340 300 Z"
                      fill="#2A3B22"
                      opacity="0.7"
                    />

                    {/* Grid / Infrastructure Overlay */}
                    <path d="M300 100 L350 950" stroke="#3A4454" strokeWidth="0.5" strokeDasharray="4,4" />
                    <path d="M260 300 L480 550" stroke="#3A4454" strokeWidth="0.5" strokeDasharray="4,4" />
                  </svg>

                  {/* DATA OVERLAY LAYER: Interactive Markers */}
                  {mapPoints.map((point) => {
                    const isDimmed = activeCategory && point.category !== activeCategory;
                    const isHovered = hoveredPoint?.id === point.id;
                    const color = mapCategories[point.category].color;

                    return (
                      <div
                        key={point.id}
                        className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer z-10"
                        style={{
                          left: `${point.x}%`,
                          top: `${point.y}%`,
                          opacity: isDimmed ? 0.15 : 1,
                          transform: `translate(-50%, -50%) scale(${isHovered ? 1.25 : 1})`,
                          transition: 'opacity 0.3s ease, transform 0.2s ease'
                        }}
                        onMouseEnter={() => setHoveredPoint(point)}
                        onMouseLeave={() => setHoveredPoint(null)}
                      >
                        {/* Pulsing Aura */}
                        <span
                          className="absolute inline-flex h-7 w-7 rounded-full opacity-40 animate-ping"
                          style={{ backgroundColor: color, top: 0, left: 0 }}
                        />

                        {/* Core Marker */}
                        <div
                          className="relative w-7 h-7 rounded-full flex items-center justify-center border-2 border-[#0F1115] shadow-lg text-white font-bold text-xs"
                          style={{ backgroundColor: color }}
                        >
                          <MapPin size={12} fill="white" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </TransformComponent>
            </>
          )}
        </TransformWrapper>

        {/* MAP SCALE & COMPASS */}
        <div className="absolute bottom-6 right-6 flex items-center gap-6 bg-[#14171F]/80 backdrop-blur-md p-4 rounded-xl border border-gray-800 pointer-events-none z-20">
          <div className="flex flex-col items-center gap-1">
            <Compass size={24} className="text-gray-500" />
            <span className="text-[9px] tracking-widest text-gray-500 font-bold">N</span>
          </div>
          <div className="h-8 w-px bg-gray-700" />
          <div>
            <div className="flex justify-between text-[10px] text-gray-400 font-mono mb-1">
              <span>0</span>
              <span>15</span>
              <span>30 km</span>
            </div>
            <div className="w-24 h-1 border-b border-x border-gray-400" />
          </div>
        </div>

      </div>
    </div>
  );
}
