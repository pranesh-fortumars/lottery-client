import React, { useState, useEffect, useMemo } from 'react';
import { collection, query, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase';
import { Filter, Calendar, Ticket, ArrowUpRight, BadgeCheck } from 'lucide-react';

const AdminTodayTickets = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [brandFilter, setBrandFilter] = useState('ALL');
  const [drawFilter, setDrawFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');

  useEffect(() => {
    // Fetch all tickets for today
    const now = new Date();
    const todayStr = now.toLocaleDateString();

    const q = query(collection(db, 'tickets'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const todayTxs = [];
      snapshot.docs.forEach(doc => {
        const data = doc.data();
        if (data.timestamp) {
          const dateStr = data.timestamp.toDate().toLocaleDateString();
          if (dateStr === todayStr) {
            todayTxs.push({ id: doc.id, ...data });
          }
        } else if (data.purchaseDate) {
           const d = new Date(data.purchaseDate);
           if (d.toLocaleDateString() === todayStr) {
             todayTxs.push({ id: doc.id, ...data });
           }
        }
      });
      // Sort newest first
      todayTxs.sort((a, b) => (b.timestamp?.toMillis() || 0) - (a.timestamp?.toMillis() || 0));
      setTickets(todayTxs);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const filteredTickets = useMemo(() => {
    return tickets.filter(t => {
      const isDear = String(t.title).toUpperCase().includes('DEAR');
      const isKerala = String(t.title).toUpperCase().includes('KERALA');
      const brand = isDear ? 'DEAR' : (isKerala ? 'KERALA' : 'OTHER');

      if (brandFilter !== 'ALL' && brand !== brandFilter) return false;
      if (drawFilter !== 'ALL' && t.draw !== drawFilter) return false;
      
      const tType = t.gameType === '3D_LUCKY_PICK' ? '3D_LUCKY_PICK' : t.type;
      if (typeFilter !== 'ALL' && tType !== typeFilter) return false;

      return true;
    });
  }, [tickets, brandFilter, drawFilter, typeFilter]);

  const getDrawOptions = () => {
    return ['01:00 PM', '06:00 PM', '08:00 PM'];
  };

  const getTypeOptions = () => {
    return ['1D', '2D', '3D', '4D', '3D_LUCKY_PICK'];
  };

  if (loading) return <div className="p-8 text-center text-gray-500 font-bold uppercase tracking-widest text-[10px]">Loading Today's Tickets...</div>;

  return (
    <div className="p-4 space-y-6 pb-24">
      {/* Header Banner */}
      <div className="border-[1.5px] border-emerald-500 rounded-[2.5rem] p-6 bg-white shadow-2xl relative overflow-hidden group">
         <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl"></div>
         <div className="flex gap-4 items-center mb-6">
            <div className="w-14 h-14 bg-emerald-50 text-emerald-500 rounded-2xl flex items-center justify-center shadow-sm shrink-0">
               <Ticket size={28} />
            </div>
            <div className="flex-grow">
               <h2 className="text-2xl font-black text-gray-900 font-condensed uppercase tracking-tighter italic">Today Tickets</h2>
               <p className="text-emerald-500 font-black text-[10px] uppercase tracking-widest leading-none mt-1">Daily Volume Overview</p>
            </div>
         </div>
         
         <div className="flex bg-gray-50 p-4 rounded-2xl items-center justify-between">
            <div className="flex items-center gap-3">
               <Calendar className="text-gray-400" size={16} />
               <span className="text-[10px] font-black text-gray-800 uppercase tracking-widest">{new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}</span>
            </div>
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total: {filteredTickets.length}</span>
         </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-5 rounded-3xl shadow-lg border border-gray-900 flex flex-col sm:flex-row gap-4 items-center">
         <div className="flex items-center gap-2 shrink-0">
            <Filter size={16} className="text-gray-400" />
            <span className="text-[10px] font-black text-gray-800 uppercase tracking-widest">Filters:</span>
         </div>
         <div className="flex-grow grid grid-cols-3 gap-2 w-full">
            <select 
              value={brandFilter} 
              onChange={(e) => setBrandFilter(e.target.value)}
              className="bg-gray-50 border border-gray-800 text-gray-800 text-[10px] font-black uppercase tracking-widest rounded-xl px-3 py-2 outline-none focus:border-emerald-500"
            >
              <option value="ALL">All Brands</option>
              <option value="DEAR">Dear Lottery</option>
              <option value="KERALA">Kerala Lottery</option>
            </select>
            <select 
              value={drawFilter} 
              onChange={(e) => setDrawFilter(e.target.value)}
              className="bg-gray-50 border border-gray-800 text-gray-800 text-[10px] font-black uppercase tracking-widest rounded-xl px-3 py-2 outline-none focus:border-emerald-500"
            >
              <option value="ALL">All Draws</option>
              {getDrawOptions().map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
            <select 
              value={typeFilter} 
              onChange={(e) => setTypeFilter(e.target.value)}
              className="bg-gray-50 border border-gray-800 text-gray-800 text-[10px] font-black uppercase tracking-widest rounded-xl px-3 py-2 outline-none focus:border-emerald-500"
            >
              <option value="ALL">All Types</option>
              {getTypeOptions().map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
         </div>
      </div>

      {/* Results */}
      {filteredTickets.length === 0 ? (
         <div className="bg-gray-50 rounded-[2rem] p-12 text-center border border-gray-900 shadow-inner">
            <BadgeCheck className="mx-auto text-gray-300 mb-4 opacity-50" size={48} />
            <p className="text-[12px] font-black uppercase tracking-widest text-gray-400 italic">No tickets found for today.</p>
         </div>
      ) : (
         <div className="bg-white rounded-3xl shadow-lg border border-gray-900 overflow-hidden">
            <div className="overflow-x-auto">
               <table className="w-full text-left border-collapse">
                  <thead>
                     <tr className="bg-gray-50/50">
                        <th className="p-4 text-[9px] font-black uppercase tracking-[0.2em] text-gray-400 border-b border-gray-900">Draw & Type</th>
                        <th className="p-4 text-[9px] font-black uppercase tracking-[0.2em] text-gray-400 border-b border-gray-900">User / Qty</th>
                        <th className="p-4 text-[9px] font-black uppercase tracking-[0.2em] text-gray-400 border-b border-gray-900">Number / Board</th>
                        <th className="p-4 text-[9px] font-black uppercase tracking-[0.2em] text-gray-400 border-b border-gray-900 text-right">Value (₹)</th>
                     </tr>
                  </thead>
                  <tbody>
                     {filteredTickets.map(t => (
                        <tr key={t.id} className="hover:bg-gray-50/50 transition-colors group">
                           <td className="p-4 border-b border-gray-50">
                              <p className="text-sm font-black text-gray-900 tracking-tight">{t.draw}</p>
                              <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-1">{t.gameType === '3D_LUCKY_PICK' ? '3D Lucky Pick' : t.type}</p>
                           </td>
                           <td className="p-4 border-b border-gray-50">
                              <p className="text-sm font-black text-gray-800 tracking-tight">{t.userName}</p>
                              <p className="text-[10px] font-black text-emerald-600 mt-1 uppercase tracking-widest">Qty: {t.qty}</p>
                           </td>
                           <td className="p-4 border-b border-gray-50">
                              <p className="text-base font-black text-gray-900 tracking-widest">{t.num}</p>
                              <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-1">{t.board}</p>
                           </td>
                           <td className="p-4 border-b border-gray-50 text-right">
                              <p className="text-lg font-black text-gray-900 italic">{(t.price * t.qty)}</p>
                              <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest mt-1">₹{t.price} / ea</p>
                           </td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>
         </div>
      )}
    </div>
  );
};

export default AdminTodayTickets;
