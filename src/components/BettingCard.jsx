import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { Layers } from 'lucide-react';
import SetModal from './SetModal';

const BettingCard = ({ title, winText: initialWinText, price: initialPrice, digits = 1, gameName = "Dear Lottery", drawTime = "", priceOptions = [], customRows = null, singleRow = false, colorTheme = "primary", hideBox = false, overrideType = null, gameType = null }) => {
  const { addToCart } = useCart();
  const [selectedTier, setSelectedTier] = useState(priceOptions.length > 0 ? priceOptions[0] : null);
  const [activeSetRow, setActiveSetRow] = useState(null);
  
  const currentPrice = selectedTier ? selectedTier.price : initialPrice;
  const currentWinText = selectedTier ? `Win ${selectedTier.win}` : (initialWinText || "");

  const themeStyles = {
    primary: { bg: 'bg-primary', text: 'text-primary', light: 'bg-primary-light border-primary-light', hover: 'hover:bg-primary-hover', ring: 'focus:ring-primary focus:border-primary', btn: 'bg-primary text-white hover:bg-primary-hover', btnLight: 'bg-primary/10 text-primary hover:bg-primary/20' },
    orange: { bg: 'bg-orange-500', text: 'text-orange-600', light: 'bg-orange-100 border-orange-200', hover: 'hover:bg-orange-600', ring: 'focus:ring-orange-500 focus:border-orange-500', btn: 'bg-gradient-to-r from-orange-500 to-amber-500 text-white', btnLight: 'bg-orange-50 text-orange-600 border border-orange-200 hover:bg-orange-100' },
    emerald: { bg: 'bg-emerald-500', text: 'text-emerald-600', light: 'bg-emerald-100 border-emerald-200', hover: 'hover:bg-emerald-600', ring: 'focus:ring-emerald-500 focus:border-emerald-500', btn: 'bg-gradient-to-r from-emerald-500 to-teal-400 text-white', btnLight: 'bg-emerald-50 text-emerald-600 border border-emerald-200 hover:bg-emerald-100' },
    blue: { bg: 'bg-blue-500', text: 'text-blue-600', light: 'bg-blue-100 border-blue-200', hover: 'hover:bg-blue-600', ring: 'focus:ring-blue-500 focus:border-blue-500', btn: 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white', btnLight: 'bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100' },
    purple: { bg: 'bg-purple-500', text: 'text-purple-600', light: 'bg-purple-100 border-purple-200', hover: 'hover:bg-purple-600', ring: 'focus:ring-purple-500 focus:border-purple-500', btn: 'bg-gradient-to-r from-purple-600 to-fuchsia-500 text-white', btnLight: 'bg-purple-50 text-purple-600 border border-purple-200 hover:bg-purple-100' }
  };
  const theme = themeStyles[colorTheme] || themeStyles.primary;

  // Local state for rows. Each row has its own data.
  const [rows, setRows] = useState(() => {
    if (customRows) {
      return customRows.map((config, idx) => ({
        id: idx + 1,
        numbers: Array(config.digits).fill(''),
        qty: 1,
        labels: config.labels
      }));
    }
    const rowCount = singleRow ? 1 : 3;
    return Array(rowCount).fill(null).map((_, idx) => ({
      id: idx + 1,
      numbers: Array(digits).fill(''),
      qty: 1,
      labels: null
    }));
  });

  const updateNumber = (rowIdx, digitIdx, val) => {
    if (val.length > 1 || !/^\d*$/.test(val)) return;
    const newRows = [...rows];
    newRows[rowIdx].numbers[digitIdx] = val;
    setRows(newRows);
    
    if (val && digitIdx < newRows[rowIdx].numbers.length - 1) {
      const nextIdWithPrice = `input-${title}-${rowIdx}-${digitIdx + 1}-${currentPrice.replace('.','')}`;
      const nextIdWithoutPrice = `input-${title}-${rowIdx}-${digitIdx + 1}`;
      const next = document.getElementById(nextIdWithPrice) || document.getElementById(nextIdWithoutPrice);
      if (next) next.focus();
    }
  };

  const updateQty = (rowIdx, delta) => {
    const newRows = [...rows];
    newRows[rowIdx].qty = Math.max(1, newRows[rowIdx].qty + delta);
    setRows(newRows);
  };

  const handleSetConfirm = (generatedNumbers) => {
    if (activeSetRow === null) return;
    
    const rowIdx = activeSetRow;
    const row = rows[rowIdx];
    const len = digits;
    
    const typeLabel = overrideType || (len === 1 ? '1D' : len === 2 ? '2D' : len === 3 ? '3D' : '4D');
    
    let posLabel = 'ABC';
    if (len === 1) posLabel = row.labels ? row.labels[0] : 'A';
    else if (len === 2) posLabel = row.labels ? row.labels.join('') : 'AB';
    else if (len === 4) posLabel = 'XABC';

    generatedNumbers.forEach(num => {
      addToCart({
        title: gameType === '3D_LUCKY_PICK' ? `[${drawTime}] ${gameName} - 3D Lucky Pick` : `[${drawTime}] ${gameName} - ${title}`,
        num: num,
        qty: row.qty,
        price: parseFloat(currentPrice),
        type: typeLabel,
        gameType: gameType || "STANDARD",
        draw: drawTime,
        pos: posLabel,
        board: posLabel,
        source: 'SET'
      });
    });

    setActiveSetRow(null);
  };

  const getPermutations = (arr) => {
    const results = [];
    const permute = (current, remaining) => {
      if (remaining.length === 0) {
        results.push(current.join(''));
        return;
      }
      for (let i = 0; i < remaining.length; i++) {
        permute([...current, remaining[i]], [...remaining.slice(0, i), ...remaining.slice(i + 1)]);
      }
    };
    permute([], arr);
    return [...new Set(results)]; 
  };

  const handleBox = (rowIdx) => {
    const row = rows[rowIdx];
    const len = row.numbers.length;
    if (row.numbers.some(n => n === '')) {
      alert(`Please enter all ${len} numbers for BOX`);
      return;
    }
    
    const permutations = getPermutations(row.numbers);
    const typeLabel = overrideType || (len === 3 ? '3D' : '4D');
    const posLabel = len === 3 ? 'ABC' : 'XABC';

    permutations.forEach(num => {
      addToCart({
        title: gameType === '3D_LUCKY_PICK' ? `[${drawTime}] ${gameName} - 3D Lucky Pick (BOX)` : `[${drawTime}] ${gameName} - ${title} (BOX)`,
        num: num,
        qty: row.qty,
        price: parseFloat(currentPrice),
        type: typeLabel,
        gameType: gameType || "STANDARD",
        draw: drawTime,
        pos: posLabel,
        board: posLabel
      });
    });

    const newRows = [...rows];
    newRows[rowIdx].numbers = Array(row.numbers.length).fill('');
    setRows(newRows);
    alert(`Added ${permutations.length} unique combinations (BOX) to cart!`);
  };

  const handleAdd = (rowIdx) => {
    const row = rows[rowIdx];
    if (row.numbers.some(n => n === '')) {
      alert("Please enter all numbers");
      return;
    }
    
    let boardLabel = '';
    if (row.labels) {
      boardLabel = row.labels.join('');
    } else {
      const d = row.numbers.length;
      if (d === 1) boardLabel = 'A';
      else if (d === 2) boardLabel = 'AB';
      else if (d === 3) boardLabel = 'ABC';
      else if (d === 4) boardLabel = 'XABC';
    }

    addToCart({
      title: gameType === '3D_LUCKY_PICK' ? `[${drawTime}] ${gameName} - 3D Lucky Pick` : `[${drawTime}] ${gameName} - ${title} (${boardLabel})`,
      num: row.numbers.join(''),
      qty: row.qty,
      price: parseFloat(currentPrice),
      type: overrideType || (title === "Single Digit" ? "1D" : title === "Double Digits" ? "2D" : title === "Three Digits" ? "3D" : "4D"),
      gameType: gameType || "STANDARD",
      draw: drawTime,
      pos: boardLabel,
      board: boardLabel
    });

    const newRows = [...rows];
    newRows[rowIdx].numbers = Array(row.numbers.length).fill('');
    setRows(newRows);
  };

  const handleRandom = (rowIdx) => {
    const newRows = [...rows];
    const d = newRows[rowIdx].numbers.length;
    newRows[rowIdx].numbers = Array(d).fill(0).map(() => Math.floor(Math.random() * 10).toString());
    setRows(newRows);
  };

  const getLabel = (row, idx) => {
    if (row.labels) return row.labels[idx];
    const d = row.numbers.length;
    if (d === 3) return ['A', 'B', 'C'][idx];
    if (d === 4) return ['X', 'A', 'B', 'C'][idx];
    return ['A', 'B', 'C', 'X'][idx];
  };

  if (singleRow) {
    const row = rows[0];
    const rowIdx = 0;
    
    return (
      <div className="border border-slate-400 rounded-2xl p-5 mb-4 bg-white shadow-sm transition-shadow hover:shadow-md">
        {/* Header Section */}
        <div className="flex gap-4 mb-6">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border ${theme.light}`}>
             <img src="https://img.icons8.com/color/64/000000/treasure-chest.png" alt="Icon" className="w-8 h-8" />
          </div>
          <div className="flex-grow">
             <div className="flex justify-between items-start">
                <div>
                   <h3 className="text-black font-bold text-base leading-none uppercase tracking-tight mb-1">
                      {title}
                   </h3>
                   <p className={`${theme.text} font-bold text-[10px] uppercase tracking-wide leading-tight mb-2`}>
                      {currentWinText}
                   </p>
                   <p className="text-slate-900 font-bold text-lg leading-none">₹ {currentPrice}</p>
                </div>
                <button 
                  onClick={() => handleRandom(rowIdx)}
                  className="bg-slate-100 text-slate-600 text-[9px] px-3 py-1.5 rounded-lg font-bold uppercase hover:bg-slate-200 transition-colors"
                >
                  Random
                </button>
             </div>
          </div>
        </div>

        {/* Input Section */}
        <div className={`flex justify-between items-center mb-6 px-1 ${row.numbers.length === 4 ? 'gap-2' : 'gap-4'}`}>
           <div className={`flex ${row.numbers.length === 4 ? 'gap-1' : 'gap-2'} shrink-0`}>
              {row.numbers.map((_, i) => (
                 <div key={i} className={`${row.numbers.length === 4 ? 'w-7 h-7 text-xs' : 'w-8 h-8 text-sm'} rounded-full flex items-center justify-center text-white font-bold shadow-sm uppercase ${getLabel(row, i) === 'X' ? 'bg-slate-800' : theme.bg}`}>
                    {getLabel(row, i)}
                 </div>
              ))}
           </div>
           
           <div className={`flex ${row.numbers.length === 4 ? 'gap-1' : 'gap-1.5'} flex-grow justify-end shrink-0`}>
              {row.numbers.map((num, digIdx) => (
                <input 
                  key={digIdx}
                  id={`input-${title}-${rowIdx}-${digIdx}-${currentPrice.replace('.','')}`}
                  type="text" 
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={num}
                  onChange={(e) => updateNumber(rowIdx, digIdx, e.target.value)}
                  className={`${row.numbers.length === 4 ? 'w-10 h-10 text-xl' : 'w-12 h-12 text-2xl'} border rounded-xl text-center font-bold bg-slate-50 outline-none transition-all focus:bg-white ${getLabel(row, digIdx) === 'X' ? 'border-slate-800 focus:border-slate-800' : 'border-slate-500 ' + theme.ring}`} 
                  placeholder="" 
                  maxLength="1"
                />
              ))}
           </div>
        </div>

        {/* Action Section */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-900">
           <div className="flex items-center bg-slate-100 rounded-lg overflow-hidden p-0.5">
              <button onClick={() => updateQty(rowIdx, -1)} className="bg-white text-slate-600 w-8 h-8 rounded-md font-bold text-lg flex items-center justify-center hover:bg-slate-50 active:bg-slate-200 shadow-sm transition-colors">-</button>
              <div className="w-8 text-center font-bold text-sm text-black">{row.qty}</div>
              <button onClick={() => updateQty(rowIdx, 1)} className="bg-white text-slate-600 w-8 h-8 rounded-md font-bold text-lg flex items-center justify-center hover:bg-slate-50 active:bg-slate-200 shadow-sm transition-colors">+</button>
           </div>

           <div className="flex gap-2">
              {(row.numbers.length === 3 || row.numbers.length === 4) && !hideBox && (
                 <button 
                   onClick={() => handleBox(rowIdx)}
                   className={`px-5 py-2.5 rounded-lg font-bold text-[11px] uppercase shadow-sm active:scale-95 transition-colors hover:opacity-90 ${theme.btn}`}
                 >
                   BOX
                 </button>
              )}
              {digits > 1 && gameType !== '3D_LUCKY_PICK' && (
                 <button 
                   onClick={() => setActiveSetRow(rowIdx)}
                   className={`px-4 py-2.5 rounded-lg font-bold text-[11px] uppercase shadow-sm active:scale-95 transition-colors hover:opacity-90 bg-slate-900 text-white border border-slate-700 flex items-center gap-1`}
                 >
                   <Layers size={14} /> SET
                 </button>
              )}
              <button 
                onClick={() => handleAdd(rowIdx)}
                className={`px-5 py-2.5 rounded-lg font-bold text-[11px] uppercase shadow-sm active:scale-95 transition-colors ${theme.btn}`}
              >
                ADD
              </button>
           </div>
        </div>
        <SetModal 
          isOpen={activeSetRow !== null}
          onClose={() => setActiveSetRow(null)}
          onConfirm={handleSetConfirm}
          digits={digits}
          price={currentPrice}
          theme={theme}
        />
      </div>
    );
  }

  // Original Multi-Row Layout for Single/Double Digit
  return (
    <div className="border border-slate-400 rounded-2xl p-4 mb-6 bg-white shadow-sm transition-shadow hover:shadow-md">
      <div className="flex gap-4 mb-4 border-b border-slate-900 pb-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border ${theme.light}`}>
           <img src="https://img.icons8.com/color/64/000000/treasure-chest.png" alt="Icon" className="w-8 h-8" />
        </div>
        <div className="flex-grow">
          <h3 className="text-black font-bold text-base leading-tight uppercase tracking-tight">
            {title}
          </h3>
          <p className={`${theme.text} font-bold text-[10px] uppercase tracking-wide leading-none mb-1 mt-1`}>
            {currentWinText && (currentWinText.includes('Win ') ? currentWinText : `Win ${currentWinText}`)}
          </p>
          <p className="text-slate-900 font-bold text-lg leading-none">₹ {currentPrice}</p>
        </div>
        <button 
          onClick={() => rows.forEach((_, i) => handleRandom(i))}
          className="bg-slate-100 text-slate-600 text-[9px] px-3 py-1.5 rounded-lg h-fit font-bold uppercase hover:bg-slate-200 transition-colors"
        >
          Random All
        </button>
      </div>

      {priceOptions.length > 0 && (
         <div className="flex flex-wrap gap-2 pt-4 border-t border-slate-200 mb-4">
            {priceOptions.map((opt, i) => (
               <button
                 key={i}
                 onClick={() => setSelectedTier(opt)}
                 className={`flex-1 min-w-[30%] py-2 px-3 rounded-lg font-bold text-[10px] uppercase tracking-widest border transition-all ${
                   selectedTier?.price === opt.price 
                     ? `${theme.bg} text-white border-transparent shadow-md transform scale-[1.02]` 
                     : 'bg-white text-slate-600 border-slate-300 hover:border-slate-400 hover:bg-slate-50'
                 }`}
               >
                  <span className="block text-sm">₹ {opt.price}</span>
               </button>
            ))}
         </div>
      )}

      <div className="space-y-4 overflow-x-auto pb-2 scrollbar-hide">
        {rows.map((row, rowIdx) => (
          <div key={row.id} className="flex items-center justify-between gap-3 min-w-[340px]">
             <div className="flex gap-1 shrink-0">
                {row.numbers.map((_, i) => (
                   <div key={i} className={`w-7 h-7 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-sm uppercase ${getLabel(row, i) === 'X' ? 'bg-slate-800' : theme.bg}`}>
                      {getLabel(row, i)}
                   </div>
                ))}
             </div>
             
             <div className="flex gap-1.5 shrink-0">
                {row.numbers.map((num, digIdx) => (
                  <input 
                    key={digIdx}
                    id={`input-${title}-${rowIdx}-${digIdx}`}
                    type="text" 
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={num}
                    onChange={(e) => updateNumber(rowIdx, digIdx, e.target.value)}
                    className={`w-10 h-10 border rounded-lg text-center text-xl font-bold bg-slate-50 outline-none transition-all focus:bg-white ${getLabel(row, digIdx) === 'X' ? 'border-slate-800 focus:border-slate-800' : 'border-slate-500 ' + theme.ring}`} 
                    placeholder="-" 
                    maxLength="1"
                  />
                ))}
             </div>

             <div className="flex items-center bg-slate-100 rounded-lg overflow-hidden p-0.5 shrink-0">
                <button onClick={() => updateQty(rowIdx, -1)} className="bg-white text-slate-600 w-7 h-7 rounded-md font-bold text-lg flex items-center justify-center hover:bg-slate-50 active:bg-slate-200 shadow-sm transition-colors">-</button>
                <div className="w-6 text-center font-bold text-sm text-black">{row.qty}</div>
                <button onClick={() => updateQty(rowIdx, 1)} className="bg-white text-slate-600 w-7 h-7 rounded-md font-bold text-lg flex items-center justify-center hover:bg-slate-50 active:bg-slate-200 shadow-sm transition-colors">+</button>
             </div>

             <div className="flex gap-1.5 shrink-0">
                {(row.numbers.length === 3 || row.numbers.length === 4) && (
                   <button 
                     onClick={() => handleBox(rowIdx)}
                     className={`px-3 py-2 rounded-lg font-bold text-[10px] uppercase shadow-sm active:scale-95 transition-colors hover:opacity-90 ${theme.btn}`}
                   >
                     BOX
                   </button>
                )}
                {digits > 1 && gameType !== '3D_LUCKY_PICK' && (
                   <button 
                     onClick={() => setActiveSetRow(rowIdx)}
                     className={`px-3 py-2 rounded-lg font-bold text-[10px] uppercase shadow-sm active:scale-95 transition-colors hover:opacity-90 bg-slate-900 text-white border border-slate-700 flex items-center gap-1`}
                   >
                     <Layers size={12} /> SET
                   </button>
                )}
                <button 
                  onClick={() => handleAdd(rowIdx)}
                  className={`px-4 py-2 rounded-lg font-bold text-[10px] uppercase shadow-sm active:scale-95 transition-colors ${theme.btn}`}
                >
                  ADD
                </button>
             </div>
          </div>
        ))}
      </div>

      <SetModal 
        isOpen={activeSetRow !== null}
        onClose={() => setActiveSetRow(null)}
        onConfirm={handleSetConfirm}
        digits={digits}
        price={currentPrice}
        theme={theme}
      />
    </div>
  );
};

export default BettingCard;
