
import React, { useState, useEffect, useRef } from 'react';
import { Bus, Train, Search, Clock, ArrowRight, LocateFixed, Eye, EyeOff } from 'lucide-react';
import L from 'leaflet';
import { PMPML_BUSES, METRO_PURPLE_COORDS, METRO_AQUA_COORDS, BUS_ROUTE_10_PATH, BUS_ROUTE_1_PATH, BUS_ROUTE_5_PATH } from '../constants';

const getDistance = (p1: any, p2: any) => {
  const R = 6371e3;
  const phi1 = p1.lat * Math.PI/180;
  const phi2 = p2.lat * Math.PI/180;
  const dphi = (p2.lat - p1.lat) * Math.PI/180;
  const dlambda = (p2.lng - p1.lng) * Math.PI/180;
  const a = Math.sin(dphi/2) * Math.sin(dphi/2) +
            Math.cos(phi1) * Math.cos(phi2) *
            Math.sin(dlambda/2) * Math.sin(dlambda/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

const LiveNetworkMap: React.FC = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const markers = useRef<{ [key: string]: L.Marker }>({});

  const sims = useRef([
    { id: 'm_aqua_1', path: METRO_AQUA_COORDS, currentIdx: 0, progress: 0.1, wait: 0, color: 'bg-indigo-600', type: 'train', speed: 50 },
    { id: 'm_aqua_2', path: METRO_AQUA_COORDS, currentIdx: 5, progress: 0.6, wait: 0, color: 'bg-indigo-600', type: 'train', speed: 50 },
    { id: 'm_purple_1', path: METRO_PURPLE_COORDS, currentIdx: 2, progress: 0.3, wait: 0, color: 'bg-purple-600', type: 'train', speed: 50 },
    { id: 'b_10_1', path: BUS_ROUTE_10_PATH, currentIdx: 0, progress: 0.2, wait: 0, color: 'bg-emerald-600', type: 'bus', speed: 30 },
    { id: 'b_1_1', path: BUS_ROUTE_1_PATH, currentIdx: 3, progress: 0.8, wait: 0, color: 'bg-emerald-600', type: 'bus', speed: 30 },
    { id: 'b_5_1', path: BUS_ROUTE_5_PATH, currentIdx: 1, progress: 0.4, wait: 0, color: 'bg-emerald-600', type: 'bus', speed: 30 }
  ]);

  useEffect(() => {
    if (mapRef.current && !mapInstance.current) {
      mapInstance.current = L.map(mapRef.current, { zoomControl: false }).setView([18.5204, 73.8567], 12);
      L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png').addTo(mapInstance.current);

      const createIcon = (color: string, type: string) => L.divIcon({
        className: 'network-icon',
        html: `<div class="${color} text-white p-1 rounded-lg border border-white shadow-lg transition-transform duration-300">
                ${type === 'train' ? '<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><rect x="7" y="2" width="10" height="20" rx="2"/><path d="M7 18h10"/></svg>' : 
                '<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9L16 10H5c-1.1 0-2 .9-2 2v7h2"/></svg>'}
               </div>`,
        iconSize: [20, 20]
      });

      sims.current.forEach(sim => {
        markers.current[sim.id] = L.marker([sim.path[sim.currentIdx].lat, sim.path[sim.currentIdx].lng], {
          icon: createIcon(sim.color, sim.type)
        }).addTo(mapInstance.current!);
      });
    }

    const intervalMs = 150;
    const timer = setInterval(() => {
      sims.current.forEach(sim => {
        if (sim.wait > 0) {
          sim.wait--;
          markers.current[sim.id]?.getElement()?.classList.add('animate-pulse');
          return;
        }
        markers.current[sim.id]?.getElement()?.classList.remove('animate-pulse');

        const p1 = sim.path[sim.currentIdx];
        const p2 = sim.path[(sim.currentIdx + 1) % sim.path.length];
        const dist = getDistance(p1, p2);
        
        const velocityMps = (sim.speed * 1000) / 3600;
        const delta = (velocityMps * (intervalMs / 1000)) / dist;
        
        sim.progress += delta;

        if (sim.progress >= 1) {
          sim.progress = 0;
          sim.currentIdx = (sim.currentIdx + 1) % (sim.path.length - 1);
          sim.wait = sim.type === 'bus' ? 20 : 12; // Stop at signals/stations
          if (sim.currentIdx === 0) markers.current[sim.id]?.setLatLng([sim.path[0].lat, sim.path[0].lng]);
        }

        const pNext = sim.path[(sim.currentIdx + 1) % sim.path.length];
        const lat = sim.path[sim.currentIdx].lat + (pNext.lat - sim.path[sim.currentIdx].lat) * sim.progress;
        const lng = sim.path[sim.currentIdx].lng + (pNext.lng - sim.path[sim.currentIdx].lng) * sim.progress;
        
        markers.current[sim.id]?.setLatLng([lat, lng]);
      });
    }, intervalMs);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative h-48 rounded-2xl overflow-hidden border border-slate-200 mb-4 shadow-inner group">
      <div ref={mapRef} className="w-full h-full z-10" />
      <div className="absolute top-2 left-2 z-20 bg-white/90 backdrop-blur px-2 py-1 rounded-lg shadow-sm border border-slate-100 text-[10px] font-black uppercase tracking-tight flex items-center space-x-2">
        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-ping"></div>
        <span>Pune Live Network Feed</span>
      </div>
      <div className="absolute bottom-2 right-2 z-20 bg-black/50 text-white text-[8px] font-bold px-2 py-0.5 rounded uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
        Buses capped at 30km/h
      </div>
    </div>
  );
};

const ScheduleView: React.FC = () => {
  const [tab, setTab] = useState<'bus' | 'metro'>('metro');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredBuses = PMPML_BUSES.filter(b => 
    b.origin.toLowerCase().includes(searchTerm.toLowerCase()) || 
    b.destination.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.route_number.includes(searchTerm)
  );

  return (
    <div className="p-4 space-y-4 max-w-2xl mx-auto">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-800">Schedules</h2>
        <div className="flex bg-slate-200 p-1 rounded-xl">
          <button 
            onClick={() => setTab('metro')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${tab === 'metro' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500'}`}
          >
            Metro
          </button>
          <button 
            onClick={() => setTab('bus')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${tab === 'bus' ? 'bg-white shadow-sm text-emerald-600' : 'text-slate-500'}`}
          >
            PMPML
          </button>
        </div>
      </div>

      <LiveNetworkMap />

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <input 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder={`Search ${tab === 'metro' ? 'stations' : 'routes'}...`} 
          className="w-full bg-white border border-slate-200 rounded-2xl py-3 pl-10 pr-4 focus:outline-none focus:ring-2 ring-indigo-400 shadow-sm"
        />
      </div>

      {tab === 'metro' ? (
        <div className="space-y-6">
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-purple-600 flex items-center space-x-2">
              <div className="w-2 h-2 rounded-full bg-purple-600"></div>
              <span>Purple Line (PCMC - Swargate)</span>
            </h3>
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden divide-y divide-slate-50">
              {METRO_PURPLE_COORDS.slice(0, 5).map((station) => (
                <div key={station.name} className="p-3 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Train size={16} className="text-purple-600" />
                    <span className="font-medium text-slate-700">{station.name}</span>
                  </div>
                  <div className="flex items-center space-x-3 text-xs font-bold text-slate-500">
                    <Clock size={14} />
                    <span>Every 10 min</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-bold text-blue-600 flex items-center space-x-2">
              <div className="w-2 h-2 rounded-full bg-blue-600"></div>
              <span>Aqua Line (Vanaz - Ramwadi)</span>
            </h3>
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden divide-y divide-slate-50">
              {METRO_AQUA_COORDS.slice(0, 5).map((station) => (
                <div key={station.name} className="p-3 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Train size={16} className="text-blue-600" />
                    <span className="font-medium text-slate-700">{station.name}</span>
                  </div>
                  <div className="flex items-center space-x-3 text-xs font-bold text-slate-500">
                    <Clock size={14} />
                    <span>Every 8 min</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="grid gap-3">
          {filteredBuses.slice(0, 15).map((bus) => (
            <div key={bus.route_number} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between group hover:border-emerald-200 transition-all">
              <div className="flex items-center space-x-4">
                <div className="bg-emerald-100 text-emerald-700 w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm">
                  {bus.route_number}
                </div>
                <div>
                  <div className="flex items-center space-x-2 font-bold text-slate-800">
                    <span className="truncate max-w-[100px]">{bus.origin}</span>
                    <ArrowRight size={14} className="text-slate-400" />
                    <span className="truncate max-w-[100px]">{bus.destination}</span>
                  </div>
                  <p className="text-[10px] text-slate-500 font-medium">{bus.approx_distance_km} KM • Frequency: 15-30 min</p>
                </div>
              </div>
              <button className="text-xs font-bold text-emerald-600 px-3 py-1.5 bg-emerald-50 rounded-lg group-hover:bg-emerald-600 group-hover:text-white transition-all">
                Timings
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ScheduleView;
