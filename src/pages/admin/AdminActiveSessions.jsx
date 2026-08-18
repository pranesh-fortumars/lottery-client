import React, { useState, useEffect, useMemo } from 'react';
import { collection, query, onSnapshot, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';
import { TrendingUp, User, Clock, Activity, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AdminActiveSessions = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const usersSnap = await getDocs(collection(db, 'users'));
        const usersList = [];
        usersSnap.docs.forEach(doc => usersList.push({ id: doc.id, ...doc.data() }));
        setUsers(usersList);

        const ticketsSnap = await getDocs(collection(db, 'tickets'));
        const ticketsList = [];
        ticketsSnap.docs.forEach(doc => ticketsList.push({ id: doc.id, ...doc.data() }));
        setTickets(ticketsList);
      } catch (e) {
        console.error("Error fetching data for active sessions", e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const activeUsers = useMemo(() => {
    const now = new Date();
    const twentyFourHoursAgo = now.getTime() - (24 * 60 * 60 * 1000);

    // Find users who have purchased tickets in the last 24 hours
    const recentPurchasers = new Set();
    const userLastActive = {};

    tickets.forEach(t => {
      let d = new Date(0);
      if (t.timestamp) d = t.timestamp.toDate();
      else if (t.purchaseDate) d = new Date(t.purchaseDate);

      if (d.getTime() > twentyFourHoursAgo) {
        if (t.userId) {
           recentPurchasers.add(t.userId);
           if (!userLastActive[t.userId] || d > userLastActive[t.userId]) {
             userLastActive[t.userId] = d;
           }
        }
      }
    });

    const active = users.filter(u => recentPurchasers.has(u.id));
    
    return active.map(u => ({
      ...u,
      lastActive: userLastActive[u.id] || new Date(0)
    })).sort((a, b) => b.lastActive.getTime() - a.lastActive.getTime());

  }, [users, tickets]);

  if (loading) return <div className="p-8 text-center text-gray-500 font-bold uppercase tracking-widest text-[10px]">Loading Active Sessions...</div>;

  return (
    <div className="p-4 space-y-6 pb-24">
      {/* Header Banner */}
      <div className="border-[1.5px] border-rose-500 rounded-[2.5rem] p-6 bg-white shadow-2xl relative overflow-hidden group">
         <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 rounded-full blur-3xl"></div>
         <div className="flex gap-4 items-center mb-6">
            <div className="w-14 h-14 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center shadow-sm shrink-0">
               <TrendingUp size={28} />
            </div>
            <div className="flex-grow">
               <h2 className="text-2xl font-black text-gray-900 font-condensed uppercase tracking-tighter italic">Active Sessions</h2>
               <p className="text-rose-500 font-black text-[10px] uppercase tracking-widest leading-none mt-1">Users active within 24H</p>
            </div>
         </div>
         
         <div className="flex bg-gray-50 p-4 rounded-2xl items-center justify-between">
            <div className="flex items-center gap-3">
               <Activity className="text-rose-400 animate-pulse" size={16} />
               <span className="text-[10px] font-black text-gray-800 uppercase tracking-widest">Live Tracking</span>
            </div>
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Active: {activeUsers.length}</span>
         </div>
      </div>

      {/* User List */}
      <div className="space-y-4">
        {activeUsers.length === 0 ? (
          <div className="bg-gray-50 rounded-[2rem] p-12 text-center border border-gray-900 shadow-inner">
             <AlertCircle className="mx-auto text-gray-300 mb-4 opacity-50" size={48} />
             <p className="text-[12px] font-black uppercase tracking-widest text-gray-400 italic">No recent activity detected.</p>
          </div>
        ) : (
          activeUsers.map(user => (
            <div 
              key={user.id} 
              onClick={() => navigate(`/admin/users/${user.id}`)}
              className="bg-white rounded-3xl p-5 shadow-lg border border-gray-900 flex items-center justify-between cursor-pointer hover:border-rose-200 active:scale-95 transition-all group"
            >
              <div className="flex items-center gap-4">
                 <div className="w-12 h-12 bg-rose-50 text-rose-500 rounded-xl flex items-center justify-center font-black text-lg border border-rose-100 shadow-sm group-hover:bg-rose-500 group-hover:text-white transition-all transform group-hover:rotate-6">
                    {user.name?.charAt(0) || 'U'}
                 </div>
                 <div>
                    <h4 className="font-black text-gray-800 text-sm tracking-tight uppercase italic">{user.name || 'Anonymous'}</h4>
                    <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mt-1">{user.mobile || 'No Mobile'}</p>
                 </div>
              </div>
              <div className="text-right">
                 <div className="flex items-center gap-1 text-emerald-500 justify-end mb-1">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                    <span className="text-[8px] font-black uppercase tracking-widest">Online</span>
                 </div>
                 <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest flex items-center justify-end gap-1">
                    <Clock size={10} /> 
                    {user.lastActive.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}
                 </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminActiveSessions;
