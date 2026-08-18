import React, { useState, useEffect, useMemo } from 'react';
import { collection, query, onSnapshot, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';
import { Calendar, Wallet, TrendingUp, BadgeCheck, Loader2 } from 'lucide-react';

const AdminRevenue = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Date range state (default: Today)
  const [startDate, setStartDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0]);

  // We can fetch all tickets to calculate lifetime/range locally
  // Warning: for extremely large DBs, this requires server pagination, but this fits the existing app architecture.
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const snap = await getDocs(collection(db, 'tickets'));
        const txs = [];
        snap.docs.forEach(doc => {
          txs.push({ id: doc.id, ...doc.data() });
        });
        setTickets(txs);
      } catch (e) {
        console.error("Error fetching tickets for revenue:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchAllData();
  }, []);

  const todayRevenue = useMemo(() => {
    const todayStr = new Date().toLocaleDateString();
    return tickets.reduce((sum, t) => {
      let isToday = false;
      if (t.timestamp) {
         isToday = t.timestamp.toDate().toLocaleDateString() === todayStr;
      } else if (t.purchaseDate) {
         isToday = new Date(t.purchaseDate).toLocaleDateString() === todayStr;
      }
      return isToday ? sum + (Number(t.price || 0) * Number(t.qty || 1)) : sum;
    }, 0);
  }, [tickets]);

  const rangeRevenue = useMemo(() => {
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    return tickets.reduce((sum, t) => {
      let d = new Date(0);
      if (t.timestamp) d = t.timestamp.toDate();
      else if (t.purchaseDate) d = new Date(t.purchaseDate);
      
      if (d >= start && d <= end) {
        return sum + (Number(t.price || 0) * Number(t.qty || 1));
      }
      return sum;
    }, 0);
  }, [tickets, startDate, endDate]);

  const lifetimeRevenue = useMemo(() => {
    return tickets.reduce((sum, t) => sum + (Number(t.price || 0) * Number(t.qty || 1)), 0);
  }, [tickets]);

  if (loading) return <div className="p-8 text-center text-gray-500 font-bold uppercase tracking-widest text-[10px]">Loading Revenue Analytics...</div>;

  return (
    <div className="p-4 space-y-6 pb-24">
      {/* Today's Banner */}
      <div className="border-[1.5px] border-amber-500 rounded-[2.5rem] p-6 bg-white shadow-2xl relative overflow-hidden group">
         <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-3xl"></div>
         <div className="flex gap-4 items-center mb-6">
            <div className="w-14 h-14 bg-amber-50 text-amber-500 rounded-2xl flex items-center justify-center shadow-sm shrink-0">
               <Wallet size={28} />
            </div>
            <div className="flex-grow">
               <h2 className="text-2xl font-black text-gray-900 font-condensed uppercase tracking-tighter italic">Today's Income</h2>
               <p className="text-amber-500 font-black text-[10px] uppercase tracking-widest leading-none mt-1">Real-Time Daily Revenue</p>
            </div>
         </div>
         
         <div className="bg-amber-50 p-6 rounded-3xl border border-amber-100 flex flex-col justify-center items-center">
            <p className="text-5xl font-black text-amber-500 tracking-tighter italic">₹{todayRevenue.toLocaleString()}</p>
            <p className="text-[10px] font-black text-amber-600/80 uppercase tracking-widest mt-2">{new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
         </div>
      </div>

      {/* Date Range Analytics */}
      <div className="bg-white rounded-3xl p-6 shadow-lg border border-gray-100">
         <div className="flex items-center gap-3 mb-6">
            <Calendar className="text-gray-400" size={20} />
            <h3 className="text-lg font-black uppercase tracking-tighter italic text-gray-900">Custom Range Explorer</h3>
         </div>
         
         <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
               <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Start Date</label>
               <input 
                 type="date" 
                 value={startDate}
                 onChange={(e) => setStartDate(e.target.value)}
                 className="w-full bg-gray-50 border border-gray-200 text-gray-800 text-xs font-black uppercase tracking-wider rounded-xl px-4 py-3 outline-none focus:border-amber-500"
               />
            </div>
            <div className="flex-1">
               <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">End Date</label>
               <input 
                 type="date" 
                 value={endDate}
                 onChange={(e) => setEndDate(e.target.value)}
                 className="w-full bg-gray-50 border border-gray-200 text-gray-800 text-xs font-black uppercase tracking-wider rounded-xl px-4 py-3 outline-none focus:border-amber-500"
               />
            </div>
         </div>

         <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 flex justify-between items-center">
            <div>
               <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Range Total</p>
               <p className="text-2xl font-black text-gray-900 tracking-tighter italic mt-1">₹{rangeRevenue.toLocaleString()}</p>
            </div>
            <TrendingUp size={24} className="text-emerald-500" />
         </div>
      </div>

      {/* Lifetime Overview */}
      <div className="bg-gray-900 rounded-3xl p-6 shadow-xl border border-gray-800">
         <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest text-center mb-2">Lifetime Application Revenue</h3>
         <p className="text-4xl font-black text-white tracking-tighter italic text-center text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-amber-500">₹{lifetimeRevenue.toLocaleString()}</p>
      </div>
    </div>
  );
};

export default AdminRevenue;
