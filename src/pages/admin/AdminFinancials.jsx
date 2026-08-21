import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Landmark, ArrowLeft, Loader2 } from 'lucide-react';
import { 
  subscribeToTickets, 
  subscribeToPendingTransactions, 
  subscribeToWithdrawals 
} from '../../services/firebaseService';

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

  useEffect(() => {
    let unsubscribeTickets;
    let unsubscribeTransactions;
    let unsubscribeWithdrawals;

    let latestTickets = [];
    let latestTransactions = [];
    let latestWithdrawals = [];
    let ticketsLoaded = false;
    let transactionsLoaded = false;
    let withdrawalsLoaded = false;

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
      setLoading(false);
    };

    unsubscribeTickets = subscribeToTickets((tickets) => {
      latestTickets = tickets;
      ticketsLoaded = true;
      calculateTodayFinancials();
    });

    unsubscribeTransactions = subscribeToPendingTransactions((txs) => {
      latestTransactions = txs;
      transactionsLoaded = true;
      calculateTodayFinancials();
    });

    unsubscribeWithdrawals = subscribeToWithdrawals((withdrawals) => {
      latestWithdrawals = withdrawals;
      withdrawalsLoaded = true;
      calculateTodayFinancials();
    });

    return () => {
      if (unsubscribeTickets) unsubscribeTickets();
      if (unsubscribeTransactions) unsubscribeTransactions();
      if (unsubscribeWithdrawals) unsubscribeWithdrawals();
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
      </div>
    </div>
  );
};

export default AdminFinancials;
