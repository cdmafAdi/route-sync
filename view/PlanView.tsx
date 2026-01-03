
import React from 'react';
import { Compass, Star, MapPin, Search, PlusCircle, ArrowUpRight } from 'lucide-react';
import { PUNE_SPOTS } from '../constants';

const PlanView: React.FC = () => {
  return (
    <div className="p-4 space-y-6 max-w-2xl mx-auto">
      <header className="space-y-2">
        <h2 className="text-2xl font-bold text-slate-800">Explore Pune</h2>
        <p className="text-slate-500 text-sm">Discover amazing places and find how to reach them.</p>
      </header>

      <div className="flex overflow-x-auto space-x-3 pb-2 scrollbar-hide">
        {['All', 'Heritage', 'Nature', 'Religious', 'Shopping', 'Parks'].map((cat) => (
          <button 
            key={cat}
            className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
              cat === 'All' ? 'bg-indigo-600 text-white shadow-md' : 'bg-white text-slate-500 border border-slate-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <section className="space-y-4">
        {PUNE_SPOTS.map((spot) => (
          <div key={spot.name} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 group">
            <div className="h-48 bg-slate-200 relative">
              <img 
                src={spot.imageUrl} 
                alt={spot.name} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute top-3 left-3 bg-white/90 backdrop-blur px-2 py-1 rounded-lg text-[10px] font-bold text-indigo-600 uppercase">
                {spot.category}
              </div>
              <button className="absolute top-3 right-3 bg-white p-2 rounded-full shadow-md text-slate-400 hover:text-red-500 transition-colors">
                <PlusCircle size={18} />
              </button>
            </div>
            <div className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-lg text-slate-800">{spot.name}</h3>
                <div className="flex items-center text-amber-500">
                  <Star size={14} fill="currentColor" />
                  <span className="text-xs font-bold ml-1">4.8</span>
                </div>
              </div>
              <p className="text-xs text-slate-500 line-clamp-2">{spot.description}</p>
              <div className="bg-indigo-50 p-3 rounded-xl border border-indigo-100 flex items-center justify-between">
                <div className="flex items-center space-x-2 text-indigo-700">
                  <MapPin size={16} />
                  <span className="text-[11px] font-bold truncate max-w-[200px]">{spot.bestRoute}</span>
                </div>
                <button className="bg-white text-indigo-600 p-1.5 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                  <ArrowUpRight size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </section>

      <div className="bg-slate-900 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 space-y-3">
          <h3 className="text-xl font-bold">Custom Trip Maker</h3>
          <p className="text-slate-400 text-xs">Let our AI build a personalized one-day itinerary for you.</p>
          <button className="bg-indigo-600 w-full py-3 rounded-xl font-bold text-sm shadow-lg hover:bg-indigo-500 transition-colors">
            Generate My Plan
          </button>
        </div>
        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-indigo-500 rounded-full opacity-20 blur-3xl"></div>
      </div>
    </div>
  );
};

export default PlanView;
