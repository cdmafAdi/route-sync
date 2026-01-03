
import React from 'react';
import { History, Search, Filter, Calendar, Bus, Train, Car, TrendingUp } from 'lucide-react';
import { TravelHistoryItem, TransportMode } from '../types';

const HistoryView: React.FC = () => {
  const history: TravelHistoryItem[] = [
    { id: '1', date: 'Today, 10:15 AM', from: 'Vanaz', to: 'Civil Court', mode: TransportMode.METRO, cost: 20 },
    { id: '2', date: 'Yesterday, 06:30 PM', from: 'Hadapsar', to: 'Swargate', mode: TransportMode.BUS, cost: 15 },
    { id: '3', date: 'Yesterday, 09:12 AM', from: 'Kothrud', to: 'Viman Nagar', mode: TransportMode.CAB, cost: 320 },
    { id: '4', date: '21 Oct, 11:45 AM', from: 'Shivaji Nagar', to: 'Pimpri', mode: TransportMode.METRO, cost: 25 },
    { id: '5', date: '20 Oct, 08:20 PM', from: 'Pune Station', to: 'Swargate', mode: TransportMode.BUS, cost: 10 },
  ];

  return (
    <div className="p-4 space-y-6 max-w-2xl mx-auto">
      <header className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-800">Activity</h2>
        <div className="flex space-x-2">
          <button className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-500 hover:text-indigo-600 shadow-sm"><Search size={18} /></button>
          <button className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-500 hover:text-indigo-600 shadow-sm"><Filter size={18} /></button>
        </div>
      </header>

      <section className="bg-indigo-600 rounded-3xl p-6 text-white shadow-lg overflow-hidden relative">
        <div className="relative z-10 flex justify-between items-center">
          <div>
            <p className="text-indigo-200 text-xs font-bold uppercase tracking-widest mb-1">Monthly Spending</p>
            <h3 className="text-3xl font-bold">₹2,450</h3>
          </div>
          <div className="bg-white/20 backdrop-blur-md p-3 rounded-2xl border border-white/20">
            <TrendingUp size={24} />
          </div>
        </div>
        <div className="mt-4 flex items-center space-x-2 text-[10px] font-bold text-white/80">
          <span className="bg-emerald-400 text-emerald-900 px-2 py-0.5 rounded-full">12% Less</span>
          <span>compared to last month</span>
        </div>
      </section>

      <div className="space-y-4">
        <h3 className="font-bold text-slate-800 text-sm">Past Travels</h3>
        <div className="space-y-3">
          {history.map((item) => (
            <div key={item.id} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between group hover:border-indigo-100 transition-all">
              <div className="flex items-center space-x-4">
                <div className={`p-3 rounded-xl ${
                  item.mode === TransportMode.METRO ? 'bg-indigo-100 text-indigo-600' :
                  item.mode === TransportMode.BUS ? 'bg-emerald-100 text-emerald-600' :
                  'bg-amber-100 text-amber-600'
                }`}>
                  {item.mode === TransportMode.METRO && <Train size={20} />}
                  {item.mode === TransportMode.BUS && <Bus size={20} />}
                  {item.mode === TransportMode.CAB && <Car size={20} />}
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 text-sm flex items-center space-x-2">
                    <span className="truncate max-w-[80px]">{item.from}</span>
                    <span className="text-slate-300">→</span>
                    <span className="truncate max-w-[80px]">{item.to}</span>
                  </h4>
                  <p className="text-[10px] text-slate-500 font-medium">{item.date}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-slate-800">₹{item.cost}</p>
                <button className="text-[10px] font-bold text-indigo-600 uppercase">Repeat</button>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <button className="w-full py-4 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 font-bold text-xs hover:border-indigo-300 hover:text-indigo-400 transition-all flex items-center justify-center space-x-2">
        <Calendar size={14} />
        <span>View Full Trip Logs</span>
      </button>
    </div>
  );
};

export default HistoryView;
