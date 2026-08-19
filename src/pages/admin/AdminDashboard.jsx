import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  Ticket, 
  TrendingUp, 
  Wallet,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  ChevronRight,
  Target,
  Zap,
  Landmark,
  AlertCircle,
  BookOpen,
  Key
} from 'lucide-react';
import { subscribeToUsers, subscribeToResults, subscribeToTickets } from '../../services/firebaseService';
import PullToRefresh from '../../components/PullToRefresh';
import { APP_VERSION, BUILD_VERSION } from '../../config';
import { useAuth } from '../../context/AuthContext';
import { Database } from 'lucide-react';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState([
    { label: 'Total Users', value: '0', icon: Users, change: '0%', bg: 'bg-blue-600', text: 'text-white', iconBg: 'bg-blue-500', subText: 'text-blue-200', link: '/admin/users' },
    { label: 'Today Tickets', value: '0', icon: Ticket, change: '0%', bg: 'bg-emerald-600', text: 'text-white', iconBg: 'bg-emerald-500', subText: 'text-emerald-200', link: '/admin/today-tickets' },
    { label: 'Revenue (Today)', value: '₹0', icon: Wallet, change: '0%', bg: 'bg-amber-500', text: 'text-white', iconBg: 'bg-amber-400', subText: 'text-amber-100', link: '/admin/revenue' },
    { label: 'Active Sessions', value: '0', icon: TrendingUp, change: '0%', bg: 'bg-rose-600', text: 'text-white', iconBg: 'bg-rose-500', subText: 'text-rose-200', link: '/admin/active-sessions' },
    { label: 'Login History', value: 'Logs', icon: Key, change: '0%', bg: 'bg-purple-600', text: 'text-white', iconBg: 'bg-purple-500', subText: 'text-purple-200', link: '/admin/login-history' },
  ]);

  const { user } = useAuth();
  const [recentDraws, setRecentDraws] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribeResults;
    let unsubscribeUsers;
    let unsubscribeTickets;

    const calculateStats = (usersData, ticketsData) => {
      const now = new Date();
      const todayStr = now.toLocaleDateString();
      
      const todayTicketsCount = ticketsData.filter(t => {
         if (!t.timestamp) return false;
         return t.timestamp.toDate().toLocaleDateString() === todayStr;
      }).length;

      const totalRevenue = ticketsData.reduce((sum, t) => sum + (parseFloat(t.price || 0) * (t.qty || 1)), 0);

      setStats([
        { label: 'Total Users', value: usersData.length.toString(), icon: Users, change: '+0%', bg: 'bg-blue-600', text: 'text-white', iconBg: 'bg-blue-500', subText: 'text-blue-200', link: '/admin/users' },
        { label: 'Today Tickets', value: todayTicketsCount.toString(), icon: Ticket, change: '+0%', bg: 'bg-emerald-600', text: 'text-white', iconBg: 'bg-emerald-500', subText: 'text-emerald-200', link: '/admin/today-tickets' },
        { label: 'Revenue (Lifetime)', value: `₹${totalRevenue.toLocaleString()}`, icon: Wallet, change: '+0%', bg: 'bg-amber-500', text: 'text-white', iconBg: 'bg-amber-400', subText: 'text-amber-100', link: '/admin/revenue' },
        { label: 'Active Sessions', value: 'Live', icon: TrendingUp, change: 'Stable', bg: 'bg-rose-600', text: 'text-white', iconBg: 'bg-rose-500', subText: 'text-rose-200', link: '/admin/active-sessions' },
        { label: 'Login History', value: 'Logs', icon: Key, change: '0%', bg: 'bg-purple-600', text: 'text-white', iconBg: 'bg-purple-500', subText: 'text-purple-200', link: '/admin/login-history' },
      ]);
      setLoading(false);
    };

    let latestUsers = [];
    let latestTickets = [];
    let usersLoaded = false;
    let ticketsLoaded = false;

    try {
      unsubscribeUsers = subscribeToUsers((users) => {
        latestUsers = users;
        usersLoaded = true;
        if (usersLoaded && ticketsLoaded) calculateStats(latestUsers, latestTickets);
      });

      unsubscribeTickets = subscribeToTickets((tickets) => {
        latestTickets = tickets;
        ticketsLoaded = true;
        if (usersLoaded && ticketsLoaded) calculateStats(latestUsers, latestTickets);
      });

      unsubscribeResults = subscribeToResults((results) => {
         setRecentDraws(results.slice(0, 4));
      });

    } catch (error) {
      console.error("Dashboard data fetch error:", error);
      setLoading(false);
    }

    return () => {
      if (unsubscribeResults) unsubscribeResults();
      if (unsubscribeUsers) unsubscribeUsers();
      if (unsubscribeTickets) unsubscribeTickets();
    };
  }, []);

  const handleRefresh = async () => {
    // Since listeners are active, just provide a smooth UI delay
    await new Promise(r => setTimeout(r, 600));
  };

  return (
    <PullToRefresh onRefresh={handleRefresh}>
      <div className="space-y-10 pb-20 p-4">
      {/* Premium Admin Header */}
      <div className="border-[1.5px] border-primary rounded-[2.5rem] p-6 bg-white shadow-2xl relative overflow-hidden group">
         <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl"></div>
         <div className="flex gap-4 items-center mb-6">
            <img src="https://img.icons8.com/color/64/000000/treasure-chest.png" alt="Chest" className="w-16 h-16 drop-shadow-xl" />
            <div className="flex-grow">
               <h2 className="text-2xl font-black text-gray-900 font-condensed uppercase tracking-tighter italic">Command Center</h2>
               <p className="text-primary font-black text-[10px] uppercase tracking-widest leading-none mt-1">SMS Lottery Oversight v4.1</p>
            </div>
         </div>
         
         <div className="flex bg-gray-50 p-4 rounded-2xl items-center justify-between">
            <div className="flex items-center gap-3">
               <Zap className={`${loading ? 'text-gray-300' : 'text-amber-500'} animate-pulse`} size={20} fill="currentColor" />
               <span className="text-[10px] font-black text-gray-800 uppercase tracking-widest">{loading ? "Synchronizing..." : "Real-Time Data Active"}</span>
            </div>
            <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Sync Priority: High</span>
         </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3 mt-6">
        {stats.map((stat, idx) => (
          <div 
            key={idx} 
            onClick={() => stat.link && navigate(stat.link)}
            className={`${stat.bg} rounded-3xl p-4 sm:p-5 shadow-lg relative overflow-hidden flex flex-col justify-between ${stat.link ? 'cursor-pointer hover:opacity-90 active:scale-95 transition-all' : ''}`}
          >
            <div className="flex items-center gap-2 mb-3">
               <div className={`w-10 h-10 ${stat.iconBg} rounded-2xl flex items-center justify-center shrink-0 shadow-inner`}>
                  <stat.icon size={18} className="text-white" />
               </div>
               <div>
                  <h3 className={`text-[9px] sm:text-[10px] font-black ${stat.subText} uppercase tracking-widest leading-tight`}>{stat.label.split(' ')[0]}<br/>{stat.label.split(' ').slice(1).join(' ')}</h3>
               </div>
            </div>
            
            <div className="mt-1">
               <p className={`text-2xl sm:text-3xl font-black ${stat.text} tracking-tighter italic`}>{stat.value}</p>
               <p className={`text-[9px] sm:text-[10px] font-black uppercase tracking-widest mt-1 ${stat.subText}`}>{stat.change} VS YESTERDAY</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 mt-4">
         <button 
           onClick={() => { window.location.href = '/admin/approvals'; }}
           className="w-full bg-[#2563eb] text-white p-5 rounded-3xl shadow-[0_10px_30px_-10px_rgba(37,99,235,0.5)] flex items-center justify-between active:scale-95 transition-all h-full"
         >
           <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm shrink-0">
                 <span className="font-black text-white italic text-xl">₹</span>
              </div>
              <div className="text-left">
                 <h3 className="font-black text-lg md:text-base uppercase tracking-tight leading-none italic">Payments</h3>
                 <p className="text-[10px] md:text-[9px] font-black uppercase tracking-[0.2em] text-white/70 mt-1 line-clamp-1">Review topups</p>
              </div>
           </div>
           <ChevronRight size={24} className="text-white/50 shrink-0" />
         </button>

         <button 
           onClick={() => { window.location.href = '/admin/withdrawals'; }}
           className="w-full bg-emerald-600 text-white p-5 rounded-3xl shadow-[0_10px_30px_-10px_rgba(5,150,105,0.5)] flex items-center justify-between active:scale-95 transition-all h-full"
         >
           <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm shrink-0">
                 <Landmark size={24} className="text-white" />
              </div>
              <div className="text-left">
                 <h3 className="font-black text-lg md:text-base uppercase tracking-tight leading-none italic">Withdrawals</h3>
                 <p className="text-[10px] md:text-[9px] font-black uppercase tracking-[0.2em] text-white/70 mt-1 line-clamp-1">Process payouts</p>
              </div>
           </div>
           <ChevronRight size={24} className="text-white/50 shrink-0" />
         </button>

         <button 
           onClick={() => { window.location.href = '/admin/guide'; }}
           className="w-full bg-slate-800 text-white p-5 rounded-3xl shadow-[0_10px_30px_-10px_rgba(30,41,59,0.5)] flex items-center justify-between active:scale-95 transition-all h-full"
         >
           <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm shrink-0">
                 <BookOpen size={24} className="text-white" />
              </div>
              <div className="text-left">
                 <h3 className="font-black text-lg md:text-base uppercase tracking-tight leading-none italic">System Guide</h3>
                 <p className="text-[10px] md:text-[9px] font-black uppercase tracking-[0.2em] text-white/70 mt-1 line-clamp-1">Read the manual</p>
              </div>
           </div>
           <ChevronRight size={24} className="text-white/50 shrink-0" />
         </button>

         {user?.isSuperAdmin && (
           <button 
             onClick={() => { window.location.href = '/admin/migration'; }}
             className="w-full bg-[#5b45ff] text-white p-5 rounded-3xl shadow-[0_10px_30px_-10px_rgba(91,69,255,0.5)] flex items-center justify-between active:scale-95 transition-all h-full"
           >
             <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/20 shrink-0">
                   <Database size={24} className="text-white" />
                </div>
                <div className="text-left">
                   <h3 className="font-black text-lg md:text-base uppercase tracking-tight italic">Migration</h3>
                   <p className="text-[10px] md:text-[9px] font-black uppercase tracking-[0.2em] text-white/70 mt-1 line-clamp-1">Sync old data</p>
                </div>
             </div>
             <ChevronRight size={24} className="text-white/50 shrink-0" />
           </button>
         )}
      </div>

      {/* Main Reports Area */}
      <div className="space-y-8">
        {/* Draw Performance */}
        <div className="bg-white rounded-[2.5rem] shadow-xl border-2 border-gray-900 overflow-hidden p-6">
           <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                 <Target className="text-primary-hover" size={24} />
                 <h2 className="text-xl font-black text-gray-800 font-condensed uppercase tracking-tighter">Recent Results</h2>
              </div>
              <button className="text-primary-hover text-[10px] font-extrabold uppercase tracking-widest bg-indigo-50 px-4 py-2 rounded-full">Explore All</button>
           </div>
           
           <div className="flex flex-col">
              {recentDraws.length > 0 ? recentDraws.map((draw, idx) => (
                <div key={idx} className={`flex flex-col gap-4 p-5 bg-white hover:bg-gray-50 transition-all group ${idx !== recentDraws.length - 1 ? 'border-b-2 border-gray-800' : ''}`}>
                   <div className="flex justify-between items-center">
                      <div className="flex items-center gap-4">
                         <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center font-black text-gray-800 shadow-sm group-hover:scale-110 transition-transform">{draw.draw?.split(':')[0] || '--'}</div>
                         <div>
                            <p className="text-[10px] font-black text-gray-800 uppercase tracking-tight">{draw.brand} {draw.draw}</p>
                            <p className="text-[8px] text-gray-400 font-bold uppercase tracking-widest">{draw.date || 'Today'}</p>
                         </div>
                      </div>
                      <div className="text-right">
                         <p className="text-[12px] font-black text-gray-900 tracking-[0.2em]">{draw.number}</p>
                         <span className="text-[8px] font-black uppercase tracking-widest text-primary-hover opacity-40">Declared</span>
                      </div>
                   </div>
                </div>
              )) : (
                <div className="text-center py-10 opacity-20">
                   <p className="text-[10px] font-black uppercase tracking-widest italic">No Recent Results Declared</p>
                </div>
              )}
           </div>
        </div>

        {/* Live System Log */}
        <div className="bg-gray-900 rounded-[2.5rem] p-8 shadow-2xl text-white relative overflow-hidden">
           <div className="absolute top-0 right-0 p-4 opacity-5 bg-white rounded-bl-[2.5rem]">
              <Clock size={48} />
           </div>
           
           <h2 className="text-xl font-black font-condensed uppercase tracking-tighter mb-8 flex items-center gap-3">
              <Zap className="text-amber-500" size={20} fill="currentColor" /> System Intelligence
           </h2>
           
           <div className="space-y-6">
              {[
                { user: 'Admin System', action: 'FIREBASE SYNC ACTIVE', time: 'Just Now', color: 'text-primary-hover' },
                { user: 'Security Module', action: 'DATABASE COMPRESSION: 0%', time: 'Stable', color: 'text-blue-400' },
                { user: 'Traffic Monitor', action: 'GATEWAY STATUS: OPTIMAL', time: 'Active', color: 'text-emerald-400' },
              ].map((log, idx) => (
                <div key={idx} className="flex gap-4 items-start border-l-2 border-white/10 pl-5 relative">
                   <div className="absolute left-[-5px] top-1.5 w-2 h-2 bg-primary-hover rounded-full shadow-[0_0_10px_rgba(244,36,100,0.8)]"></div>
                   <div className="flex-grow">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{log.user}</p>
                      <p className={`text-base font-black italic tracking-tight ${log.color} mt-1 uppercase`}>{log.action}</p>
                      <p className="text-[8px] text-gray-500 font-bold uppercase mt-1">{log.time}</p>
                   </div>
                   <ChevronRight size={16} className="text-white/10" />
                </div>
              ))}
           </div>
        </div>

        <div className="mt-8 p-6 text-center border border-primary-hover/20 bg-primary-hover/5 rounded-2xl shadow-sm space-y-2">
           <p className="text-[11px] text-gray-800 font-black uppercase tracking-widest flex items-center justify-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Admin Core System: <span className="text-primary-hover">{APP_VERSION}</span>
           </p>
           <div className="w-16 h-[1px] bg-gray-200 mx-auto my-2"></div>
           <p className="text-[10px] text-gray-600 font-bold uppercase tracking-[0.2em] italic leading-tight">
              Build: <span className="text-gray-900 font-black">{BUILD_VERSION}</span>
           </p>
        </div>
      </div>
      </div>
    </PullToRefresh>
  );
};

export default AdminDashboard;

