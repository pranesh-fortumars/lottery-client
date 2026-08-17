import React, { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { ChevronLeft, Headset, Copy } from 'lucide-react';
import { getBrandBySlot } from '../constants/lotteryConfig';

const OrderDetails = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { purchasedTickets, declaredResults, loading } = useCart();

  // 1. Group tickets by orderId
  const orderTickets = useMemo(() => {
    return purchasedTickets.filter(t => t.purchaseId === orderId);
  }, [purchasedTickets, orderId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f4f6f8] flex flex-col">
        <div className="bg-white px-4 py-4 flex items-center justify-between border-b border-gray-200">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)}><ChevronLeft size={24} className="text-gray-800" /></button>
            <h1 className="text-lg font-bold text-gray-900">Order details</h1>
          </div>
        </div>
        <div className="flex-grow flex items-center justify-center text-gray-500 font-medium">
          Loading order...
        </div>
      </div>
    );
  }

  if (!orderTickets || orderTickets.length === 0) {
    return (
      <div className="min-h-screen bg-[#f4f6f8] flex flex-col">
        <div className="bg-white px-4 py-4 flex items-center justify-between border-b border-gray-200">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)}><ChevronLeft size={24} className="text-gray-800" /></button>
            <h1 className="text-lg font-bold text-gray-900">Order details</h1>
          </div>
        </div>
        <div className="flex-grow flex items-center justify-center text-gray-500 font-medium">
          Order not found.
        </div>
      </div>
    );
  }

  // Calculate Order Aggregates
  let totalPayment = 0;
  let totalWin = 0;
  let isWin = false;

  orderTickets.forEach(t => {
    const cost = (parseFloat(t.price) || 0) * (parseInt(t.qty) || 1);
    totalPayment += cost;
    if (t.status === 'Won') {
      isWin = true;
      const winAmt = parseInt(String(t.prize || "0").replace(/[^\d]/g, '')) || 0;
      totalWin += winAmt;
    }
  });

  const firstTicket = orderTickets[0];
  const isPending = firstTicket.status === 'Active';

  const slot = firstTicket.draw || '';
  const brand = getBrandBySlot(slot);
  const purchaseDate = firstTicket.purchaseDate || '';
  const purchaseTime = firstTicket.purchaseTime || '';

  // Attempt to find declared result
  const result = declaredResults.find(r => r.date === purchaseDate && r.draw === slot);
  const declaredNum = result ? result.number : null;

  const handleCopy = () => {
    try {
      navigator.clipboard.writeText(orderId);
      alert('Order ID copied to clipboard');
    } catch (e) {
      console.error('Clipboard copy failed', e);
    }
  };

  // Helper to render bubbles
  const renderBubble = (num, pos) => {
    // Determine colors based on position
    let ringColor = 'border-gray-400';
    let textColor = 'text-gray-700';
    
    if (pos === 'X') { ringColor = 'border-red-600'; textColor = 'text-red-600'; }
    if (pos === 'A') { ringColor = 'border-orange-500'; textColor = 'text-orange-500'; }
    if (pos === 'B') { ringColor = 'border-blue-500'; textColor = 'text-blue-500'; }
    if (pos === 'C') { ringColor = 'border-green-600'; textColor = 'text-green-600'; }

    return (
      <div className="flex flex-col items-center">
         <div className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full border-[2px] ${ringColor} flex items-center justify-center font-bold text-sm sm:text-base ${textColor} leading-none`}>
            {num}
         </div>
         {/* Small position label underneath */}
         <span className={`text-[8px] sm:text-[9px] font-bold ${textColor} mt-0.5 leading-none`}>
            {pos}
         </span>
      </div>
    );
  };

  // Helper to render the declared result numbers
  const renderDeclaredBubbles = (numStr) => {
    if (!numStr || numStr === '-') return <span className="text-gray-500 text-sm">PENDING</span>;
    // Assuming format is XABC or ABC, right aligned to C, B, A, X
    const arr = numStr.split('');
    const posKeys = ['C', 'B', 'A', 'X']; // backwards
    const bubbles = [];
    for (let i = arr.length - 1, p = 0; i >= 0 && p < posKeys.length; i--, p++) {
       bubbles.unshift({ num: arr[i], pos: posKeys[p] });
    }
    return (
      <div className="flex gap-1.5 items-start">
         {bubbles.map((b, idx) => (
            <div key={idx} className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full border-[2.5px] ${b.pos==='X'?'border-red-600 text-red-600':b.pos==='A'?'border-orange-500 text-orange-500':b.pos==='B'?'border-blue-500 text-blue-500':'border-green-600 text-green-600'} flex items-center justify-center font-bold text-base sm:text-lg bg-white`}>
               {b.num}
            </div>
         ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#f4f6f8] font-sans pb-10">
      {/* Header */}
      <div className="bg-white px-4 py-4 flex items-center justify-between border-b border-gray-200 sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-1 -ml-1 active:scale-95 transition-all">
             <ChevronLeft size={24} strokeWidth={2.5} className="text-gray-900" />
          </button>
          <h1 className="text-lg font-bold text-gray-900">Order details</h1>
        </div>
        <button onClick={() => navigate('/settings/help')} className="active:scale-95 transition-all">
          <Headset size={24} className="text-gray-700" />
        </button>
      </div>

      <div className="p-3 sm:p-4 max-w-md mx-auto space-y-3">
        {/* Main Details Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
           
           {/* Top Info Bar */}
           <div className={`px-3 py-2 flex items-center justify-between ${isPending ? 'bg-blue-50' : isWin ? 'bg-orange-50' : 'bg-[#fff5f5]'}`}>
              <div className="flex items-center gap-2">
                 <span className={`text-[10px] sm:text-xs font-medium px-2 py-0.5 rounded ${isPending ? 'bg-blue-100 text-blue-700' : isWin ? 'bg-orange-100 text-orange-700' : 'bg-red-50 text-red-700'}`}>
                    {isPending ? 'PENDING' : isWin ? 'WIN' : 'NO WIN'}
                 </span>
                 <span className="text-[10px] sm:text-[11px] text-gray-500 font-medium tracking-wide">
                    ID {orderId}
                 </span>
              </div>
              <button onClick={handleCopy} className="text-gray-400 hover:text-gray-600">
                 <Copy size={14} />
              </button>
           </div>

           {/* Core Details */}
           <div className="p-4 space-y-4">
              <div className="flex justify-between items-start border-b border-gray-100 pb-3">
                 <div>
                    <h2 className="text-sm font-bold text-gray-900">{brand} {slot}</h2>
                    <p className="text-[11px] text-gray-500 mt-0.5">Draw time <span className="ml-1 text-gray-800">{purchaseDate} {slot}</span></p>
                 </div>
                 <div className="text-right">
                    <p className="text-[10px] text-gray-500 mb-0.5">Total payment</p>
                    <p className="text-sm font-bold text-gray-900">₹{totalPayment.toFixed(2)}</p>
                 </div>
              </div>

              <div className="flex justify-between items-center">
                 <span className="text-xs text-gray-500">Betting time</span>
                 <span className="text-xs text-gray-800 font-medium">{purchaseDate} {purchaseTime}</span>
              </div>
              
              <div className="flex justify-between items-center pb-2">
                 <span className="text-xs text-gray-500">Result</span>
                 <span className="text-xs text-gray-900 font-medium">
                    {isPending ? <span className="text-blue-500 font-bold">Pending</span> : isWin ? <span className="text-orange-500 font-bold">Won ₹{totalWin.toFixed(2)}</span> : `No Win ₹0.00`}
                 </span>
              </div>

              {/* Message Box */}
              <div className="bg-[#f5f5f5] rounded-lg py-3 px-2 text-center">
                 <p className="text-xs text-gray-700">
                    {isPending ? "Waiting for result declaration..." : isWin ? "Congratulations, you have won!" : "Sorry, Your guessing is wrong, Try next time"}
                 </p>
              </div>

              {/* Support Link */}
              <div className="text-center pt-1">
                 <button onClick={() => navigate('/settings/help')} className="text-xs text-gray-500 flex items-center justify-center gap-1.5 mx-auto hover:text-gray-700 transition-colors">
                    <Headset size={12} /> <span className="underline decoration-gray-300 underline-offset-2">Questions with this record? Click here.</span>
                 </button>
              </div>
           </div>
        </div>

        {/* Result Card */}
        <div className="bg-[#eaf1f8] rounded-xl border border-blue-100 p-3 sm:p-4 flex items-center justify-between shadow-sm">
           <div>
              <h3 className="text-sm font-bold text-gray-900">{brand} {slot}</h3>
              <p className="text-[10px] text-gray-500 mt-1">Draw time <span className="ml-1 text-gray-700 font-medium">{purchaseDate} {slot}</span></p>
              <p className="text-[10px] text-gray-500 mt-0.5 tracking-wider">{result?.id || 'Pending...'}</p>
           </div>
           <div>
              {renderDeclaredBubbles(declaredNum)}
           </div>
        </div>

        {/* My Bets Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
           <div className="p-3 sm:p-4 border-b border-gray-100">
              <h3 className="text-sm font-bold text-gray-900">My Bets</h3>
           </div>
           
           <div className="w-full">
              {/* Table Header */}
              <div className="flex bg-[#f2f4f7] px-4 py-2">
                 <div className="flex-[2] text-xs text-gray-500 font-medium">Number</div>
                 <div className="flex-1 text-xs text-gray-500 font-medium text-center">Payment</div>
                 <div className="flex-1 text-xs text-gray-500 font-medium text-right">Result</div>
              </div>
              
              {/* Table Body */}
              <div className="divide-y divide-gray-100">
                 {orderTickets.map((t, idx) => {
                    const tCost = (parseFloat(t.price) || 0);
                    const tWin = parseInt(String(t.prize || "0").replace(/[^\d]/g, '')) || 0;
                    const isTWin = t.status === 'Won';
                    
                    // Parse number to bubbles
                    const numArr = String(t.num).split('');
                    const is3D = numArr.length === 3;
                    const is4D = numArr.length === 4;
                    // Default labels based on length
                    let posKeys = ['C', 'B', 'A'];
                    if (is4D) posKeys = ['C', 'B', 'A', 'X'];
                    if (numArr.length === 1) posKeys = [t.pos || 'A'];
                    if (numArr.length === 2 && t.pos === 'AB') posKeys = ['B', 'A'];
                    if (numArr.length === 2 && t.pos === 'BC') posKeys = ['C', 'B'];
                    if (numArr.length === 2 && t.pos === 'AC') posKeys = ['C', 'A'];
                    
                    const bubbles = [];
                    for (let i = numArr.length - 1, p = 0; i >= 0 && p < posKeys.length; i--, p++) {
                       bubbles.unshift({ num: numArr[i], pos: posKeys[p] });
                    }

                    return (
                       <div key={idx} className="flex items-center px-4 py-3 sm:py-4">
                          <div className="flex-[2] flex items-start gap-1 sm:gap-1.5">
                             {bubbles.map((b, bIdx) => (
                                <React.Fragment key={bIdx}>
                                   {renderBubble(b.num, b.pos)}
                                </React.Fragment>
                             ))}
                          </div>
                          <div className="flex-1 text-center">
                             <p className="text-[11px] sm:text-xs font-bold text-gray-700">₹{tCost.toFixed(2)}*{t.qty}</p>
                          </div>
                          <div className="flex-1 text-right">
                             {isPending ? (
                                <div className="flex flex-col items-end">
                                   <p className="text-[10px] text-gray-500 font-medium leading-tight">Status</p>
                                   <p className="text-[11px] sm:text-xs font-bold text-blue-500 leading-tight">Pending</p>
                                </div>
                             ) : isTWin ? (
                                <div className="flex flex-col items-end">
                                   <p className="text-[10px] text-gray-500 font-medium leading-tight">Won</p>
                                   <p className="text-[11px] sm:text-xs font-bold text-orange-500 leading-tight">₹{tWin.toFixed(2)}</p>
                                </div>
                             ) : (
                                <div className="flex flex-col items-end">
                                   <p className="text-[10px] text-gray-500 font-medium leading-tight">No Win</p>
                                   <p className="text-[11px] sm:text-xs font-bold text-gray-900 leading-tight">₹0.00</p>
                                </div>
                             )}
                          </div>
                       </div>
                    );
                 })}
              </div>
           </div>
        </div>

      </div>
    </div>
  );
};

export default OrderDetails;
