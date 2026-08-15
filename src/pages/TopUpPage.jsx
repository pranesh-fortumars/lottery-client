import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import PageWrapper, { SupportSection } from '../components/PageWrapper';
import { CreditCard, Wallet, ChevronRight, CheckCircle2, QrCode, Landmark, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { usePayment } from '../context/PaymentContext';
import PaymentModal from '../components/PaymentModal';
import { doc, updateDoc, addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';

const TopUpPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { activePayment } = usePayment();
  const [amount, setAmount] = useState('100.00');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPayment, setShowPayment] = useState(false);

  useEffect(() => {
    if (location.state?.requiredAmount) {
      setAmount(location.state.requiredAmount);
    }
  }, [location.state]);

  const amounts = ['100.00', '200.00', '500.00', '1000.00', '2000.00', '5000.00'];

  const handleTopup = async (transactionId, _unusedUpiId, paidAmount) => {
    if (!user) return;
    
    setShowPayment(false); 
    setIsProcessing(true);
    try {
      const topupVal = parseFloat(amount);
      if (isNaN(topupVal) || topupVal <= 0) throw new Error("Invalid amount");

      await addDoc(collection(db, 'pending_transactions'), {
        userId: user.uid,
        userName: user.name || 'Unknown',
        userMobile: user.mobile || 'No Mobile',
        userEnteredAmount: parseFloat(paidAmount) || 0,
        type: 'topup',
        amount: topupVal,
        transactionId: transactionId,
        status: 'pending',
        timestamp: serverTimestamp()
      });

      alert(`Top-up request for ₹${topupVal} submitted! Your balance will be updated once admin verifies.`);
      setIsProcessing(false);
      navigate('/home'); 
    } catch (error) {
      console.error("Topup error:", error);
      alert("Transaction failed! Please try again.");
      setIsProcessing(false);
    }
  };

  return (
    <PageWrapper title="WALLET TOP UP" showBack={true}>
      <div className="bg-slate-50 min-h-screen p-4 flex flex-col items-center pb-20">
        {/* Wallet Overview */}
        <div className="w-full max-w-sm bg-gradient-to-br from-blue-600 to-indigo-600 rounded-3xl p-8 text-white shadow-sm relative overflow-hidden mb-8 group">
           <div className="absolute top-0 right-0 p-6 opacity-10 bg-white rounded-bl-3xl group-hover:scale-110 transition-transform">
              <Wallet size={48} />
           </div>
           <p className="text-[10px] font-bold uppercase tracking-widest text-blue-100 mb-2">Available Balance</p>
           <h3 className="text-4xl font-bold tracking-tight">₹ {user?.balance?.toLocaleString() || '0.00'}</h3>
           
           <div className="mt-8 flex gap-4 pt-6 border-t border-white/20">
              <div className="flex-1">
                 <p className="text-[9px] font-bold uppercase tracking-widest leading-none mb-2 text-blue-100">Vault Status</p>
                 <p className="text-[10px] font-bold uppercase tracking-wider bg-white/10 rounded px-2.5 py-1 inline-block text-emerald-200 backdrop-blur-sm">Active & Secured</p>
              </div>
              <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center border border-white/20 backdrop-blur-sm">
                 <ShieldCheck size={20} className="text-emerald-200" />
              </div>
           </div>
        </div>

        {/* Amount Selection */}
        <div className="w-full max-w-sm space-y-4">
           <div className="flex items-center gap-3 ml-2 mb-2">
              <CreditCard className="text-blue-600" size={18} />
              <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Select Recharge Amount</h4>
           </div>
           
           <div className="grid grid-cols-3 gap-3">
              {amounts.map((a, i) => (
                <button 
                  key={i}
                  onClick={() => setAmount(a)}
                  className={`py-3.5 rounded-xl font-bold text-xs border transition-all shadow-sm ${
                    amount === a 
                      ? 'bg-blue-600 text-white border-blue-600' 
                      : 'bg-white text-slate-500 border-slate-400 hover:border-slate-500'
                  }`}
                >
                   ₹ {Math.floor(parseFloat(a))}
                </button>
              ))}
           </div>

           <div className="relative mt-8 group">
              <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors font-bold text-xl">₹</div>
              <input 
                type="text" 
                inputMode="decimal"
                pattern="[0-9]*"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full h-16 bg-white border border-slate-400 rounded-2xl pl-14 pr-6 font-bold text-black text-lg outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all shadow-sm placeholder:text-slate-300" 
                placeholder="Custom Amount"
              />
           </div>

            <div className="space-y-4 mt-8">
              <button 
                onClick={() => setShowPayment(true)}
                className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold tracking-wider text-sm uppercase shadow-sm active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                Proceed to Pay <ChevronRight size={18} />
              </button>
              
              <div className="flex gap-3">
                 <button 
                  onClick={() => setShowPayment(true)}
                  className="flex-1 bg-white border border-slate-400 p-4 rounded-xl flex flex-col items-center gap-2 shadow-sm hover:border-blue-200 active:bg-blue-50 transition-colors"
                >
                    <QrCode size={18} className="text-blue-600" />
                    <span className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">Active UPI QR</span>
                 </button>
                 <div className="flex-1 bg-slate-100 border border-slate-400 p-4 rounded-xl flex flex-col items-center gap-2 shadow-sm opacity-60">
                    <Landmark size={18} className="text-slate-400" />
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Bank Transfer</span>
                 </div>
              </div>
              
              {activePayment && (
                <div className="mt-6 p-4 bg-white rounded-xl border border-slate-400 shadow-sm">
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1 text-center">Currently Active Payment ID</p>
                  <p className="text-sm font-bold text-slate-900 text-center">{activePayment.upiId}</p>
                </div>
              )}
           </div>
        </div>

        <SupportSection />

        <div className="mt-12 text-center opacity-40">
           <p className="text-[9px] font-medium text-slate-400 uppercase tracking-wider leading-tight">Secured by SMS Lottery Payments Authority Gateway v2.4</p>
        </div>
      </div>

      <PaymentModal 
        isOpen={showPayment} 
        onClose={() => setShowPayment(false)} 
        amount={amount}
        onConfirm={handleTopup}
      />
    </PageWrapper>
  );
};

export default TopUpPage;
