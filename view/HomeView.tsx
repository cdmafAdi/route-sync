
import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin, TrendingUp, Bus, Train, Car, ChevronRight, Navigation, Zap, LocateFixed, Eye, EyeOff, Info, Clock, Gauge, Target, Radio, Hourglass, ShieldAlert, ShieldCheck, AlertTriangle, IndianRupee, ArrowLeft, History, Star, Users, Map as MapIcon } from 'lucide-react';
import L from 'leaflet';
import { METRO_PURPLE_COORDS, METRO_AQUA_COORDS, BUS_ROUTE_10_PATH, BUS_ROUTE_1_PATH, BUS_ROUTE_5_PATH, CAB_ROUTE_AIRPORT_PATH, PMPML_BUSES } from '../constants';

// Extending the Window interface for simulation states
declare global {
  interface Window {
    hazardEnabled: boolean;
    wasDeviated: boolean;
  }
}

// Haversine distance for realistic tracking
const getDistance = (p1: { lat: number, lng: number }, p2: { lat: number, lng: number }) => {
  const R = 6371e3;
  const phi1 = p1.lat * Math.PI / 180;
  const phi2 = p2.lat * Math.PI / 180;
  const dphi = (p2.lat - p1.lat) * Math.PI / 180;
  const dlambda = (p2.lng - p1.lng) * Math.PI / 180;
  const a = Math.sin(dphi / 2) * Math.sin(dphi / 2) +
            Math.cos(phi1) * Math.cos(phi2) *
            Math.sin(dlambda / 2) * Math.sin(dlambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const HomeView: React.FC = () => {
  const [isSearching, setIsSearching] = useState(false);
  const [from, setFrom] = useState('My Current Location');
  const [to, setTo] = useState('');
  const [viewState, setViewState] = useState<'idle' | 'selecting' | 'active'>('idle');
  const [selectedService, setSelectedService] = useState('lite');
  
  const [simDetails, setSimDetails] = useState({ 
    speed: 0, 
    eta: '--', 
    distance: '--',
    location: '--',
    fare: 0,
    status: 'Ready'
  });
  
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const simulationLayer = useRef<L.LayerGroup | null>(null);
  const simulationInterval = useRef<number | null>(null);

  const services = [
    { id: 'auto', name: 'Sync Auto', price: 1.1, icon: Zap, eta: '2 min', capacity: 3, desc: 'Fastest in traffic' },
    { id: 'lite', name: 'Sync Lite', price: 1.5, icon: Car, eta: '4 min', capacity: 4, desc: 'Everyday affordable' },
    { id: 'premier', name: 'Sync Premier', price: 2.2, icon: Star, eta: '6 min', capacity: 4, desc: 'Top-rated sedans' },
  ];

  const startRideSimulation = (path: any[], mode: 'cab' | 'auto') => {
    if (!mapInstance.current || !simulationLayer.current) return;
    
    simulationLayer.current.clearLayers();
    if (simulationInterval.current) clearInterval(simulationInterval.current);
    setViewState('active');

    const segmentDistances = path.slice(0, -1).map((point, i) => getDistance(point, path[i + 1]));
    const totalDistKm = segmentDistances.reduce((a, b) => a + b, 0) / 1000;

    // Draw active route line
    L.polyline(path.map(p => [p.lat, p.lng]), {
      color: '#000000',
      weight: 4,
      opacity: 0.9,
      dashArray: '1, 12'
    }).addTo(simulationLayer.current);

    const icon = L.divIcon({
      className: 'nav-marker',
      html: `<div class="relative">
               <div class="bg-black text-white p-2.5 rounded-full border-2 border-white shadow-2xl transform rotate-45 transition-transform duration-300">
                 <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z"/></svg>
               </div>
               <div class="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></div>
             </div>`,
      iconSize: [40, 40]
    });

    const marker = L.marker([path[0].lat, path[0].lng], { icon }).addTo(simulationLayer.current);
    
    let currentIdx = 0;
    let progress = 0;
    const intervalMs = 100;
    const speedKmph = mode === 'auto' ? 35 : 50; 
    const velocityMps = (speedKmph * 1000) / 3600;

    simulationInterval.current = window.setInterval(() => {
      const p1 = path[currentIdx];
      const p2 = path[(currentIdx + 1) % path.length];
      const dist = segmentDistances[currentIdx];
      const delta = (velocityMps * (intervalMs / 1000)) / dist;
      
      progress += delta;

      if (progress >= 1) {
        progress = 0;
        currentIdx = (currentIdx + 1) % (path.length - 1);
        if (currentIdx === 0) marker.setLatLng([path[0].lat, path[0].lng]);
      }

      const lat = path[currentIdx].lat + (path[(currentIdx + 1) % path.length].lat - path[currentIdx].lat) * progress;
      const lng = path[currentIdx].lng + (path[(currentIdx + 1) % path.length].lng - path[currentIdx].lng) * progress;
      
      marker.setLatLng([lat, lng]);

      const remainingDist = (1 - progress) * dist + segmentDistances.slice(currentIdx + 1).reduce((a, b) => a + b, 0);
      const serviceObj = services.find(s => s.id === selectedService);
      const fareMultiplier = serviceObj?.price || 1;

      setSimDetails({
        speed: speedKmph,
        distance: `${(remainingDist / 1000).toFixed(1)} km`,
        eta: `${Math.ceil(remainingDist / velocityMps / 60)} min`,
        location: path[currentIdx].name,
        fare: Math.floor((40 + totalDistKm * 18) * fareMultiplier),
        status: 'In Journey'
      });
    }, intervalMs);

    mapInstance.current.fitBounds(L.polyline(path.map(p => [p.lat, p.lng])).getBounds(), { padding: [120, 120] });
  };

  const selectDestination = (dest: string) => {
    setTo(dest);
    setIsSearching(false);
    setViewState('selecting');
    
    // Preview path
    const path = dest.toLowerCase().includes('airport') ? CAB_ROUTE_AIRPORT_PATH : BUS_ROUTE_1_PATH;
    if (mapInstance.current && simulationLayer.current) {
       simulationLayer.current.clearLayers();
       L.polyline(path.map(p => [p.lat, p.lng]), { color: '#94a3b8', weight: 3, dashArray: '10, 10' }).addTo(simulationLayer.current);
       mapInstance.current.fitBounds(L.polyline(path.map(p => [p.lat, p.lng])).getBounds(), { padding: [100, 100] });
    }
  };

  useEffect(() => {
    if (mapRef.current && !mapInstance.current) {
      mapInstance.current = L.map(mapRef.current, { zoomControl: false, attributionControl: false }).setView([18.5204, 73.8567], 13);
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png').addTo(mapInstance.current);
      simulationLayer.current = L.layerGroup().addTo(mapInstance.current);
      
      const userIcon = L.divIcon({ className: 'user-pulse-icon', html: `<div class="user-pulse"></div>`, iconSize: [12, 12] });
      L.marker([18.5204, 73.8567], { icon: userIcon }).addTo(mapInstance.current);
    }
  }, []);

  return (
    <div className="relative h-full w-full overflow-hidden bg-slate-50">
      {/* FULL SCREEN MAP */}
      <div ref={mapRef} className="absolute inset-0 z-0" />

      {/* TOP NAVIGATION OVERLAY */}
      <div className="absolute top-0 left-0 right-0 z-20 p-4 pointer-events-none">
        <div className="mx-auto max-w-md w-full space-y-3 pointer-events-auto">
          {viewState === 'active' ? (
            <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-slate-100 p-5 flex items-center justify-between animate-in slide-in-from-top duration-500">
               <div className="flex items-center space-x-4">
                  <div className="bg-black text-white p-3.5 rounded-2xl shadow-lg animate-pulse">
                     {selectedService === 'auto' ? <Zap size={22} /> : <Car size={22} />}
                  </div>
                  <div>
                     <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{simDetails.status}</h4>
                     <p className="text-sm font-black text-slate-800 truncate max-w-[140px]">{simDetails.location}</p>
                  </div>
               </div>
               <div className="text-right">
                  <p className="text-2xl font-black text-indigo-600 leading-none">{simDetails.eta}</p>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter mt-1">{simDetails.distance} to destination</p>
               </div>
            </div>
          ) : (
            <>
              {/* Floating Header UI */}
              <div className="flex items-center space-x-3">
                 <button className="bg-white p-4 rounded-2xl shadow-xl border border-slate-100 text-slate-800 hover:bg-slate-50 transition-all active:scale-90">
                    <History size={20} />
                 </button>
                 <div 
                   onClick={() => setIsSearching(true)}
                   className="flex-1 bg-white p-4.5 rounded-2xl shadow-xl border border-slate-100 flex items-center space-x-4 cursor-pointer group hover:border-indigo-200 transition-all"
                 >
                    <div className="w-2.5 h-2.5 rounded-full bg-black shadow-lg"></div>
                    <span className="text-sm font-black text-slate-400 group-hover:text-slate-600 tracking-tight">Where to?</span>
                 </div>
              </div>

              {/* Instant Shortcuts */}
              <div className="flex space-x-2 overflow-x-auto scrollbar-hide">
                 {['Pune Airport', 'Railway Station', 'Shaniwar Wada', 'Phoenix Mall'].map(loc => (
                    <button 
                     key={loc}
                     onClick={() => selectDestination(loc)}
                     className="flex-shrink-0 bg-white/90 backdrop-blur-md px-5 py-2.5 rounded-full shadow-lg border border-slate-100 flex items-center space-x-2 text-[11px] font-black text-slate-700 hover:bg-white transition-all active:scale-95"
                    >
                       <MapPin size={14} className="text-indigo-500" />
                       <span>{loc}</span>
                    </button>
                 ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* FULL SCREEN SEARCH OVERLAY */}
      {isSearching && (
        <div className="absolute inset-0 z-50 bg-white animate-in slide-in-from-bottom duration-300 flex flex-col">
           <div className="p-6 border-b border-slate-100 flex items-center space-x-4">
              <button onClick={() => setIsSearching(false)} className="p-3 hover:bg-slate-50 rounded-2xl transition-all">
                 <ArrowLeft size={24} className="text-slate-800" />
              </button>
              <h2 className="text-2xl font-black text-slate-800 tracking-tight">Plan your journey</h2>
           </div>
           
           <div className="p-6 space-y-6 flex-1 overflow-y-auto">
              <div className="relative">
                 <div className="absolute left-5 top-1/2 -translate-y-1/2 flex flex-col items-center space-y-1.5">
                    <div className="w-2 h-2 rounded-full bg-slate-300"></div>
                    <div className="w-0.5 h-8 bg-slate-100"></div>
                    <div className="w-2.5 h-2.5 rounded-sm bg-black shadow-sm"></div>
                 </div>
                 <div className="ml-12 space-y-3">
                    <div className="relative group">
                       <input 
                         value={from}
                         onChange={(e) => setFrom(e.target.value)}
                         className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold text-slate-800 focus:outline-none focus:bg-white transition-all" 
                         placeholder="Current Location"
                       />
                       <button className="absolute right-4 top-1/2 -translate-y-1/2 text-indigo-500"><Navigation size={18} /></button>
                    </div>
                    <input 
                      autoFocus
                      value={to}
                      onChange={(e) => setTo(e.target.value)}
                      className="w-full bg-slate-100 border border-slate-200 rounded-2xl px-5 py-4 text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 ring-black/5 transition-all" 
                      placeholder="Enter destination"
                    />
                 </div>
              </div>

              <div className="space-y-4 pt-4">
                 <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-2">Suggestions</h4>
                 {[
                   { name: 'Pune Airport (PNQ)', area: 'Lohegaon', icon: MapPin },
                   { name: 'Shivaji Nagar Station', area: 'Shivajinagar', icon: Train },
                   { name: 'Swargate Bus Stand', area: 'Swargate', icon: Bus },
                   { name: 'Kothrud Depot', area: 'Kothrud', icon: MapPin }
                 ].map(loc => (
                   <button 
                    key={loc.name}
                    onClick={() => selectDestination(loc.name)}
                    className="w-full flex items-center space-x-5 p-4 hover:bg-slate-50 rounded-3xl transition-all border border-transparent hover:border-slate-100"
                   >
                      <div className="bg-slate-100 p-3 rounded-2xl text-slate-400"><loc.icon size={20} /></div>
                      <div className="text-left">
                         <p className="text-sm font-black text-slate-800">{loc.name}</p>
                         <p className="text-[10px] text-slate-400 font-black uppercase tracking-tight">{loc.area}, Pune</p>
                      </div>
                   </button>
                 ))}
              </div>
           </div>
        </div>
      )}

      {/* RIDE SELECTION DRAWER (UBER STYLE) */}
      {viewState === 'selecting' && (
        <div className="absolute bottom-0 left-0 right-0 z-30 bg-white rounded-t-[3rem] shadow-[0_-20px_60px_rgba(0,0,0,0.15)] animate-in slide-in-from-bottom-20 duration-500 border-t border-slate-100">
           {/* Handle */}
           <div className="w-14 h-1.5 bg-slate-200 rounded-full mx-auto mt-4 mb-2"></div>
           
           <div className="px-8 pb-3 border-b border-slate-50 flex items-center justify-between">
              <div>
                 <h3 className="text-xl font-black text-slate-800 tracking-tight">Choose your ride</h3>
                 <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mt-1">Available near you</p>
              </div>
              <div className="flex -space-x-2">
                 {[1,2,3].map(i => (
                    <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-slate-200 overflow-hidden shadow-sm">
                       <img src={`https://i.pravatar.cc/100?u=${i}`} alt="user" className="w-full h-full object-cover" />
                    </div>
                 ))}
                 <div className="w-8 h-8 rounded-full border-2 border-white bg-indigo-600 flex items-center justify-center text-[10px] text-white font-black shadow-lg">+4</div>
              </div>
           </div>

           <div className="max-h-[360px] overflow-y-auto px-5 py-4 space-y-3">
              {services.map((service) => (
                <button 
                  key={service.id}
                  onClick={() => setSelectedService(service.id)}
                  className={`w-full flex items-center justify-between p-4.5 rounded-[2rem] transition-all border-2 ${
                    selectedService === service.id 
                    ? 'border-black bg-slate-900 text-white shadow-2xl' 
                    : 'border-transparent bg-slate-50 hover:bg-slate-100 text-slate-800'
                  }`}
                >
                   <div className="flex items-center space-x-5">
                      <div className={`p-4 rounded-2xl transition-transform ${selectedService === service.id ? 'scale-110 bg-white/20 text-white' : 'bg-white shadow-sm text-slate-400'}`}>
                         <service.icon size={28} />
                      </div>
                      <div className="text-left">
                         <div className="flex items-center space-x-2">
                            <span className="font-black text-base tracking-tight">{service.name}</span>
                            {service.id === 'lite' && (
                              <span className={`text-[8px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-widest ${selectedService === service.id ? 'bg-indigo-500 text-white' : 'bg-indigo-50 text-indigo-600'}`}>Best Value</span>
                            )}
                         </div>
                         <p className={`text-[10px] font-bold ${selectedService === service.id ? 'text-slate-400' : 'text-slate-500'}`}>{service.desc}</p>
                         <p className={`text-[10px] font-black uppercase tracking-widest mt-1.5 ${selectedService === service.id ? 'text-indigo-400' : 'text-indigo-600'}`}>{service.eta} • <Users size={10} className="inline mr-1" />{service.capacity}</p>
                      </div>
                   </div>
                   <div className="text-right">
                      <p className={`text-xl font-black ${selectedService === service.id ? 'text-white' : 'text-slate-800'}`}>₹{Math.floor(120 * service.price)}</p>
                      <p className={`text-[9px] font-black uppercase ${selectedService === service.id ? 'text-slate-500 line-through' : 'text-slate-300'}`}>₹{Math.floor(160 * service.price)}</p>
                   </div>
                </button>
              ))}
           </div>

           <div className="p-7 pt-2 bg-white space-y-4">
              <div className="flex items-center justify-between bg-slate-50 p-4 rounded-3xl border border-slate-100 group cursor-pointer hover:bg-indigo-50 transition-all">
                 <div className="flex items-center space-x-4">
                    <div className="bg-white p-2.5 rounded-xl shadow-sm text-indigo-600"><IndianRupee size={18} /></div>
                    <div>
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Payment</p>
                       <p className="text-xs font-black text-slate-800">Route Sync Pay • **** 4242</p>
                    </div>
                 </div>
                 <button className="text-[10px] font-black text-indigo-600 uppercase tracking-widest bg-white px-3 py-1.5 rounded-lg shadow-sm border border-indigo-100">Switch</button>
              </div>

              <button 
                onClick={() => {
                   const path = to.toLowerCase().includes('airport') ? CAB_ROUTE_AIRPORT_PATH : BUS_ROUTE_1_PATH;
                   startRideSimulation(path, selectedService === 'auto' ? 'auto' : 'cab');
                }}
                className="w-full bg-black text-white font-black py-5 rounded-[1.5rem] shadow-2xl shadow-slate-900/30 active:scale-95 transition-all flex items-center justify-center space-x-4 hover:bg-slate-800"
              >
                 <span className="text-lg">Confirm {services.find(s => s.id === selectedService)?.name}</span>
                 <div className="bg-white/20 p-1.5 rounded-lg"><ArrowLeft size={20} className="rotate-180" /></div>
              </button>
           </div>
        </div>
      )}

      {/* TRIP ACTIVE OVERLAY - SECONDARY HUD */}
      {viewState === 'active' && (
        <div className="absolute bottom-6 left-6 right-6 z-20 animate-in slide-in-from-bottom-10 duration-700">
           <div className="bg-white p-6 rounded-[2.5rem] shadow-2xl border border-slate-100 flex items-center justify-between">
              <div className="flex items-center space-x-5">
                 <div className="w-14 h-14 bg-slate-900 rounded-3xl flex items-center justify-center text-white shadow-xl relative">
                    {selectedService === 'auto' ? <Zap size={28} /> : <Car size={28} />}
                    <div className="absolute -top-2 -right-2 bg-emerald-500 text-[8px] font-black text-white px-1.5 py-0.5 rounded-md border-2 border-white">SYNCED</div>
                 </div>
                 <div>
                    <h4 className="text-xl font-black text-slate-800 tracking-tight">MH 12 AB 4545</h4>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] flex items-center space-x-2">
                      <Star size={10} className="text-amber-400 fill-amber-400" />
                      <span>4.9 • Rahul D.</span>
                    </p>
                 </div>
              </div>
              <div className="flex space-x-2">
                 <button className="bg-rose-50 p-4 rounded-2xl text-rose-500 border border-rose-100 hover:bg-rose-500 hover:text-white transition-all shadow-sm">
                    <ShieldAlert size={22} />
                 </button>
                 <button className="bg-slate-900 p-4 rounded-2xl text-white shadow-xl hover:bg-slate-800 transition-all">
                    <Navigation size={22} />
                 </button>
              </div>
           </div>
        </div>
      )}

      {/* FLOATING ACTION: RECENTER */}
      <button 
        onClick={() => mapInstance.current?.setView([18.5204, 73.8567], 15)}
        className={`absolute bottom-32 right-6 z-20 bg-white p-4.5 rounded-[1.5rem] shadow-2xl border border-slate-100 text-slate-800 hover:bg-slate-50 active:scale-90 transition-all ${viewState === 'active' ? 'bottom-40' : 'bottom-32'}`}
      >
        <LocateFixed size={24} />
      </button>
      
      {/* MAP MODE TOGGLE */}
      <button 
        className="absolute top-28 right-6 z-20 bg-white/90 backdrop-blur-sm p-3.5 rounded-2xl shadow-xl border border-slate-100 text-slate-500 hover:text-indigo-600 transition-all"
        onClick={() => {
           if (mapInstance.current) {
              const currentZoom = mapInstance.current.getZoom();
              mapInstance.current.setZoom(currentZoom === 13 ? 16 : 13);
           }
        }}
      >
        <MapIcon size={20} />
      </button>
    </div>
  );
};

export default HomeView;
