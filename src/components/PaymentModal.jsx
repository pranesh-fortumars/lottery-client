import React from 'react';
import { usePayment } from '../context/PaymentContext';
import { X, Copy, CheckCircle2, ShieldCheck, QrCode } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const PaymentModal = ({ isOpen, onClose, amount, onConfirm }) => {
  const { activePayment } = usePayment();
  const [copied, setCopied] = React.useState(false);
  const [showInput, setShowInput] = React.useState(false);
  const [hasStarted, setHasStarted] = React.useState(false);
  const [transactionId, setTransactionId] = React.useState('');
  const [paidAmount, setPaidAmount] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleCopy = () => {
    if (activePayment?.upiId) {
      navigator.clipboard.writeText(activePayment.upiId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!isOpen || !activePayment) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={hasStarted ? undefined : onClose}
          className={`absolute inset-0 bg-slate-900/60 backdrop-blur-sm ${hasStarted ? 'cursor-not-allowed' : 'cursor-pointer'}`}
        />

        {/* Modal */}
        <motion.div 
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="relative w-full max-w-[92vw] sm:max-w-sm bg-white rounded-3xl overflow-hidden shadow-xl flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="bg-blue-600 p-5 text-white relative shrink-0">
            {!hasStarted && (
              <button 
                onClick={onClose}
                className="absolute top-5 right-5 p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors"
              >
                <X size={20} />
              </button>
            )}
            <div className="flex items-center justify-center gap-3 mb-1">
              <QrCode size={22} />
              <h3 className="text-lg sm:text-xl font-bold uppercase tracking-tight">Payment Required</h3>
            </div>
            <p className="text-blue-100 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-center">Amount to Pay: ₹{amount}</p>
          </div>

          <div className="p-5 space-y-4 overflow-y-auto pb-4">
            {/* QR Code */}
            <div className="flex flex-col items-center justify-center p-4 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
               <div className="relative p-2 bg-white rounded-xl shadow-sm mb-3 w-[120px] sm:w-[140px] aspect-square flex items-center justify-center border border-slate-100">
                  <img src={activePayment.qrUrl} alt="UPI QR Code" className="w-full h-full object-contain rounded-lg" />
               </div>
               <p className="text-[10px] sm:text-[11px] font-bold text-slate-500 uppercase tracking-wider text-center leading-relaxed">
                  1. Scan QR with any UPI App<br/>
                  2. Make payment of ₹{amount}
               </p>
            </div>

            {/* UPI ID */}
            <div className="bg-blue-50/50 p-3 rounded-xl border border-blue-100 flex flex-col items-center">
               <label className="text-[9px] font-bold text-blue-600 uppercase tracking-wider mb-2 text-center">Manual Transfer Details</label>
               <div className="flex items-center justify-between bg-white w-full px-3 py-2.5 rounded-lg border border-blue-100 shadow-sm">
                  <span className="font-bold text-slate-800 text-xs sm:text-sm truncate select-all">{activePayment.upiId}</span>
                  <button 
                    onClick={handleCopy}
                    className="p-1.5 hover:bg-blue-50 rounded-md transition-colors text-blue-600 shrink-0 ml-2"
                  >
                    {copied ? <CheckCircle2 size={16} /> : <Copy size={16} />}
                  </button>
               </div>
               <p className="text-[9px] text-slate-400 font-bold uppercase text-center mt-2">Beneficiary: {activePayment.bankName}</p>
            </div>

            {/* Input Fields */}
            <div className="space-y-4 w-full">
               <div className="space-y-3 w-full">
                  <div className="w-full text-left">
                    <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider ml-1 block mb-1">Amount Actually Paid (₹)</label>
                    <input 
                      type="text" 
                      inputMode="decimal"
                      pattern="[0-9]*"
                      value={paidAmount}
                      onChange={(e) => setPaidAmount(e.target.value)}
                      placeholder="Enter exact amount"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-3 text-xs font-bold focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:bg-white transition-all text-slate-900"
                    />
                  </div>
                  <div className="w-full text-left">
                    <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider ml-1 block mb-1">Transaction ID / UTR (12 Digits)</label>
                    <input 
                      type="text" 
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={transactionId}
                      onChange={(e) => setTransactionId(e.target.value)}
                      placeholder="Enter 12-digit UTR"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-3 text-xs font-bold focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:bg-white transition-all text-slate-900"
                    />
                  </div>
               </div>

               <div className="bg-emerald-50 p-3 rounded-xl flex items-start gap-2 border border-emerald-100 mx-auto">
                  <ShieldCheck className="text-emerald-500 shrink-0 mt-0.5" size={16} />
                  <p className="text-[10px] text-emerald-800 font-medium leading-snug text-left">
                     Double check your Transaction ID and Amount. Incorrect details will result in rejection.
                  </p>
               </div>

               <button 
                  disabled={isSubmitting}
                  onClick={async () => {
                    if (!paidAmount || parseFloat(paidAmount) <= 0) return alert("Please enter the amount you paid");
                    if (!transactionId.trim()) return alert("Please enter Transaction ID");
                    
                    setIsSubmitting(true);
                    try {
                      await onConfirm(transactionId, null, paidAmount);
                      setTransactionId('');
                      setPaidAmount('');
                    } catch (err) {
                      console.error("Confirmation error:", err);
                    } finally {
                      setIsSubmitting(false);
                    }
                  }}
                  className="w-full bg-blue-600 text-white py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider shadow-sm active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 hover:bg-blue-700"
               >
                  {isSubmitting ? 'Processing...' : 'I Have Paid'}
               </button>

               <button 
                  onClick={onClose}
                  className="w-full bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-700 py-3 rounded-lg font-bold text-[10px] uppercase tracking-wider active:scale-95 transition-all"
               >
                  Cancel Payment
               </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default PaymentModal;
