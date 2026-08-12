import React from 'react';
import { 
  FileText, 
  Download, 
  Calendar, 
  PieChart, 
  Activity,
  ArrowRight,
  TrendingUp,
  Target,
  ChevronRight
} from 'lucide-react';

const AdminReports = () => {
  const reports = [
    { title: 'Daily Revenue Report', desc: 'Detailed breakdown of sales and prize payouts.', date: 'Daily Update', icon: Activity, color: 'text-emerald-500', bg: 'bg-emerald-50' },
    { title: 'User Growth Analytics', desc: 'Tracking new registrations and user retention.', date: 'Weekly Sync', icon: PieChart, color: 'text-blue-500', bg: 'bg-blue-50' },
    { title: 'Lottery Accuracy Audit', desc: 'Verifying random number generation and results.', date: 'Monthly Audit', icon: Target, color: 'text-orange-500', bg: 'bg-orange-50' },
    { title: 'Wallet Transaction Log', desc: 'Complete history of all deposits and winnings.', date: 'Live Feed', icon: Calendar, color: 'text-primary-hover', bg: 'bg-[#eff6ff]' },
  ];

  return (
    <div className="space-y-10 pb-32 p-4 min-h-screen bg-[#f8f9fa]">
      {/* Top Banner - Treasure Chest Theme */}
      <div className="border-[1.5px] border-primary rounded-[2.5rem] p-8 bg-white shadow-2xl relative overflow-hidden group">
         <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl"></div>
         <div className="flex gap-4 items-center">
            <img src="https://img.icons8.com/color/64/000000/treasure-chest.png" alt="Chest" className="w-16 h-16 drop-shadow-xl group-hover:scale-110 transition-transform" />
            <div className="flex-grow">
               <h2 className="text-2xl font-black text-gray-900 font-condensed uppercase tracking-tighter italic leading-none">Intelligence</h2>
               <p className="text-primary font-black text-[10px] uppercase tracking-widest leading-none mt-1">SMS Lottery Insights</p>
            </div>
            <button className="bg-gray-50 border border-gray-100 p-3 rounded-2xl text-gray-400 hover:text-primary-hover hover:bg-[#eff6ff] transition-all">
               <Download size={20} />
            </button>
         </div>
      </div>

      {/* Reports List */}
      <div className="space-y-6">
         <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4 mb-2 italic">Standard Audit Logs</p>
         <div className="space-y-4">
            {reports.map((report, idx) => (
               <div key={idx} className="bg-white rounded-[2.2rem] p-6 border border-gray-100 shadow-lg flex flex-col gap-6 active:scale-[0.98] transition-all group hover:border-primary-hover/20">
                  <div className="flex items-center gap-5">
                     <div className={`w-14 h-14 rounded-2xl shrink-0 flex items-center justify-center shadow-md border border-white ${report.bg} ${report.color} group-hover:rotate-6 transition-transform`}>
                        <report.icon size={28} strokeWidth={2.5} />
                     </div>
                     
                     <div className="flex-grow">
                        <div className="flex justify-between items-center mb-1">
                           <h3 className="text-sm font-black text-gray-800 tracking-tight uppercase italic">{report.title}</h3>
                           <span className="text-[8px] font-black text-gray-400 uppercase tracking-[0.2em]">{report.date}</span>
                        </div>
                        <p className="text-[10px] text-gray-400 font-medium leading-relaxed italic line-clamp-1">
                           {report.desc}
                        </p>
                     </div>
                  </div>

                  <div className="flex gap-3 justify-end border-t border-gray-50 pt-5">
                     <button className="bg-gray-50 text-gray-500 px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-primary-hover hover:text-white transition-all">
                        <FileText size={14} /> View PDF
                     </button>
                     <button className="bg-gray-50 text-gray-500 px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-gray-900 hover:text-white transition-all">
                        <Download size={14} /> Export CSV
                     </button>
                  </div>
               </div>
            ))}
         </div>
      </div>

      {/* Mini Insight */}
      <div className="bg-gray-900 rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden group">
         <div className="absolute top-0 right-0 w-48 h-48 bg-primary-hover/20 rounded-full -mr-24 -mt-24 blur-[100px] group-hover:bg-primary-hover/40 transition-colors"></div>
         
         <div className="relative z-10 flex flex-col items-center text-center space-y-4">
            <div className="bg-primary-hover px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest shadow-xl shadow-primary-hover/20">Pro Insights</div>
            <h2 className="text-2xl font-black font-condensed tracking-tighter uppercase leading-none italic">Predictive Revenue Projection</h2>
            <p className="text-gray-400 text-xs font-medium leading-relaxed max-w-[80%] mx-auto">
              Advanced machine learning analysis of spending patterns and winning ratios for the 2024 fiscal cycle.
            </p>
            <button className="w-full bg-white text-gray-900 py-4 rounded-2xl font-black text-[12px] uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl active:scale-95 transition-all mt-4">
               Access Full Forecast <ChevronRight size={18} className="text-primary-hover" />
            </button>
         </div>
      </div>
      
      <div className="pt-8 text-center opacity-30">
         <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.3em]">Compliance & Audit Authority Protocol</p>
      </div>
    </div>
  );
};

export default AdminReports;
