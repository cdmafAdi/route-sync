
import React, { useState } from 'react';
import { Shield, ShieldAlert, Phone, Navigation, Share2, MapPin, CheckCircle2, AlertCircle } from 'lucide-react';

const SafetyView: React.FC = () => {
  const [sharing, setSharing] = useState(false);

  return (
    <div className="p-4 space-y-6 max-w-2xl mx-auto">
      <header className="space-y-2">
        <div className="flex items-center space-x-2 text-indigo-600">
          <Shield size={28} />
          <h2 className="text-2xl font-bold text-slate-800">Safety Center</h2>
        </div>
        <p className="text-slate-500 text-sm">Real-time protection and emergency reporting for Pune commuters.</p>
      </header>

      <section className={`rounded-3xl p-6 text-white shadow-lg transition-all duration-500 relative overflow-hidden ${sharing ? 'bg-emerald-600' : 'bg-slate-900'}`}>
        <div className="relative z-10 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold">{sharing ? 'Location Sharing Active' : 'Real-time Safety Check'}</h3>
            <div className={`p-2 rounded-full ${sharing ? 'bg-emerald-500' : 'bg-slate-800'}`}>
              {sharing ? <CheckCircle2 size={24} /> : <AlertCircle size={24} />}
            </div>
          </div>
          <p className="text-xs text-slate-300">Your live location is shared with your Family Circle and monitored by our AI for route deviations.</p>
          <button 
            onClick={() => setSharing(!sharing)}
            className={`w-full py-3.5 rounded-2xl font-bold flex items-center justify-center space-x-2 shadow-xl transition-all ${
              sharing ? 'bg-white text-emerald-700' : 'bg-indigo-600 text-white'
            }`}
          >
            {sharing ? <Share2 size={18} /> : <Navigation size={18} />}
            <span>{sharing ? 'Stop Sharing' : 'Start Journey Share'}</span>
          </button>
        </div>
        <div className="absolute top-0 right-0 -m-8 w-48 h-48 bg-white opacity-5 blur-3xl"></div>
      </section>

      <div className="grid grid-cols-2 gap-4">
        <a href="tel:100" className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex flex-col items-center justify-center space-y-2 group active:scale-95 transition-all">
          <div className="p-3 bg-rose-50 text-rose-600 rounded-2xl group-hover:bg-rose-600 group-hover:text-white transition-all">
            <Phone size={24} />
          </div>
          <span className="text-xs font-bold text-slate-700">Police (100)</span>
        </a>
        <a href="tel:108" className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex flex-col items-center justify-center space-y-2 group active:scale-95 transition-all">
          <div className="p-3 bg-orange-50 text-orange-600 rounded-2xl group-hover:bg-orange-600 group-hover:text-white transition-all">
            <ShieldAlert size={24} />
          </div>
          <span className="text-xs font-bold text-slate-700">Medical (108)</span>
        </a>
      </div>

      <section className="space-y-4">
        <h3 className="font-bold text-slate-800 flex items-center space-x-2">
          <MapPin size={18} className="text-indigo-600" />
          <span>Report Safety Concern</span>
        </h3>
        <div className="grid grid-cols-1 gap-3">
          {['Overcrowding', 'Suspicious Activity', 'Late Service', 'Reckless Driving'].map((issue) => (
            <button key={issue} className="bg-white p-4 rounded-2xl border border-slate-100 flex items-center justify-between hover:border-indigo-300 transition-all text-left">
              <span className="text-sm font-medium text-slate-700">{issue}</span>
              <AlertCircle size={18} className="text-slate-300" />
            </button>
          ))}
        </div>
      </section>
      
      <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-100 flex items-start space-x-3">
        <Shield size={20} className="text-indigo-600 mt-0.5" />
        <div>
          <h4 className="text-xs font-bold text-indigo-900">Guardian Mode</h4>
          <p className="text-[10px] text-indigo-700/70">Guardian mode automatically alerts your family if your commute takes 15 minutes longer than estimated due to unforeseen delays.</p>
        </div>
      </div>
    </div>
  );
};

export default SafetyView;
