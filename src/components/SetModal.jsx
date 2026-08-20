import React, { useState, useEffect } from 'react';
import { X, Layers, AlertCircle, CheckCircle2 } from 'lucide-react';

const SetModal = ({ isOpen, onClose, onConfirm, digits, price, theme, initialStartNum, purchaseTitle }) => {
  const [startNum, setStartNum] = useState('');
  const [endNum, setEndNum] = useState('');
  const [qty, setQty] = useState('1');
  const [error, setError] = useState('');
  const [preview, setPreview] = useState([]);

  useEffect(() => {
    if (isOpen) {
      setStartNum(initialStartNum || '');
    }
  }, [isOpen, initialStartNum]);

  useEffect(() => {
    if (isOpen) {
      setEndNum('');
      setQty('1');
      setError('');
      setPreview([]);
    }
  }, [isOpen]);

  const validateAndPreview = () => {
    setError('');
    setPreview([]);

    if (!startNum || !endNum || !qty) {
       setError('Please fill in all fields.');
       return false;
    }

    if (startNum.length !== digits) {
       setError(`Start number must be exactly ${digits} digits.`);
       return false;
    }

    const startInt = parseInt(startNum, 10);
    const endInt = parseInt(endNum, 10);
    const qtyInt = parseInt(qty, 10);

    if (isNaN(startInt) || isNaN(endInt) || isNaN(qtyInt)) {
       setError('Please enter valid numbers.');
       return false;
    }

    if (endInt < startInt) {
       setError('End number must be greater than or equal to Start.');
       return false;
    }
    
    const countInt = endInt - startInt + 1;

    if (qtyInt <= 0) {
       setError('Quantity per ticket must be at least 1.');
       return false;
    }
    
    // Large SET protection limit
    let maxLimit = 10000;
    if (digits === 2) maxLimit = 100;
    if (digits === 3) maxLimit = 1000;

    if (countInt > maxLimit) {
        setError(`Cannot generate more than ${maxLimit} tickets at once for ${digits}D.`);
        return false;
    }

    const generated = [];
    const maxVal = Math.pow(10, digits) - 1;

    for (let i = 0; i < countInt; i++) {
        const currentNum = startInt + i;
        if (currentNum > maxVal) {
           setError(`Sequence exceeds maximum ${digits}D number (${maxVal}).`);
           return false;
        }
        const num = currentNum.toString().padStart(digits, '0');
        generated.push(num);
    }
    setPreview(generated);
    return true;
  };

  useEffect(() => {
    if (startNum && endNum && qty) {
      validateAndPreview();
    } else {
      setPreview([]);
      setError('');
    }
  }, [startNum, endNum, qty]);

  const handleConfirm = () => {
    if (validateAndPreview() && preview.length > 0) {
      onConfirm(preview, parseInt(qty, 10));
      onClose();
    }
  };

  if (!isOpen) return null;

  const totalPrice = preview.length * parseInt(qty || '1', 10) * parseFloat(price || 0);

  return (
    <div className="mt-4 border-2 border-slate-800 rounded-2xl shadow-xl overflow-hidden flex flex-col animate-in fade-in slide-in-from-top-2 duration-300">
      {/* Header */}
      <div className={`p-4 text-white flex justify-between items-center ${theme.bg || 'bg-slate-800'}`}>
          <div className="flex items-center gap-3">
             <Layers size={24} />
             <div>
                <h3 className="font-black text-xl italic tracking-tighter uppercase leading-none">{purchaseTitle || 'SET Purchase'}</h3>
                <p className="text-[10px] font-bold uppercase tracking-widest mt-1 opacity-80">Auto-Generate Sequential Tickets</p>
             </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-black/20 rounded-full transition-colors active:scale-95">
             <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 space-y-4 bg-white">
          {/* Inputs */}
          <div className="grid grid-cols-2 gap-3">
             <div>
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-1">Start</label>
                <input 
                  type="text" 
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={digits}
                  value={startNum}
                  onChange={(e) => setStartNum(e.target.value.replace(/\D/g, ''))}
                  className={`w-full border-2 rounded-xl text-lg font-black tracking-widest p-3 outline-none transition-colors ${theme.ring ? theme.ring : 'focus:border-slate-800'} border-slate-200`}
                  placeholder={'0'.repeat(digits)}
                />
             </div>
             
             <div>
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-1">End Number</label>
                <input 
                  type="text" 
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={digits}
                  value={endNum}
                  onChange={(e) => setEndNum(e.target.value.replace(/\D/g, ''))}
                  className={`w-full border-2 rounded-xl text-lg font-black tracking-widest p-3 outline-none transition-colors ${theme.ring ? theme.ring : 'focus:border-slate-800'} border-slate-200`}
                  placeholder={'0'.repeat(digits)}
                />
             </div>

             <div className="col-span-2">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-1">Quantity Per Ticket</label>
                <div className="flex items-center gap-3">
                  <input 
                    type="text" 
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={qty}
                    onChange={(e) => setQty(e.target.value.replace(/\D/g, ''))}
                    className={`w-full border-2 rounded-xl text-lg font-black tracking-widest p-3 outline-none transition-colors ${theme.ring ? theme.ring : 'focus:border-slate-800'} border-slate-200 bg-slate-50`}
                    placeholder="e.g. 2"
                  />
                  <div className="flex flex-col gap-1 shrink-0">
                    <button onClick={() => setQty(q => String(Math.max(1, parseInt(q || '0') + 1)))} className="bg-slate-100 p-1 rounded hover:bg-slate-200 text-slate-600">+</button>
                    <button onClick={() => setQty(q => String(Math.max(1, parseInt(q || '0') - 1)))} className="bg-slate-100 p-1 rounded hover:bg-slate-200 text-slate-600">-</button>
                  </div>
                </div>
             </div>
          </div>

          {/* Error Message */}
          {error && (
             <div className="bg-red-50 text-red-600 p-3 rounded-xl flex items-center gap-2 border border-red-100 text-xs font-bold shadow-sm">
                <AlertCircle size={16} className="shrink-0" />
                <p>{error}</p>
             </div>
          )}

          {/* Preview */}
          {preview.length > 0 && !error && (
             <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200">
                <div className="flex justify-between items-center mb-3">
                   <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1">
                      <CheckCircle2 size={12} className="text-emerald-500" /> Preview Generation
                   </h4>
                   <span className="text-[10px] font-bold bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full">{preview.length} tickets</span>
                </div>
                
                <div className="flex flex-wrap gap-2 mb-4 max-h-32 overflow-y-auto p-2 bg-white rounded-xl border border-slate-100 shadow-inner">
                   {preview.slice(0, 20).map((num, i) => (
                     <span key={i} className="text-xs font-black bg-slate-100 px-2 py-1 rounded text-slate-700 tracking-wider">
                        {num}
                     </span>
                   ))}
                   {preview.length > 20 && (
                     <span className="text-xs font-black bg-slate-100 px-2 py-1 rounded text-slate-400 italic">
                        +{preview.length - 20} more...
                     </span>
                   )}
                </div>

                <div className="flex justify-between items-end border-t border-slate-200 pt-3">
                   <div>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Price per ticket</p>
                      <p className="text-sm font-black text-slate-700">₹ {price}</p>
                   </div>
                   <div className="text-right">
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Total Add</p>
                      <p className="text-xl font-black text-slate-900 tracking-tight italic">₹ {totalPrice.toFixed(2)}</p>
                   </div>
                </div>
             </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex gap-3">
           <button 
             onClick={onClose}
             className="flex-1 py-3 bg-white border border-slate-300 rounded-xl font-bold text-[11px] uppercase tracking-wider text-slate-600 hover:bg-slate-100 active:scale-95 transition-all"
           >
             Cancel
           </button>
           <button 
             onClick={handleConfirm}
             disabled={preview.length === 0 || !!error}
             className={`flex-[2] py-3 rounded-xl font-bold text-[11px] uppercase tracking-wider text-white shadow-md active:scale-95 transition-all flex items-center justify-center gap-2 ${preview.length === 0 || !!error ? 'bg-slate-300 pointer-events-none' : theme.btn || 'bg-slate-900'}`}
           >
             <Layers size={16} /> Add {preview.length || ''} To Cart
           </button>
      </div>
    </div>
  );
};

export default SetModal;
