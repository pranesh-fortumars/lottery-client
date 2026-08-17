import React from 'react';
import PageWrapper from '../components/PageWrapper';
import { useCart } from '../context/CartContext';
import { getBrandBySlot } from '../constants/lotteryConfig';
import { Search, Trophy, History } from 'lucide-react';

const ResultsPage = () => {
  const { declaredResults } = useCart();
  const [lastSync, setLastSync] = React.useState(new Date());

  React.useEffect(() => {
    if (declaredResults.length > 0) {
      setLastSync(new Date());
    }
  }, [declaredResults]);

  return (
    <PageWrapper title="DAILY RESULTS">
      <div className="bg-slate-50 min-h-screen p-4 pb-24 flex flex-col items-center">
        {/* Header Logic */}
        <div className="w-full max-w-sm bg-gradient-to-r from-cyan-500 to-blue-600 text-white p-5 rounded-3xl mb-8 flex justify-between items-center shadow-lg border border-white/20 backdrop-blur-md relative overflow-hidden">
           <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full -mr-16 -mt-16 blur-2xl"></div>
           <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12 blur-xl"></div>
           <div className="relative z-10">
              <h3 className="text-xl font-black uppercase tracking-tight italic">Live Results Board</h3>
              <p className="text-[10px] font-bold uppercase tracking-widest text-cyan-100 mt-0.5">
                Last Sync: {lastSync.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </p>
           </div>
           <div className="flex items-center gap-2 relative z-10">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-ping"></div>
              <Trophy size={24} fill="white" className="opacity-40" />
           </div>
        </div>

        {declaredResults.length === 0 ? (
          <div className="py-20 text-center space-y-4 opacity-50">
             <History size={48} className="mx-auto text-slate-400" />
             <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Awaiting declaration for today's slots...</p>
          </div>
        ) : (
          declaredResults.map((r, i) => (
            <div key={r.id || i} className="mb-8 w-full max-w-sm group animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center gap-2 mb-2 ml-2">
                 <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse shadow-sm"></div>
                 <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Draw Entry #{String(r.id || '').slice(-4)}</span>
              </div>
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 flex justify-between items-center">
                 {/* Left Side: Logo and Brand Name */}
                 <div className="flex flex-col items-center gap-1 min-w-[90px]">
                    <div className="w-12 h-12 flex items-center justify-center bg-slate-50 rounded-full border border-slate-100 shadow-inner">
                       <img 
                         src={
                           getBrandBySlot(r.draw).toLowerCase().includes('dear') ? 'https://img.icons8.com/color/48/000000/bull.png' :
                           getBrandBySlot(r.draw).toLowerCase().includes('goa') ? 'https://img.icons8.com/color/48/000000/crown.png' :
                           getBrandBySlot(r.draw).toLowerCase().includes('kerala') ? 'https://img.icons8.com/color/48/000000/palm-tree.png' :
                           'https://img.icons8.com/color/48/000000/treasure-chest.png'
                         }
                         alt="logo" 
                         className="w-8 h-8 object-contain"
                       />
                    </div>
                    <span className="font-bold text-xs text-black text-center leading-tight mt-1">
                      {getBrandBySlot(r.draw)} <br/> {r.draw.split(' ')[0]}
                    </span>
                 </div>

                 {/* Right Side: Date/Time and Digits */}
                 <div className="flex flex-col items-end justify-between h-full gap-3">
                    <div className="text-right">
                       <span className="text-[11px] font-bold text-black">{r.date} {r.draw}</span>
                    </div>
                    <div className="flex gap-2">
                       {(r.number || "").split('').map((n, j) => {
                          const ringColors = [
                            'border-red-600 text-red-600', 
                            'border-orange-500 text-orange-600', 
                            'border-blue-500 text-blue-600', 
                            'border-green-600 text-green-600'
                          ];
                          return (
                            <div key={j} className="flex flex-col items-center gap-1">
                              <span className="text-[8px] font-black uppercase text-slate-400 leading-none">{['X', 'A', 'B', 'C'][j]}</span>
                              <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold text-lg bg-white shadow-sm ${ringColors[j] || 'border-slate-500 text-slate-600'}`}>
                                {n}
                              </div>
                            </div>
                          );
                       })}
                       {!r.number && <span className="text-[10px] font-bold text-slate-400 mt-2">Processing...</span>}
                    </div>
                 </div>
              </div>
            </div>
          ))
        )}
        
        <div className="mt-12 text-center opacity-60 pt-8 w-full max-w-xs">
           <p className="text-[10px] font-medium text-slate-400 leading-relaxed">Transactions & results are hardware encrypted and board verified for security.</p>
        </div>
      </div>
    </PageWrapper>
  );
};

export default ResultsPage;
