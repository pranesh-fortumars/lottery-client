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
      <div className="bg-white min-h-screen p-4 pb-24 flex flex-col items-center">
        {/* Header Logic */}
        <div className="w-full max-w-sm bg-[#ff0033] text-white p-4 rounded-2xl mb-8 flex justify-between items-center shadow-xl relative overflow-hidden">
           <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12 blur-xl"></div>
           <div>
              <h3 className="text-lg font-black uppercase tracking-tighter italic">Live Results Board</h3>
              <p className="text-[8px] font-black uppercase tracking-widest opacity-60">
                Last Sync: {lastSync.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </p>
           </div>
           <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-ping"></div>
              <Trophy size={24} fill="white" className="opacity-40" />
           </div>
        </div>

        {declaredResults.length === 0 ? (
          <div className="py-20 text-center space-y-4 opacity-30">
             <History size={48} className="mx-auto text-gray-400" />
             <p className="text-xs font-black uppercase tracking-widest">Awaiting declaration for today's slots...</p>
          </div>
        ) : (
          declaredResults.map((r, i) => (
            <div key={r.id || i} className="mb-8 w-full max-w-sm group animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center gap-2 mb-2 ml-1">
                 <div className="w-1.5 h-1.5 bg-[#ff0033] rounded-full animate-pulse shadow-[0_0_5px_#ff0033]"></div>
                 <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Draw Entry #{String(r.id || '').slice(-4)}</span>
              </div>
              <table className="w-full border-collapse border border-red-600 text-left bg-white shadow-lg overflow-hidden rounded-xl">
                <tbody>
                  <tr className="border border-red-600">
                    <td className="w-[35%] p-3 border-r border-red-600 font-black text-[9px] uppercase tracking-widest bg-gray-50/50">Draw Date</td>
                    <td className="p-3 font-black text-gray-800 text-xs tracking-tight italic">{r.date}</td>
                  </tr>
                  <tr className="border border-red-600">
                    <td className="p-3 border-r border-red-600 font-black text-[9px] uppercase tracking-widest bg-gray-50/50">Draw Time</td>
                    <td className="p-3 font-black text-gray-800 text-xs tracking-tight italic">{r.draw}</td>
                  </tr>
                  <tr className="border border-red-600">
                    <td className="p-3 border-r border-red-600 font-black text-[9px] uppercase tracking-widest bg-gray-50/50">Lot Name</td>
                    <td className="p-3 font-black text-[#ff0033] text-xs tracking-tight uppercase italic">
                      {getBrandBySlot(r.draw)} LOTTERY
                    </td>
                  </tr>
                  <tr className="border border-red-600 bg-red-50/30">
                    <td className="p-3 border-r border-red-600 font-black text-[9px] uppercase tracking-widest bg-red-600 text-white">Winning Digits</td>
                    <td className="p-3">
                      <div className="flex gap-2.5">
                        {(r.number || "").split('').map((n, j) => (
                          <div key={j} className="w-10 h-10 bg-gray-900 border-b-4 border-red-600 rounded-xl flex items-center justify-center text-white font-black text-xl italic shadow-md">
                            {n}
                          </div>
                        ))}
                        {!r.number && <span className="text-[10px] font-black text-gray-400 italic">Processing...</span>}
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          ))
        )}
        
        <div className="mt-12 text-center opacity-30 border-t border-gray-100 pt-8 w-full max-w-xs">
           <p className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-400 italic italic leading-relaxed">Transactions & results are hardware encrypted and board verified for security.</p>
        </div>
      </div>
    </PageWrapper>
  );
};

export default ResultsPage;
