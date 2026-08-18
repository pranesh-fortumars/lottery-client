import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import PageWrapper from '../components/PageWrapper';
import { ScrollText, Gavel, ShoppingCart, Lock, Info } from 'lucide-react';
import BettingCard from '../components/BettingCard';
import { useCart } from '../context/CartContext';
import { getSlotById, isSlotClosed } from '../constants/lotteryConfig';

const SelectionPage = () => {
  const navigate = useNavigate();
  const { gameId } = useParams();
  const { cart, appSettings, prizeScheme } = useCart();
  
  const slotData = getSlotById(gameId);
  const marketName = slotData?.brand || 'DEAR';
  const isKerala = marketName.toUpperCase() === 'KERALA';
  const earlyClosure = isKerala && appSettings?.keralaSalesClosed;
  
  // If Early Closure is ON, override the display time to 02:00 PM
  const drawTime = earlyClosure ? '02:00 PM' : (slotData?.time || '01:00 PM');
  
  const getGameName = () => `${marketName} LOTTERY`;
  
  const globalLock = appSettings?.globalSalesClosed;
  // Let the time-based cutoff handle kerala early closure dynamically
  const closed = globalLock || isSlotClosed(drawTime, marketName, appSettings);

  const currentBrandScheme = prizeScheme?.v2 ? prizeScheme[marketName.toUpperCase()] || prizeScheme['DEAR'] : null;

  const abcTiers = currentBrandScheme ? currentBrandScheme['3D'].filter(t => t.active).map(t => ({
    price: t.price, win: `₹ ${t.ABC}, ${t.BC}, ${t.C}`
  })) : [
    { price: "12.00", win: "₹ 6250, 250, 25" },
    { price: "28.00", win: "₹ 15000, 500, 50" },
    { price: "30.00", win: "₹ 17500, 500, 50" },
    { price: "55.00", win: "₹ 30000, 1000, 100" },
    { price: "60.00", win: "₹ 35000, 1000, 100" },
  ];

  const xabcTiers = currentBrandScheme ? currentBrandScheme['4D'].filter(t => t.active).map(t => ({
    price: t.price, win: `₹ ${t.XABC}, ${t.ABC}, ${t.BC}, ${t.C}`
  })) : [
    { price: "20.00", win: "₹ 100000" },
    { price: "50.00", win: "₹ 250000, 5000, 500, 50" },
    { price: "100.00", win: "₹ 500000, 10000, 1000, 100" },
  ];

  const d1Price = currentBrandScheme ? currentBrandScheme['1D'].price : "11.00";
  const d1Win = currentBrandScheme ? `₹ ${currentBrandScheme['1D'].A}` : "₹ 100";

  const d2Price = currentBrandScheme ? currentBrandScheme['2D'].price : "11.00";
  const d2Win = currentBrandScheme ? `₹ ${currentBrandScheme['2D'].AB}` : "₹ 1000";

  const luckyPickPrice = currentBrandScheme?.LUCKY_PICK?.price || "7.50";
  const luckyPickWin = currentBrandScheme?.LUCKY_PICK?.win || "5000";

  // --- Persistent Footer Action ---
  const footerBtn = (
    <button 
      onClick={() => navigate('/cart')}
      disabled={closed}
      className={`w-full text-white py-4 rounded-xl flex items-center justify-center gap-3 font-bold text-lg shadow-sm relative transition-all ${closed ? 'bg-slate-400' : 'bg-primary hover:bg-primary-hover active:scale-95'}`}
    >
      <ShoppingCart size={22} fill="white" /> {closed ? (globalLock ? 'SALES CLOSED' : 'EXPIRED') : 'PAY NOW'}
      {cart.length > 0 && !closed && (
         <span className="absolute -top-2 -right-2 bg-indigo-600 text-white w-7 h-7 rounded-full text-xs flex items-center justify-center font-bold shadow-sm">{cart.length}</span>
      )}
    </button>
  );

  const getBannerGradient = () => {
    const type = marketName.toLowerCase();
    if (type.includes('dear')) return 'bg-gradient-to-r from-rose-500 to-rose-700';
    if (type.includes('kerala')) return 'bg-gradient-to-r from-emerald-500 to-emerald-700';
    if (type.includes('dubai')) return 'bg-gradient-to-r from-purple-500 to-purple-700';
    return 'bg-gradient-to-r from-blue-500 to-blue-700';
  };

  return (
    <PageWrapper 
      title={getGameName()} 
      showNav={true}
      showBack={true}
      footerAction={footerBtn}
    >
      <div className="bg-slate-50 min-h-screen pb-24">
        {/* Draw Status Banner */}
        <div className={`py-4 px-6 flex justify-between items-center shadow-lg border-b border-white/10 ${closed ? 'bg-slate-800' : getBannerGradient()}`}>
           <div>
              <p className="text-white/80 text-[10px] font-black uppercase tracking-widest">{marketName} DRAW</p>
              <h2 className="text-white text-xl font-black">{drawTime}</h2>
           </div>
           <div className="text-right">
              <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-white shadow-sm ${closed ? 'text-slate-600' : 'text-gray-900'}`}>
                {closed ? (globalLock ? 'SALES CLOSED' : 'EXPIRED') : 'OPEN'}
              </span>
           </div>
        </div>

        <div className="p-4 space-y-5">
          <div className="flex gap-3">
             <button onClick={() => navigate('/rules')} className="flex-1 bg-white border border-slate-400 text-slate-900 py-3 rounded-xl flex items-center justify-center gap-2 font-bold shadow-sm uppercase tracking-wider text-[10px] hover:border-primary-hover hover:text-primary transition-all">
                <Gavel size={16} /> Rules
             </button>
             <button onClick={() => navigate('/results')} className="flex-1 bg-white border border-slate-400 text-slate-900 py-3 rounded-xl flex items-center justify-center gap-2 font-bold shadow-sm uppercase tracking-wider text-[10px] hover:border-primary-hover hover:text-primary transition-all">
                <ScrollText size={16} /> History
             </button>
          </div>

          <div className={`${closed ? 'opacity-50 grayscale pointer-events-none' : ''} space-y-6`}>
            {/* Single Digit Matrix */}
            <BettingCard 
                title="Single Digit" 
                winText={d1Win} 
                price={d1Price} 
                gameName={getGameName()} 
                drawTime={drawTime}
                colorTheme="orange"
                customRows={[
                { labels: ['A'], digits: 1 },
                { labels: ['B'], digits: 1 },
                { labels: ['C'], digits: 1 }
                ]}
            />

            {/* Double Digit Combinations */}
            <BettingCard 
                title="Double Digits" 
                winText={d2Win} 
                price={d2Price} 
                gameName={getGameName()} 
                drawTime={drawTime}
                colorTheme="emerald"
                customRows={[
                { labels: ['A', 'B'], digits: 2 },
                { labels: ['B', 'C'], digits: 2 },
                { labels: ['A', 'C'], digits: 2 }
                ]}
            />
            
            {/* Triple Digit - ABC (Split by Tier) */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 ml-2">
                 <div className="w-6 h-6 bg-blue-100 rounded-md flex items-center justify-center border border-blue-200">
                    <span className="text-blue-600 font-bold text-[10px]">3D</span>
                 </div>
                 <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">3D Pricing Categories</h4>
              </div>

              {/* 3D LUCKY PICK */}
              <div className="bg-gradient-to-r from-red-500 to-rose-600 rounded-[2rem] p-1 shadow-lg shadow-red-500/20 mb-6">
                <div className="bg-white rounded-[1.8rem] overflow-hidden">
                  <div className="bg-red-50/50 p-4 border-b border-red-100 text-center relative">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-full blur-2xl -mr-16 -mt-16 pointer-events-none"></div>
                    <span className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-red-600 text-white text-[9px] font-black uppercase tracking-widest mb-1 shadow-sm">SPECIAL GAME</span>
                    <h3 className="text-xl font-black italic tracking-tighter text-gray-900 leading-none mt-1">3D Lucky Pick</h3>
                    <p className="text-[10px] font-bold text-red-600/80 uppercase tracking-widest mt-1">Match the complete 3-digit result to win ₹5,000</p>
                  </div>
                  <div className="p-4 bg-white">
                    <BettingCard 
                      title="3D Lucky Pick" 
                      digits={3} 
                      price={luckyPickPrice} 
                      winText={`Win ₹ ${luckyPickWin}`}
                      gameName={getGameName()} 
                      drawTime={drawTime}
                      singleRow={true}
                      colorTheme="orange"
                      overrideType="3D"
                      gameType="3D_LUCKY_PICK"
                    />
                  </div>
                </div>
              </div>

              {abcTiers.map((tier, idx) => (
                <BettingCard 
                  key={`abc-${idx}`}
                  title="Three Digits" 
                  digits={3} 
                  price={tier.price} 
                  winText={`Win ${tier.win}`}
                  gameName={getGameName()} 
                  drawTime={drawTime}
                  singleRow={true}
                  colorTheme="blue"
                />
              ))}
            </div>

            {/* 4D - XABC (Split by Tier) */}
            <div className="space-y-4 pt-4 border-t border-slate-400">
              <div className="flex items-center gap-2 ml-2">
                 <div className="w-6 h-6 bg-purple-100 rounded-md flex items-center justify-center border border-purple-200">
                    <span className="text-purple-600 font-bold text-[10px]">4D</span>
                 </div>
                 <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">4D Pricing Categories</h4>
              </div>
              {xabcTiers.map((tier, idx) => (
                <BettingCard 
                  key={`xabc-${idx}`}
                  title="4D XABC" 
                  digits={4} 
                  price={tier.price} 
                  winText={`Win ${tier.win}`}
                  gameName={getGameName()} 
                  drawTime={drawTime}
                  singleRow={true}
                  colorTheme="purple"
                />
              ))}
            </div>
          </div>
          
          {closed && (
            <div className="bg-slate-100 p-6 rounded-2xl border border-slate-400 text-center space-y-2">
                <Lock className="mx-auto text-slate-400 mb-2" size={28} />
                <p className="text-slate-900 font-bold uppercase text-xs tracking-wider">
                  {globalLock ? 'GLOBAL SALES CLOSED' : (earlyClosure ? 'EARLY MARKET CLOSURE' : 'BOOKING FINISHED')}
                </p>
                <p className="text-slate-500 text-[11px] font-medium leading-relaxed">
                  {globalLock 
                    ? 'Ticket booking is currently closed for today across all markets by the administrator.'
                    : (earlyClosure 
                        ? `The administrator has activated the 2:00 PM early closure for Kerala Lottery.` 
                        : 'Registration for this draw is officially closed. Please check the next available slot.')}
                </p>
            </div>
          )}
        </div>
      </div>
    </PageWrapper>
  );
};

export default SelectionPage;
