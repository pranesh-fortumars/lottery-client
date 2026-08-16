import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageWrapper from '../components/PageWrapper';
import { ShoppingCart, Trash2, CreditCard, ChevronLeft, QrCode, Info, AlertCircle, ChevronRight, Wallet } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { usePayment } from '../context/PaymentContext';
import PaymentModal from '../components/PaymentModal';
import { getBrandBySlot, isSlotClosed } from '../constants/lotteryConfig';
import { motion, AnimatePresence } from 'framer-motion';

const BalanceWarningModal = ({ isOpen, onClose, cartTotal, currentBalance, onRecharge }) => {
  if (!isOpen) return null;
  
  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        />
        <motion.div 
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="relative w-full max-w-sm bg-white rounded-3xl overflow-hidden shadow-xl"
        >
          <div className="bg-gradient-to-br from-orange-500 to-rose-600 p-8 text-white text-center relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-16 -mt-16"></div>
             <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-md border border-white/20">
                <AlertCircle size={32} />
             </div>
             <h3 className="text-xl font-bold uppercase tracking-tight relative z-10">Insufficient Balance</h3>
             <p className="text-rose-100 text-[10px] font-bold uppercase tracking-widest mt-1 relative z-10">Refill required to continue</p>
          </div>

          <div className="p-6 space-y-6">
             <div className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div>
                   <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest leading-none mb-1">Your Balance</p>
                   <p className="text-lg font-bold text-black">₹{currentBalance.toFixed(2)}</p>
                </div>
                <div className="text-right">
                   <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest leading-none mb-1">Shortfall</p>
                   <p className="text-lg font-bold text-rose-600">₹{(cartTotal - currentBalance).toFixed(2)}</p>
                </div>
             </div>

             <div className="space-y-4">
                <div className="flex gap-3 items-start">
                   <div className="w-6 h-6 bg-emerald-50 rounded-full flex items-center justify-center shrink-0 mt-0.5 border border-emerald-100">
                      <Wallet size={12} className="text-emerald-600" />
                   </div>
                   <p className="text-[10px] text-slate-500 font-medium leading-relaxed">
                      Only <span className="text-slate-900 font-bold">Winning Prizes</span> earned from lottery results are eligible for direct withdrawal to your bank.
                   </p>
                </div>
                <div className="flex gap-3 items-start">
                   <div className="w-6 h-6 bg-indigo-50 rounded-full flex items-center justify-center shrink-0 mt-0.5 border border-indigo-100">
                      <CreditCard size={12} className="text-indigo-600" />
                   </div>
                   <p className="text-[10px] text-slate-500 font-medium leading-relaxed">
                      Deposited balance and Referral bonus are primarily intended for <span className="text-slate-900 font-bold">Ticket Purchases</span> only.
                   </p>
                </div>
                <div className="flex gap-3 items-start">
                   <div className="w-6 h-6 bg-blue-50 rounded-full flex items-center justify-center shrink-0 mt-0.5 border border-blue-100">
                      <Info size={12} className="text-blue-600" />
                   </div>
                   <p className="text-[10px] text-slate-500 font-medium leading-relaxed">
                      Please recharge your wallet to complete this purchase. All deposits are manually verified by admins.
                   </p>
                </div>
             </div>

             <div className="pt-2 space-y-3">
                <button 
                  onClick={onRecharge}
                  className="w-full bg-gradient-to-r from-orange-500 to-rose-500 text-white py-4 rounded-xl font-bold text-xs uppercase tracking-widest shadow-sm active:scale-95 transition-colors hover:from-orange-600 hover:to-rose-600 flex items-center justify-center gap-2"
                >
                   Recharge Wallet <ChevronRight size={16} />
                </button>
                <button 
                  onClick={onClose}
                  className="w-full bg-slate-100 text-slate-500 py-3 rounded-xl font-bold text-[10px] uppercase tracking-widest active:scale-95 transition-colors hover:bg-slate-200"
                >
                   Cancel Purchase
                </button>
             </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

const CartPage = () => {
  const navigate = useNavigate();
  const { cart, removeFromCart, clearCart, cartTotal, confirmPurchase, appSettings } = useCart();
  const { user } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const { activePayment } = usePayment();

  const closedItems = cart.filter(item => {
    const itemBrand = (item.title || "").toUpperCase().includes('JACKPOT') ? 'JACKPOT' : getBrandBySlot(item.draw);
    return isSlotClosed(item.draw, itemBrand, appSettings);
  });
  const anyClosed = closedItems.length > 0;
  
  const bonusAvailable = user?.bonusBalance || 0;
  const bonusUsed = Math.min(cartTotal, bonusAvailable);
  const walletBalance = (user?.depositedBalance || 0) + (user?.winningBalance || 0);
  const totalUsableBalance = walletBalance + bonusAvailable;
  const remainingToPay = cartTotal - bonusUsed;
  const isFullBonus = remainingToPay === 0;

  const handlePay = async () => {
    if (cart.length === 0 || anyClosed) return;

    if (totalUsableBalance >= cartTotal) {
      // User has enough in wallet (including bonus) to pay directly
      const paymentType = isFullBonus ? 'Referral Bonus' : 'Wallet';
      const confirmMsg = isFullBonus 
        ? `Use ₹${bonusUsed} from your Referral Bonus to purchase these tickets?`
        : `Pay ₹${cartTotal.toFixed(2)} from your wallet balance to purchase these tickets?`;

      if (window.confirm(confirmMsg)) {
        setIsProcessing(true);
        try {
          // isPrepaid = false means direct deduction from wallet
          await confirmPurchase(false, null, null, paymentType, bonusUsed);
          alert("Purchase Successful!");
          navigate('/home');
        } catch (error) {
          alert("Failed to complete purchase.");
        } finally {
          setIsProcessing(false);
        }
      }
    } else {
      // Insufficient wallet balance, show informational warning modal
      setShowWarning(true);
    }
  };

  const handleRechargeRedirect = () => {
    setShowWarning(false);
    navigate('/topup', { state: { requiredAmount: (cartTotal - totalUsableBalance).toFixed(2) } });
  };

  const currentDate = new Date().toLocaleDateString('en-GB');

  // --- Fixed Footer Actions for Cart ---
  const cartFooter = (
    <div className="w-full flex gap-3">
      <button 
        onClick={handlePay}
        disabled={isProcessing || cart.length === 0 || anyClosed}
        className={`flex-1 text-white py-4 rounded-xl flex items-center justify-center gap-2 font-bold text-sm shadow-md active:scale-95 transition-all disabled:opacity-50 ${anyClosed ? 'bg-slate-400' : 'bg-gradient-to-r from-orange-500 to-rose-500 hover:opacity-90'}`}
      >
        <ShoppingCart size={20} fill="white" /> {isProcessing ? 'Waiting...' : (anyClosed ? 'Slot Expired' : (isFullBonus ? 'Pay with Bonus' : 'Confirm Pay'))}
      </button>
      
      <button 
        onClick={clearCart}
        className="px-5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl flex items-center justify-center gap-2 font-bold shadow-sm active:scale-95 transition-colors"
      >
        <Trash2 size={20} />
      </button>
    </div>
  );

  return (
    <PageWrapper title="SHOPPING CART" footerAction={cartFooter}>
      <div className="bg-slate-50 flex flex-col items-center min-h-screen pb-24">
        {/* Header Bar */}
        <div className="w-full max-w-sm bg-gradient-to-r from-orange-500 to-rose-500 text-white py-4 mt-4 rounded-2xl flex items-center justify-center gap-2 shadow-lg mb-6 relative overflow-hidden border border-white/20 backdrop-blur-md">
           <div className="absolute top-0 left-0 w-24 h-24 bg-white/20 rounded-full blur-2xl -ml-10 -mt-10"></div>
           <ShoppingCart size={20} fill="white" className="relative z-10" />
           <span className="text-lg font-black uppercase tracking-widest italic relative z-10">Your Cart</span>
        </div>

        {/* Slot Closure Warning */}
        {anyClosed && (
          <div className="w-full max-w-sm bg-red-50 border border-red-200 p-5 rounded-2xl mb-6 flex flex-col items-center text-center gap-2">
            <AlertCircle className="text-red-500" size={24} />
            <p className="text-[11px] font-bold text-red-600 uppercase tracking-widest">
              Action Required: Slots Expired
            </p>
            <p className="text-[10px] font-medium text-red-500 leading-relaxed">
              Some items in your cart belong to draws that are now closed. Please remove these items to proceed.
            </p>
            <div className="flex flex-wrap gap-1.5 justify-center mt-2">
               {closedItems.map((it, idx) => (
                 <span key={idx} className="bg-red-500 text-white text-[9px] px-2.5 py-1 rounded-md font-bold">{it.draw}</span>
               ))}
            </div>
          </div>
        )}

        {/* Cart Table */}
        <div className="w-full max-w-sm mb-8 px-1">
          <div className="bg-white rounded-xl border border-slate-400 shadow-sm overflow-hidden">
            <table className="w-full text-left text-xs border-collapse">
              <tbody>
                <tr className="border-b border-slate-400 bg-slate-50/50">
                  <td colSpan={4} className="p-3 font-bold text-slate-900 border border-slate-400">Name: {user?.name || 'Guest'}</td>
                  <td colSpan={2} className="p-3 text-right font-medium text-slate-500 border border-slate-400">{currentDate}</td>
                </tr>
                
                {/* Row 2: Headers */}
                <tr className="border-b border-slate-400 bg-slate-100/50 text-[10px] uppercase tracking-wider text-slate-500 font-bold">
                  <td className="p-3 border border-slate-400">Lot Details</td>
                  <td className="p-3 text-center border border-slate-400">Num</td>
                  <td className="p-3 text-center border border-slate-400">Qty</td>
                  <td className="p-3 text-center border border-slate-400">₹</td>
                  <td className="p-3 text-right border border-slate-400">Amt ₹</td>
                  <td className="p-3 w-8 border border-slate-400"></td>
                </tr>

                {/* Data Rows */}
                {cart.map((item) => (
                  <tr key={item.id} className="border-b border-slate-100 last:border-b-0 relative group hover:bg-slate-50/50 transition-colors">
                    <td className="p-3 border border-slate-400">
                      <div className="flex flex-col">
                        <span className="font-bold text-black text-[11px] uppercase">{item.title}</span>
                        {item.board && <span className="text-[9px] text-slate-500 font-medium mt-0.5">Board: {item.board}</span>}
                      </div>
                    </td>
                    <td className="p-3 text-center font-bold text-black border border-slate-400">{item.num}</td>
                    <td className="p-3 text-center text-slate-600 border border-slate-400">{item.qty}</td>
                    <td className="p-3 text-center text-slate-600 border border-slate-400">{item.price}</td>
                    <td className="p-3 text-right font-bold text-rose-600 border border-slate-400">{(item.price * item.qty).toFixed(2)}</td>
                    <td className="p-2 text-center align-middle border border-slate-400">
                      <button 
                        onClick={() => removeFromCart(item.id)} 
                        className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors mx-auto flex items-center justify-center"
                        title="Remove Ticket"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}

                {cart.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-12 text-center text-slate-400 font-medium">No tickets in cart</td>
                  </tr>
                )}

                {/* Total Amount Row */}
                <tr className="bg-slate-50 border-t border-slate-400">
                  <td colSpan={4} className="p-4 text-right uppercase tracking-widest text-[10px] font-bold text-slate-500 border border-slate-400">Grand Total:</td>
                  <td className="p-4 text-right text-lg font-bold text-black border border-slate-400">{cartTotal.toFixed(2)}</td>
                  <td className="p-4 bg-slate-50 border border-slate-400"></td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <div className="p-3 mb-6">
             <p className="text-[10px] font-medium text-slate-500 text-center">
               * Items for closed draws are removed automatically at checkout.
             </p>
          </div>

          {/* Wallet Balance Info */}
           <div className="bg-white border border-slate-400 rounded-2xl p-5 flex items-center justify-between mb-6 shadow-sm group hover:shadow-md transition-shadow">
             <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-rose-50 rounded-xl flex items-center justify-center border border-rose-100 group-hover:bg-rose-100 transition-colors">
                   <Wallet size={20} className="text-rose-600" />
                </div>
                <div>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Usable Balance</p>
                  <p className="text-sm font-bold text-black uppercase">₹{totalUsableBalance.toFixed(2)}</p>
                </div>
             </div>
             <div className="flex flex-col items-end">
                <span className={`text-[9px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wider ${totalUsableBalance >= cartTotal ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-amber-50 text-amber-600 border border-amber-100'}`}>
                  {totalUsableBalance >= cartTotal ? 'Sufficient' : 'Low Balance'}
                </span>
             </div>
          </div>
        </div>

        <button 
          onClick={() => navigate('/home')} 
          className="mb-10 flex items-center gap-2 text-slate-500 font-bold text-[10px] uppercase tracking-widest hover:text-rose-600 transition-colors bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-400"
        >
          <ChevronLeft size={14} /> Add more tickets
        </button>
      </div>

      <BalanceWarningModal 
        isOpen={showWarning} 
        onClose={() => setShowWarning(false)} 
        cartTotal={cartTotal}
        currentBalance={totalUsableBalance}
        onRecharge={handleRechargeRedirect}
      />
    </PageWrapper>
  );
};

export default CartPage;
