import React, { useState } from 'react';
import { useCart } from '../context/CartContext';

const BettingCard = ({ title, winText: initialWinText, price: initialPrice, digits = 1, gameName = "Dear Lottery", drawTime = "", priceOptions = [], customRows = null, singleRow = false }) => {
  const { addToCart } = useCart();
  const [selectedTier, setSelectedTier] = useState(priceOptions.length > 0 ? priceOptions[0] : null);
  
  const currentPrice = selectedTier ? selectedTier.price : initialPrice;
  const currentWinText = selectedTier ? `Win ${selectedTier.win}` : (initialWinText || "");

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
    const typeLabel = len === 3 ? '3D' : '4D';
    const posLabel = len === 3 ? 'ABC' : 'XABC';

    permutations.forEach(num => {
      addToCart({
        title: `[${drawTime}] ${gameName} - ${title} (BOX)`,
        num: num,
        qty: row.qty,
        price: parseFloat(currentPrice),
        type: typeLabel,
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
      title: `[${drawTime}] ${gameName} - ${title} (${boardLabel})`,
      num: row.numbers.join(''),
      qty: row.qty,
      price: parseFloat(currentPrice),
      type: title === "Single Digit" ? "1D" : title === "Double Digits" ? "2D" : title === "Three Digits" ? "3D" : "4D",
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
          <div className="w-12 h-12 bg-primary-light rounded-xl flex items-center justify-center shrink-0 border border-primary-light">
             <img src="https://img.icons8.com/color/64/000000/treasure-chest.png" alt="Icon" className="w-8 h-8" />
          </div>
          <div className="flex-grow">
             <div className="flex justify-between items-start">
                <div>
                   <h3 className="text-black font-bold text-base leading-none uppercase tracking-tight mb-1">
                      {title}
                   </h3>
                   <p className="text-primary font-bold text-[10px] uppercase tracking-wide leading-tight mb-2">
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
        <div className="flex justify-between items-center mb-6 gap-4 px-1">
           <div className="flex gap-2">
              {row.numbers.map((_, i) => (
                 <div key={i} className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-sm uppercase ${getLabel(row, i) === 'X' ? 'bg-slate-800' : 'bg-primary'}`}>
                    {getLabel(row, i)}
                 </div>
              ))}
           </div>
           
           <div className="flex gap-1.5 flex-grow justify-end">
              {row.numbers.map((num, digIdx) => (
                <input 
                  key={digIdx}
                  id={`input-${title}-${rowIdx}-${digIdx}-${currentPrice.replace('.','')}`}
                  type="text" 
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={num}
                  onChange={(e) => updateNumber(rowIdx, digIdx, e.target.value)}
                  className={`w-12 h-12 border rounded-xl text-center text-2xl font-bold bg-slate-50 outline-none transition-all focus:ring-2 focus:ring-primary-light focus:bg-white ${getLabel(row, digIdx) === 'X' ? 'border-slate-800 focus:border-slate-800' : 'border-slate-500 focus:border-primary'}`} 
                  placeholder="" 
                  maxLength="1"
                />
              ))}
           </div>
        </div>

        {/* Action Section */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
           <div className="flex items-center bg-slate-100 rounded-lg overflow-hidden p-0.5">
              <button onClick={() => updateQty(rowIdx, -1)} className="bg-white text-slate-600 w-8 h-8 rounded-md font-bold text-lg flex items-center justify-center hover:bg-slate-50 active:bg-slate-200 shadow-sm transition-colors">-</button>
              <div className="w-8 text-center font-bold text-sm text-black">{row.qty}</div>
              <button onClick={() => updateQty(rowIdx, 1)} className="bg-white text-slate-600 w-8 h-8 rounded-md font-bold text-lg flex items-center justify-center hover:bg-slate-50 active:bg-slate-200 shadow-sm transition-colors">+</button>
           </div>

           <div className="flex gap-2">
              {(row.numbers.length === 3 || row.numbers.length === 4) && (
                 <button 
                   onClick={() => handleBox(rowIdx)}
                   className="bg-primary-dark text-white px-5 py-2.5 rounded-lg font-bold text-[11px] uppercase shadow-sm active:scale-95 transition-colors hover:opacity-90"
                 >
                   BOX
                 </button>
              )}
              <button 
                onClick={() => handleAdd(rowIdx)}
                className="bg-primary text-white px-5 py-2.5 rounded-lg font-bold text-[11px] uppercase shadow-sm active:scale-95 transition-colors hover:bg-primary-hover"
              >
                ADD
              </button>
           </div>
        </div>
      </div>
    );
  }

  // Original Multi-Row Layout for Single/Double Digit
  return (
    <div className="border border-slate-400 rounded-2xl p-4 mb-6 bg-white shadow-sm transition-shadow hover:shadow-md">
      <div className="flex gap-4 mb-4 border-b border-slate-100 pb-4">
        <div className="w-12 h-12 bg-primary-light rounded-xl flex items-center justify-center shrink-0 border border-primary-light">
           <img src="https://img.icons8.com/color/64/000000/treasure-chest.png" alt="Icon" className="w-8 h-8" />
        </div>
        <div className="flex-grow">
          <h3 className="text-black font-bold text-base leading-tight uppercase tracking-tight">
            {title}
          </h3>
          <p className="text-primary font-bold text-[10px] uppercase tracking-wide leading-none mb-1 mt-1">
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
        <div className="flex overflow-x-auto gap-2 mb-4 pb-2 scrollbar-hide">
          {priceOptions.map((opt, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedTier(opt)}
              className={`flex-shrink-0 px-4 py-2 rounded-lg text-[10px] font-bold uppercase transition-all border ${
                selectedTier?.price === opt.price 
                  ? 'bg-primary-light text-primary-dark border-primary-light shadow-sm' 
                  : 'bg-white text-slate-500 border-slate-400 hover:bg-slate-50'
              }`}
            >
              ₹ {opt.price}
            </button>
          ))}
        </div>
      )}

      <div className="space-y-4 overflow-x-auto pb-2 scrollbar-hide">
        {rows.map((row, rowIdx) => (
          <div key={row.id} className="flex items-center justify-between gap-3 min-w-[340px]">
             <div className="flex gap-1 shrink-0">
                {row.numbers.map((_, i) => (
                   <div key={i} className={`w-7 h-7 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-sm uppercase ${getLabel(row, i) === 'X' ? 'bg-slate-800' : 'bg-primary'}`}>
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
                    className={`w-10 h-10 border rounded-lg text-center text-xl font-bold bg-slate-50 outline-none transition-all focus:ring-2 focus:ring-primary-light focus:bg-white ${getLabel(row, digIdx) === 'X' ? 'border-slate-800 focus:border-slate-800' : 'border-slate-500 focus:border-primary'}`} 
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
                     className="bg-primary-dark text-white px-3 py-2 rounded-lg font-bold text-[10px] uppercase shadow-sm active:scale-95 transition-colors hover:opacity-90"
                   >
                     BOX
                   </button>
                )}
                <button 
                  onClick={() => handleAdd(rowIdx)}
                  className="bg-primary text-white px-4 py-2 rounded-lg font-bold text-[10px] uppercase shadow-sm active:scale-95 transition-colors hover:bg-primary-hover"
                >
                  ADD
                </button>
             </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BettingCard;
