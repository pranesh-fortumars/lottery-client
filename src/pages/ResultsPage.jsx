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
        <div className="w-full max-w-sm bg-blue-600 text-white p-5 rounded-2xl mb-8 flex justify-between items-center shadow-sm relative overflow-hidden">
           <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12 blur-xl"></div>
           <div>
              <h3 className="text-lg font-bold uppercase tracking-tight">Live Results Board</h3>
              <p className="text-[10px] font-bold uppercase tracking-widest text-blue-100">
                Last Sync: {lastSync.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </p>
           </div>
           <div className="flex items-center gap-2">
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
              <div className="bg-white rounded-2xl border border-slate-400 shadow-sm overflow-hidden">
                <table className="w-full text-left text-sm">
                  <tbody>
                    <tr className="border-b border-slate-100">
                      <td className="w-[35%] p-4 border-r border-slate-100 font-bold text-[10px] uppercase tracking-wider text-slate-500 bg-slate-50/50">Draw Date</td>
                      <td className="p-4 font-bold text-black text-xs">{r.date}</td>
                    </tr>
                    <tr className="border-b border-slate-100">
                      <td className="p-4 border-r border-slate-100 font-bold text-[10px] uppercase tracking-wider text-slate-500 bg-slate-50/50">Draw Time</td>
                      <td className="p-4 font-bold text-black text-xs">{r.draw}</td>
                    </tr>
                    <tr className="border-b border-slate-100">
                      <td className="p-4 border-r border-slate-100 font-bold text-[10px] uppercase tracking-wider text-slate-500 bg-slate-50/50">Lot Name</td>
                      <td className="p-4 font-bold text-blue-600 text-xs uppercase">
                        {getBrandBySlot(r.draw)} LOTTERY
                      </td>
                    </tr>
                    <tr className="bg-blue-50">
                      <td className="p-4 border-r border-slate-100 font-bold text-[10px] uppercase tracking-wider text-slate-600">Winning Digits</td>
                      <td className="p-4">
                        <div className="flex gap-2 mt-2 pb-1">
                          {(r.number || "").split('').map((n, j) => (
                            <div key={j} className="flex flex-col items-center gap-1">
                              <span className="text-[10px] font-black text-blue-500">{['X', 'A', 'B', 'C'][j]}</span>
                              <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-sm border border-slate-700">
                                {n}
                              </div>
                            </div>
                          ))}
                          {!r.number && <span className="text-[10px] font-bold text-slate-400">Processing...</span>}
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
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
