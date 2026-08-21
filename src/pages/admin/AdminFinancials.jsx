import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Landmark, ArrowLeft, Loader2 } from 'lucide-react';
import { 
  subscribeToTickets, 
  subscribeToPendingTransactions, 
  subscribeToWithdrawals,
  subscribeToUsers
} from '../../services/firebaseService';
import { 
  LineChart, Line, AreaChart, Area, BarChart, Bar, 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend 
} from 'recharts';

const AdminFinancials = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  
  const [todayFinancials, setTodayFinancials] = useState({
    sales: 0,
    winnings: 0,
    gameProfit: 0,
    gameLoss: 0,
    deposits: 0,
    withdrawals: 0,
    cashProfit: 0,
    cashLoss: 0
  });

  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    let unsubscribeTickets;
    let unsubscribeTransactions;
    let unsubscribeWithdrawals;
    let unsubscribeUsers;

    let latestTickets = [];
    let latestTransactions = [];
    let latestWithdrawals = [];
    let latestUsers = [];
    let ticketsLoaded = false;
    let transactionsLoaded = false;
    let withdrawalsLoaded = false;
    let usersLoaded = false;

    const calculateTodayFinancials = () => {
      const now = new Date();
      const todayStr = now.toLocaleDateString();

      // 1. Sales
      const todaySales = latestTickets.reduce((sum, t) => {
        if (!t.timestamp || t.timestamp.toDate().toLocaleDateString() !== todayStr) return sum;
        return sum + (parseFloat(t.price || 0) * (t.qty || 1));
      }, 0);

      // 2. Winnings
      const todayWinnings = latestTickets.reduce((sum, t) => {
        if (t.status !== 'won') return sum;
        if (!t.timestamp || t.timestamp.toDate().toLocaleDateString() !== todayStr) return sum;
        return sum + parseFloat(t.winAmount || 0);
      }, 0);

      const gameProfit = todaySales > todayWinnings ? todaySales - todayWinnings : 0;
      const gameLoss = todayWinnings > todaySales ? todayWinnings - todaySales : 0;

      // 3. Deposits
      const todayDeposits = latestTransactions.reduce((sum, tx) => {
        if (tx.status !== 'approved') return sum;
        if (!tx.timestamp || tx.timestamp.toDate().toLocaleDateString() !== todayStr) return sum;
        return sum + parseFloat(tx.amount || 0);
      }, 0);

      // 4. Withdrawals
      const todayWithdrawals = latestWithdrawals.reduce((sum, w) => {
        if (w.status !== 'approved') return sum;
        if (!w.timestamp || w.timestamp.toDate().toLocaleDateString() !== todayStr) return sum;
        return sum + parseFloat(w.amount || 0);
      }, 0);

      const cashProfit = todayDeposits > todayWithdrawals ? todayDeposits - todayWithdrawals : 0;
      const cashLoss = todayWithdrawals > todayDeposits ? todayWithdrawals - todayDeposits : 0;

      setTodayFinancials({
        sales: todaySales,
        winnings: todayWinnings,
        gameProfit,
        gameLoss,
        deposits: todayDeposits,
        withdrawals: todayWithdrawals,
        cashProfit,
        cashLoss
      });
    };

    const calculateTimeSeriesData = () => {
      const days = 7;
      const data = [];
      const now = new Date();
      now.setHours(0,0,0,0); // start of today

      for (let i = days - 1; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        const dateStr = d.toLocaleDateString();
        const shortDate = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

        // Sales for this day
        const daySales = latestTickets.reduce((sum, t) => {
           if (!t.timestamp || t.timestamp.toDate().toLocaleDateString() !== dateStr) return sum;
           return sum + (parseFloat(t.price || 0) * (t.qty || 1));
        }, 0);

        // Winnings for this day
        const dayWinnings = latestTickets.reduce((sum, t) => {
           if (t.status !== 'won') return sum;
           if (!t.timestamp || t.timestamp.toDate().toLocaleDateString() !== dateStr) return sum;
           return sum + parseFloat(t.winAmount || 0);
        }, 0);

        const dayProfit = daySales > dayWinnings ? daySales - dayWinnings : 0;
        const dayLoss = dayWinnings > daySales ? dayWinnings - daySales : 0;

        // New Users for this day
        const newUsers = latestUsers.reduce((count, u) => {
           if (!u.createdAt || u.createdAt.toDate().toLocaleDateString() !== dateStr) return count;
           return count + 1;
        }, 0);

        data.push({
          date: shortDate,
          sales: daySales,
          winnings: dayWinnings,
          profit: dayProfit,
          loss: dayLoss,
          newUsers: newUsers
        });
      }
      setChartData(data);
      setLoading(false);
    };

    const processAllData = () => {
      if (ticketsLoaded && transactionsLoaded && withdrawalsLoaded && usersLoaded) {
        calculateTodayFinancials();
        calculateTimeSeriesData();
      }
    };

    unsubscribeTickets = subscribeToTickets((tickets) => {
      latestTickets = tickets;
      ticketsLoaded = true;
      processAllData();
    });

    unsubscribeTransactions = subscribeToPendingTransactions((txs) => {
      latestTransactions = txs;
      transactionsLoaded = true;
      processAllData();
    });

    unsubscribeWithdrawals = subscribeToWithdrawals((withdrawals) => {
      latestWithdrawals = withdrawals;
      withdrawalsLoaded = true;
      processAllData();
    });

    unsubscribeUsers = subscribeToUsers((users) => {
      latestUsers = users;
      usersLoaded = true;
      processAllData();
    });

    return () => {
      if (unsubscribeTickets) unsubscribeTickets();
      if (unsubscribeTransactions) unsubscribeTransactions();
      if (unsubscribeWithdrawals) unsubscribeWithdrawals();
      if (unsubscribeUsers) unsubscribeUsers();
    };
  }, []);

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="bg-indigo-600 text-white p-6 rounded-b-[2rem] shadow-lg sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/admin')} className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition-all">
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-2xl font-black italic tracking-tighter uppercase leading-none">Financials</h1>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-200 mt-1">Real-Time Core Metrics</p>
          </div>
        </div>
      </div>

      <div className="p-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-indigo-600">
            <Loader2 className="w-12 h-12 animate-spin mb-4" />
            <p className="font-black text-sm uppercase tracking-widest">Aggregating Data...</p>
          </div>
        ) : (
          <div className="bg-white rounded-3xl shadow-xl p-6 border-[1.5px] border-slate-200">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center">
                <Landmark size={24} />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter italic leading-none">Today's Overview</h3>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Automated Profit/Loss Analysis</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
               {/* Game Metrics */}
               <div className="bg-indigo-50 rounded-2xl p-4 sm:p-5 flex flex-col justify-between border border-indigo-100">
                  <p className="text-[9px] sm:text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-1">Total Sales</p>
                  <p className="text-2xl sm:text-3xl font-black text-indigo-700 italic">₹ {todayFinancials.sales.toLocaleString()}</p>
               </div>
               <div className="bg-emerald-50 rounded-2xl p-4 sm:p-5 flex flex-col justify-between border border-emerald-100">
                  <p className="text-[9px] sm:text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-1">Total Winnings</p>
                  <p className="text-2xl sm:text-3xl font-black text-emerald-700 italic">₹ {todayFinancials.winnings.toLocaleString()}</p>
               </div>
               <div className="bg-teal-50 rounded-2xl p-4 sm:p-5 flex flex-col justify-between border border-teal-100">
                  <p className="text-[9px] sm:text-[10px] font-black text-teal-500 uppercase tracking-widest mb-1">Game Profit</p>
                  <p className="text-2xl sm:text-3xl font-black text-teal-700 italic">₹ {todayFinancials.gameProfit.toLocaleString()}</p>
               </div>
               <div className="bg-rose-50 rounded-2xl p-4 sm:p-5 flex flex-col justify-between border border-rose-100">
                  <p className="text-[9px] sm:text-[10px] font-black text-rose-500 uppercase tracking-widest mb-1">Game Loss</p>
                  <p className="text-2xl sm:text-3xl font-black text-rose-700 italic">₹ {todayFinancials.gameLoss.toLocaleString()}</p>
               </div>

               {/* Cash Flow Metrics */}
               <div className="bg-blue-50 rounded-2xl p-4 sm:p-5 flex flex-col justify-between border border-blue-100 mt-2">
                  <p className="text-[9px] sm:text-[10px] font-black text-blue-500 uppercase tracking-widest mb-1">Total Deposits</p>
                  <p className="text-2xl sm:text-3xl font-black text-blue-700 italic">₹ {todayFinancials.deposits.toLocaleString()}</p>
               </div>
               <div className="bg-orange-50 rounded-2xl p-4 sm:p-5 flex flex-col justify-between border border-orange-100 mt-2">
                  <p className="text-[9px] sm:text-[10px] font-black text-orange-500 uppercase tracking-widest mb-1">Total Withdrawals</p>
                  <p className="text-2xl sm:text-3xl font-black text-orange-700 italic">₹ {todayFinancials.withdrawals.toLocaleString()}</p>
               </div>
               <div className="bg-fuchsia-50 rounded-2xl p-4 sm:p-5 flex flex-col justify-between border border-fuchsia-100">
                  <p className="text-[9px] sm:text-[10px] font-black text-fuchsia-500 uppercase tracking-widest mb-1">Cash Profit</p>
                  <p className="text-2xl sm:text-3xl font-black text-fuchsia-700 italic">₹ {todayFinancials.cashProfit.toLocaleString()}</p>
               </div>
               <div className="bg-red-50 rounded-2xl p-4 sm:p-5 flex flex-col justify-between border border-red-100">
                  <p className="text-[9px] sm:text-[10px] font-black text-red-500 uppercase tracking-widest mb-1">Cash Loss</p>
                  <p className="text-2xl sm:text-3xl font-black text-red-700 italic">₹ {todayFinancials.cashLoss.toLocaleString()}</p>
               </div>
            </div>
          </div>
        )}

        {/* Charts Section */}
        {!loading && chartData.length > 0 && (
          <div className="space-y-6 mt-6">
            
            {/* Sales Analysis Chart */}
            <div className="bg-white rounded-3xl shadow-xl p-6 border-[1.5px] border-slate-200">
               <div className="mb-6">
                  <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter italic leading-none">Sales Analysis</h3>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">7-Day Ticket Volume</p>
               </div>
               <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="date" tick={{fontSize: 10, fontWeight: 700, fill: '#64748b'}} axisLine={false} tickLine={false} />
                      <YAxis tick={{fontSize: 10, fontWeight: 700, fill: '#64748b'}} axisLine={false} tickLine={false} tickFormatter={(val) => `₹${val}`} />
                      <Tooltip 
                        contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                        itemStyle={{ fontWeight: 900, fontSize: '12px' }}
                        labelStyle={{ fontWeight: 900, fontSize: '10px', color: '#64748b', textTransform: 'uppercase' }}
                      />
                      <Line type="monotone" dataKey="sales" name="Sales" stroke="#6366f1" strokeWidth={4} dot={{ r: 4, strokeWidth: 2, fill: '#fff' }} activeDot={{ r: 6 }} />
                    </LineChart>
                  </ResponsiveContainer>
               </div>
            </div>

            {/* Profit & Loss Chart */}
            <div className="bg-white rounded-3xl shadow-xl p-6 border-[1.5px] border-slate-200">
               <div className="mb-6">
                  <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter italic leading-none">Profit & Loss Analysis</h3>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">7-Day Game Margins</p>
               </div>
               <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="date" tick={{fontSize: 10, fontWeight: 700, fill: '#64748b'}} axisLine={false} tickLine={false} />
                      <YAxis tick={{fontSize: 10, fontWeight: 700, fill: '#64748b'}} axisLine={false} tickLine={false} tickFormatter={(val) => `₹${val}`} />
                      <Tooltip 
                        cursor={{fill: '#f8fafc'}}
                        contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                        itemStyle={{ fontWeight: 900, fontSize: '12px' }}
                        labelStyle={{ fontWeight: 900, fontSize: '10px', color: '#64748b', textTransform: 'uppercase' }}
                      />
                      <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: 700, paddingTop: '10px' }} />
                      <Bar dataKey="profit" name="Profit" fill="#14b8a6" radius={[4, 4, 0, 0]} maxBarSize={40} />
                      <Bar dataKey="loss" name="Loss" fill="#f43f5e" radius={[4, 4, 0, 0]} maxBarSize={40} />
                    </BarChart>
                  </ResponsiveContainer>
               </div>
            </div>

            {/* User Growth Chart */}
            <div className="bg-white rounded-3xl shadow-xl p-6 border-[1.5px] border-slate-200">
               <div className="mb-6">
                  <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter italic leading-none">User Growth</h3>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">7-Day Registrations</p>
               </div>
               <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="date" tick={{fontSize: 10, fontWeight: 700, fill: '#64748b'}} axisLine={false} tickLine={false} />
                      <YAxis tick={{fontSize: 10, fontWeight: 700, fill: '#64748b'}} axisLine={false} tickLine={false} />
                      <Tooltip 
                        contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                        itemStyle={{ fontWeight: 900, fontSize: '12px' }}
                        labelStyle={{ fontWeight: 900, fontSize: '10px', color: '#64748b', textTransform: 'uppercase' }}
                      />
                      <Area type="monotone" dataKey="newUsers" name="New Users" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorUsers)" activeDot={{ r: 6 }} />
                    </AreaChart>
                  </ResponsiveContainer>
               </div>
            </div>
            
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminFinancials;
