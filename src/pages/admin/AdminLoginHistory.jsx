import React, { useState, useEffect, useMemo } from 'react';
import { collection, query, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '../../firebase';
import { Key, Smartphone, Calendar, Search, Monitor, Laptop, AlertCircle, Clock } from 'lucide-react';

const AdminLoginHistory = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Date filters - default to today
  const today = new Date().toISOString().split('T')[0];
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);

  useEffect(() => {
    const q = query(collection(db, 'login_sessions'), orderBy('timestamp', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const sessList = [];
      snapshot.forEach(doc => {
        sessList.push({ id: doc.id, ...doc.data() });
      });
      setSessions(sessList);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching login sessions", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const filteredSessions = useMemo(() => {
    return sessions.filter(sess => {
      if (!sess.timestamp) return false;
      const sessDate = sess.timestamp.toDate();
      const sDate = new Date(startDate);
      sDate.setHours(0, 0, 0, 0);
      const eDate = new Date(endDate);
      eDate.setHours(23, 59, 59, 999);
      
      return sessDate >= sDate && sessDate <= eDate;
    });
  }, [sessions, startDate, endDate]);

  const getDeviceIcon = (deviceName) => {
    if (!deviceName) return <Monitor size={16} className="text-gray-500" />;
    if (deviceName.includes('Mobile') || deviceName.includes('Android') || deviceName.includes('iOS')) return <Smartphone size={16} className="text-blue-500" />;
    if (deviceName.includes('Mac') || deviceName.includes('Windows')) return <Laptop size={16} className="text-purple-500" />;
    return <Monitor size={16} className="text-gray-500" />;
  };

  if (loading) return <div className="p-8 text-center text-gray-500 font-bold uppercase tracking-widest text-[10px]">Loading History...</div>;

  return (
    <div className="p-4 space-y-6 pb-24">
      {/* Header Banner */}
      <div className="border border-gray-900 rounded-[2.5rem] p-6 bg-white shadow-sm relative overflow-hidden group">
         <div className="absolute top-0 right-0 w-32 h-32 bg-gray-900/5 rounded-full blur-3xl"></div>
         <div className="flex gap-4 items-center mb-6">
            <div className="w-14 h-14 bg-gray-50 text-gray-900 rounded-2xl flex items-center justify-center shadow-sm border border-gray-900 shrink-0">
               <Key size={24} />
            </div>
            <div className="flex-grow">
               <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight">Login History</h2>
               <p className="text-gray-500 font-bold text-[10px] uppercase tracking-widest leading-none mt-1">Session Tracking Analytics</p>
            </div>
         </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-[2rem] border border-gray-900 shadow-sm space-y-5">
         <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
            <Calendar size={18} className="text-gray-900" />
            <h3 className="font-black text-sm text-gray-900 uppercase tracking-tight">Date Explorer</h3>
         </div>
         
         <div className="flex gap-4">
            <div className="flex-1">
               <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Start Date</label>
               <input 
                 type="date" 
                 value={startDate}
                 onChange={(e) => setStartDate(e.target.value)}
                 className="w-full bg-gray-50 border border-gray-800 text-gray-800 text-xs font-black uppercase tracking-wider rounded-xl px-4 py-3 outline-none focus:border-gray-900"
               />
            </div>
            <div className="flex-1">
               <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">End Date</label>
               <input 
                 type="date" 
                 value={endDate}
                 onChange={(e) => setEndDate(e.target.value)}
                 className="w-full bg-gray-50 border border-gray-800 text-gray-800 text-xs font-black uppercase tracking-wider rounded-xl px-4 py-3 outline-none focus:border-gray-900"
               />
            </div>
         </div>
      </div>

      {/* List */}
      <div className="space-y-3">
         <div className="flex justify-between items-center px-2">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Logs Found: {filteredSessions.length}</span>
         </div>
         
         {filteredSessions.length === 0 ? (
           <div className="bg-gray-50 rounded-[2rem] p-12 text-center border border-gray-900 shadow-inner">
              <Search className="mx-auto text-gray-300 mb-4 opacity-50" size={48} />
              <p className="text-[12px] font-black uppercase tracking-widest text-gray-400 italic">No logins found in this range.</p>
           </div>
         ) : (
           filteredSessions.map(session => (
             <div key={session.id} className="bg-white rounded-3xl p-5 shadow-sm border border-gray-900 flex flex-col gap-3">
                <div className="flex justify-between items-start border-b border-gray-50 pb-3">
                   <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center border border-gray-200 shadow-sm">
                         {getDeviceIcon(session.deviceName || '')}
                      </div>
                      <div>
                         <h4 className="font-black text-gray-900 text-sm tracking-tight uppercase">{session.userName || 'Unknown'}</h4>
                         <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mt-1">{session.deviceName || 'Unknown Device'}</p>
                      </div>
                   </div>
                   <div className="text-right">
                      <p className="text-[10px] font-black text-gray-900 uppercase">{session.timestamp ? session.timestamp.toDate().toLocaleDateString('en-GB') : 'N/A'}</p>
                      <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest flex items-center justify-end gap-1 mt-1">
                         <Clock size={10} /> 
                         {session.timestamp ? session.timestamp.toDate().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }) : ''}
                      </p>
                   </div>
                </div>
                <div className="bg-gray-50 rounded-xl p-3 border border-gray-100 flex items-start gap-2">
                   <AlertCircle size={14} className="text-gray-400 shrink-0 mt-0.5" />
                   <p className="text-[8px] text-gray-500 font-bold uppercase tracking-widest leading-relaxed break-all">
                      {session.userAgent || 'No user agent data'}
                   </p>
                </div>
             </div>
           ))
         )}
      </div>
    </div>
  );
};

export default AdminLoginHistory;
