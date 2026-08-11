import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { 
  Home as HomeIcon, 
  Gavel, 
  ScrollText, 
  ShoppingCart, 
  User, 
  Download,
  LayoutDashboard,
  Megaphone,
  Settings2,
  Users,
  BarChart3,
  Settings,
  ShieldAlert,
  Ticket,
  Bell,
  X,
  Trophy,
  Info,
  ChevronLeft,
  Wallet
} from 'lucide-react';
import PullToRefresh from './PullToRefresh';

export const Header = ({ title, showBack = false }) => {
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const { notifications, adminAlerts, markAllRead, lastAnnouncement, hoveringNews, appSettings } = useCart();
  const [showNotifs, setShowNotifs] = useState(false);
  
  const displayTitle = title || appSettings.brandName || "SECURE PORTAL";

  const unreadCount = notifications.filter(n => !n.read).length + adminAlerts.length;

  const handleOpenNotifs = () => {
    setShowNotifs(true);
  };

  return (
    <>
      <header className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white flex flex-col z-[1000] shadow-md w-full shrink-0 border-b border-white/10 overflow-hidden">
        <div className="flex items-center justify-between px-4" style={{ height: '70px' }}>
          <div className="flex items-center gap-3">
            {showBack ? (
              <button 
                onClick={() => navigate(-1)} 
                className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center border border-white/20 hover:bg-white/20 transition-all active:scale-95"
              >
                <ChevronLeft size={24} />
              </button>
            ) : (
              <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center border border-white/20">
                 <img src="https://img.icons8.com/color/48/000000/treasure-chest.png" alt="Logo" className="w-7 h-7" />
              </div>
            )}
            <h1 className="text-lg font-outfit font-bold tracking-tight uppercase leading-none">{displayTitle}</h1>
          </div>
          <div className="flex items-center gap-2">
            {user && (
              <button 
                onClick={handleOpenNotifs}
                className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center hover:bg-white/10 transition-all border border-white/10 relative"
              >
                <Bell size={22} strokeWidth={2.5} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-[9px] font-bold w-5 h-5 rounded-full flex items-center justify-center ring-2 ring-blue-900 animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>
            )}
            <NavLink to="/profile" className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center hover:bg-white/10 transition-all border border-white/10 pointer-events-auto">
              <User size={22} strokeWidth={2.5} />
            </NavLink>
          </div>
        </div>

        {/* Global Result Ticker / Breaking News */}
        <AnimatePresence>
          {hoveringNews && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="bg-indigo-950/80 text-[10px] font-bold uppercase text-blue-200 py-2 border-t border-white/10 overflow-hidden whitespace-nowrap"
            >
              <div className="animate-marquee inline-block px-4">
                <span className="text-white px-2 py-0.5 bg-blue-600 rounded mr-4 font-bold text-[9px]">LATEST NEWS</span>
                {hoveringNews} • {hoveringNews} • {hoveringNews} • 
              </div>
            </motion.div>
          )}
          {lastAnnouncement && !hoveringNews && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="bg-indigo-950/80 text-[10px] font-bold uppercase text-blue-200 py-2 border-t border-white/10 overflow-hidden whitespace-nowrap"
            >
              <div className="animate-marquee inline-block px-4">
                <span className="text-white px-2 py-0.5 bg-blue-600 rounded mr-4 font-bold text-[9px]">BREAKING NEWS</span>
                {lastAnnouncement.message} • {lastAnnouncement.ticker} • CHECK RESULTS TAB FOR DETAILS • 
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Notification Drawer Overlay */}
      <AnimatePresence>
        {showNotifs && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowNotifs(false)}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[2000]"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-[85%] max-w-[400px] bg-slate-50 z-[2001] shadow-2xl flex flex-col"
            >
              <div className="bg-blue-900 p-6 text-white shrink-0">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-2">
                    <Bell size={24} fill="white" />
                    <h2 className="text-xl font-bold uppercase tracking-tight">Notifications</h2>
                  </div>
                  <button onClick={() => setShowNotifs(false)} className="bg-white/10 p-2 rounded-xl hover:bg-white/20 transition-all">
                    <X size={20} />
                  </button>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-xs font-medium opacity-80">{unreadCount} New Alerts</p>
                  <button onClick={markAllRead} className="text-[10px] font-bold uppercase tracking-wider hover:underline text-blue-200">Mark all as read</button>
                </div>
              </div>

              <div className="flex-grow overflow-y-auto p-4 space-y-3 scrollbar-hide">
                {notifications.length === 0 && adminAlerts.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full opacity-40 space-y-4 text-slate-500">
                    <Bell size={48} strokeWidth={1.5} />
                    <p className="font-medium text-sm">No notifications yet</p>
                  </div>
                ) : (
                  <>
                    {/* Admin Specific Alerts */}
                    {adminAlerts.map((a) => (
                      <div 
                        key={a.id} 
                        onClick={() => {
                          setShowNotifs(false);
                          navigate(a.source === 'withdrawal' ? '/admin/withdrawals' : '/admin/approvals');
                        }}
                        className="p-4 rounded-xl border bg-white border-amber-200 shadow-sm cursor-pointer hover:bg-amber-50 transition-all flex gap-3 items-start"
                      >
                         <div className="w-10 h-10 rounded-lg shrink-0 flex items-center justify-center bg-amber-100 text-amber-700">
                           {a.source === 'withdrawal' ? <Wallet size={18} /> : <ShoppingCart size={18} />}
                         </div>
                         <div className="flex-grow">
                            <h4 className="text-[13px] font-bold text-slate-800 mb-1 flex items-center justify-between">
                               {a.title} 
                               <span className="bg-amber-100 text-amber-700 text-[9px] px-1.5 py-0.5 rounded uppercase font-bold">ACTION</span>
                            </h4>
                            <p className="text-[11px] font-medium text-slate-500 leading-relaxed">{a.message}</p>
                            <span className="text-[9px] font-bold text-slate-400 mt-2 block">
                               {a.timestamp?.toDate ? a.timestamp.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'JUST NOW'}
                            </span>
                         </div>
                      </div>
                    ))}

                    {/* Standard User Notifications */}
                    {notifications.map((n) => (
                      <div key={n.id} className={`p-4 rounded-xl border transition-all flex gap-3 items-start ${n.read ? 'bg-slate-50 border-slate-100' : 'bg-white border-blue-100 shadow-sm'}`}>
                        <div className={`w-10 h-10 rounded-lg shrink-0 flex items-center justify-center ${
                          n.type === 'win' ? 'bg-emerald-100 text-emerald-700' :
                          n.type === 'result' ? 'bg-indigo-100 text-indigo-700' :
                          'bg-blue-100 text-blue-700'
                        }`}>
                          {n.type === 'win' ? <Trophy size={18} /> : 
                           n.type === 'result' ? <Megaphone size={18} /> : 
                           <Info size={18} />}
                        </div>
                        <div className="flex-grow pr-2">
                          <h4 className="text-[13px] font-bold text-slate-800 mb-0.5">{n.title}</h4>
                          <p className="text-[11px] font-medium text-slate-500 leading-relaxed">{n.message}</p>
                          <span className="text-[9px] font-bold text-slate-400 mt-2 block">{n.time}</span>
                        </div>
                        {!n.read && <div className="w-2 h-2 shrink-0 bg-blue-500 rounded-full mt-2"></div>}
                      </div>
                    ))}
                  </>
                )}
              </div>

              <div className="p-4 border-t border-slate-200 shrink-0 bg-white">
                 <button onClick={() => setShowNotifs(false)} className="w-full py-3 bg-slate-800 text-white rounded-xl font-bold text-[12px] uppercase tracking-wide hover:bg-slate-700 transition-colors">Close Panel</button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export const BottomNav = () => {
  const { user } = useAuth();
  const { appSettings } = useCart();
  const isAdmin = user?.role === 'admin';

  const userLinks = [
    { to: '/home', icon: HomeIcon },
    { to: '/tickets', icon: Ticket },
    { to: '/results', icon: ScrollText },
    { to: '/cart', icon: ShoppingCart },
  ];

  const adminLinks = [
    { to: '/admin', icon: LayoutDashboard },
    { to: '/admin/announcements', icon: Megaphone },
    { to: '/admin/control', icon: ShieldAlert },
    { to: '/admin/users', icon: Users },
    { to: '/admin/reports', icon: BarChart3 },
    { to: '/admin/settings', icon: Settings },
  ];

  const links = isAdmin ? adminLinks : userLinks;

  return (
    <div className="w-full bg-white border-t border-slate-200 pointer-events-auto shrink-0 shadow-[0_-4px_20px_rgba(0,0,0,0.03)] z-50 relative">
      <div className="bg-slate-50 text-slate-500 py-1.5 text-center font-bold text-[9px] tracking-widest border-b border-slate-200 uppercase">
        {isAdmin ? 'Admin Dashboard' : appSettings.brandName}
      </div>
      
      <nav className="flex justify-around items-center py-3 px-2 bg-white pb-safe">
        {links.map((link, idx) => (
          <NavLink 
            key={idx}
            to={link.to} 
            end={link.to === '/admin'}
            className={({ isActive }) => `flex flex-col items-center gap-1.5 p-2 rounded-lg transition-colors ${
              isActive 
                ? 'text-blue-600' 
                : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
            }`}
          >
            {({ isActive }) => (
              <>
                <link.icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                <div className={`w-1 h-1 rounded-full bg-blue-600 transition-opacity ${isActive ? 'opacity-100' : 'opacity-0'}`}></div>
              </>
            )}
          </NavLink>
        ))}
      </nav>
      {/* Safe area spacing for iOS home indicator */}
      <div className="h-safe-bottom bg-white w-full"></div>
    </div>
  );
};

export const SupportSection = () => {
  const supportNumber = "447988024040";
  const displayMobile = "+44 79 88 02 40 40";
  
  const supportLinks = [
    { 
      icon: <img src="https://img.icons8.com/color/48/whatsapp--v1.png" alt="WA" className="w-7 h-7" />, 
      label: 'WhatsApp', 
      color: 'bg-emerald-50', 
      link: `https://wa.me/${supportNumber}` 
    },
    { 
      icon: <img src="https://img.icons8.com/color/48/telegram-app.png" alt="TG" className="w-7 h-7" />, 
      label: 'Telegram', 
      color: 'bg-blue-50', 
      link: `https://t.me/+${supportNumber}` 
    }
  ];

  return (
    <div className="mt-4 px-4 pb-6">
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm">
         <div className="flex flex-col gap-3">
             <div className="flex items-center justify-between">
               <div className="flex items-center gap-2">
                  <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Need Support?</p>
               </div>
               <span className="flex items-center gap-1.5 text-[9px] font-bold text-emerald-600 uppercase bg-emerald-50 px-2 py-0.5 rounded">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                  Online
               </span>
            </div>
            
             <div className="grid grid-cols-2 gap-3 mt-1">
               {supportLinks.map((item, idx) => (
                 <a
                   key={idx}
                   href={item.link}
                   target="_blank"
                   rel="noopener noreferrer"
                   className="flex flex-col items-center justify-center p-3 rounded-xl border border-slate-100 bg-slate-50 transition-colors hover:bg-slate-100"
                 >
                   <div className={`w-10 h-10 ${item.color} rounded-lg flex items-center justify-center mb-2`}>
                     {item.icon}
                   </div>
                   <p className="text-[11px] font-bold text-slate-700">{item.label}</p>
                 </a>
               ))}
             </div>
             <p className="text-[10px] font-medium text-slate-400 text-center mt-2">
               Official: {displayMobile}
             </p>
         </div>
      </div>
    </div>
  );
};

const PageWrapper = ({ children, title, showNav = true, showHeader = true, showBack = false, footerAction = null }) => {
  const { appSettings, loading } = useCart();
  const { refreshTickets } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (appSettings.brandName) {
      document.title = appSettings.brandName;
    }
  }, [appSettings.brandName]);
  
  const isAuthPage = window.location.pathname === '/login' || window.location.pathname === '/signup';
  const isAdminView = window.location.pathname.startsWith('/admin');

  if (loading) return null;

  if (appSettings.maintenanceMode && user?.role !== 'admin' && !isAuthPage) {
    return (
      <div className="flex flex-col h-screen w-full bg-slate-50 items-center justify-center p-10 text-center space-y-6">
        <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
           <ShieldAlert size={40} className="text-blue-600" />
        </div>
        <h1 className="text-2xl font-bold text-slate-800">System Maintenance</h1>
        <p className="text-sm font-medium text-slate-500 leading-relaxed max-w-sm">
          {appSettings.brandName} is currently undergoing scheduled system synchronization. We will be back shortly.
        </p>
        <button 
          onClick={() => navigate('/login')}
          className="text-[11px] font-bold text-slate-400 hover:text-blue-600 transition-colors pt-10"
        >
          Admin Access
        </button>
      </div>
    );
  }

  // Determine layout width globally (force mobile view for all pages, but responsive on small screens)
  const containerMaxWidth = "w-full sm:max-w-md";

  return (
    <div className={`flex flex-col h-[100dvh] bg-slate-50 relative ${containerMaxWidth} mx-auto sm:shadow-xl overflow-hidden sm:border-x border-slate-200`}>
      {showHeader && <Header title={title || appSettings.brandName} showBack={showBack} />}
      
      <motion.main 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="flex-grow bg-slate-50 overflow-y-auto scrollbar-hide pb-6"
      >
        <PullToRefresh onRefresh={refreshTickets}>
          {children}
        </PullToRefresh>
      </motion.main>
      
      {/* Footer Area: Actions above BottomNav */}
      <div className="shrink-0 w-full bg-transparent pointer-events-none z-40">
         {footerAction && (
           <div className="px-4 pb-4 pointer-events-auto">
             {footerAction}
           </div>
         )}
         {showNav && <BottomNav />}
      </div>
    </div>
  );
};

export default PageWrapper;
