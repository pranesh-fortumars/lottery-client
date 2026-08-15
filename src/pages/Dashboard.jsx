import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Mail, Diamond, QrCode, Shield, CheckCircle2 } from 'lucide-react';
import { usePayment } from '../context/PaymentContext';
import { useCart } from '../context/CartContext';
import { DRAW_SLOTS, getCutoffTime, isSlotClosed } from '../constants/lotteryConfig';
import { getTrueISTDate } from '../utils/timeHelpers';
import { SupportSection } from '../components/PageWrapper';

const CountdownTimer = ({ drawTime, brand, appSettings }) => {
  const [timeLeft, setTimeLeft] = useState({ h: '00', m: '00', s: '00' });

  useEffect(() => {
    const calculateTime = () => {
      const cutoff = getCutoffTime(drawTime, brand, appSettings);
      if (!cutoff) return;
      
      const now = getTrueISTDate();
      let diff = cutoff - now;
      
      if (diff < 0) {
        setTimeLeft({ h: '00', m: '00', s: '00' });
        return;
      }

      const h = String(Math.floor(diff / (1000 * 60 * 60))).padStart(2, '0');
      const m = String(Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))).padStart(2, '0');
      const s = String(Math.floor((diff % (1000 * 60)) / 1000)).padStart(2, '0');

      setTimeLeft({ h, m, s });
    };

    calculateTime();
    const timer = setInterval(calculateTime, 1000);
    return () => clearInterval(timer);
  }, [drawTime, brand, appSettings]);

  return (
    <div className="flex flex-col">
       <p className="text-[9px] font-bold text-white/70 uppercase tracking-widest mb-1.5">Booking Ends In</p>
       <div className="flex gap-1.5">
          <div className="bg-white/20 backdrop-blur-sm text-white w-9 h-9 flex items-center justify-center rounded-lg font-bold text-lg border border-white/10">{timeLeft.h}</div>
          <div className="bg-white/20 backdrop-blur-sm text-white w-9 h-9 flex items-center justify-center rounded-lg font-bold text-lg border border-white/10">{timeLeft.m}</div>
          <div className="bg-white/20 backdrop-blur-sm text-white w-9 h-9 flex items-center justify-center rounded-lg font-bold text-lg border border-white/10">{timeLeft.s}</div>
       </div>
    </div>
  );
};

const Dashboard = () => {
  const navigate = useNavigate();
  const { activePayment } = usePayment();
  const { appSettings } = useCart();
  const jackpotVisible = appSettings.jackpotVisible;

  const games = DRAW_SLOTS.map(game => {
    const marketName = game.brand;
    const isKerala = marketName.toUpperCase() === 'KERALA';
    const globalLock = appSettings.globalSalesClosed;
    const earlyClosure = isKerala && appSettings.keralaSalesClosed;
    
    // If Kerala early closure is ON, force time to 02:00 PM for logic and display
    const effectiveTime = earlyClosure ? '02:00 PM' : game.time;
    
    return {
      time: effectiveTime,
      originalTime: game.time,
      name: marketName,
      type: marketName.toLowerCase(),
      id: game.id,
      closed: globalLock || isSlotClosed(effectiveTime, marketName, appSettings)
    };
  });

  return (
    <div className="bg-slate-50">
      {/* Hero Banner Area */}
      <div className="p-4 pt-4">
        <div className="rounded-2xl overflow-hidden shadow-sm border border-slate-400">
           <img 
            src="/hero-banner.png" 
            alt="Hero Banner" 
            className="w-full h-auto object-cover"
          />
        </div>
      </div>

      {/* Global Sales Closed Banner */}
      {appSettings.globalSalesClosed && (
        <div className="px-4 mt-2">
           <div className="bg-white border border-red-200 p-6 rounded-2xl flex flex-col items-center justify-center text-center shadow-sm relative overflow-hidden">
              <Shield className="text-red-500 mb-2" size={32} />
              <h3 className="text-black font-bold text-lg uppercase tracking-tight">Sales Closed For Today</h3>
              <p className="text-[10px] font-medium text-slate-500 uppercase tracking-widest mt-1">Administrator has manually suspended all ticket intake</p>
           </div>
        </div>
      )}

      {/* Promo Bar */}
      {jackpotVisible && (
        <div className="bg-indigo-600 mt-2 py-2.5 flex justify-center items-center px-6 shadow-sm">
          <Mail size={18} className="text-white" />
          <span className="text-white font-bold ml-2 text-xs tracking-widest uppercase">HOT JACKPOT ALERT : WIN BIG TODAY!</span>
        </div>
      )}

      {/* Active Payment Method Banner */}
      {activePayment && (
        <div className="mt-4 px-4">
          <div 
            onClick={() => navigate('/topup')}
            className="bg-white border border-blue-200 p-4 rounded-2xl flex items-center justify-between group active:scale-[0.98] transition-all cursor-pointer shadow-sm"
          >
            <div className="flex items-center gap-4 relative z-10">
              <div className="w-10 h-10 bg-primary-light rounded-xl flex items-center justify-center border border-primary-light group-hover:opacity-80 transition-opacity">
                <QrCode className="text-primary" size={20} />
              </div>
              <div>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Active Payment ID</p>
                <p className="text-sm font-bold text-black uppercase">{activePayment.upiId}</p>
                <p className="text-[9px] font-bold text-primary uppercase tracking-wider mt-0.5">{activePayment.bankName}</p>
              </div>
            </div>
            <div className="w-8 h-8 bg-primary text-white rounded-lg shadow-sm flex items-center justify-center group-hover:bg-primary-hover transition-colors">
              <CheckCircle2 size={16} />
            </div>
          </div>
        </div>
      )}

      {/* 3 & 4 Digits Game Title */}
      <div className="px-5 py-6 flex items-center gap-3">
        <div className="w-10 h-10 bg-primary-light rounded-xl flex items-center justify-center border border-primary-light/50">
           <Diamond className="text-primary fill-primary/20" size={20} />
        </div>
        <h2 className="text-xl font-bold text-black uppercase tracking-tight">3 & 4 Digits Game</h2>
      </div>

      {/* Games Grid */}
      <div className="grid grid-cols-2 gap-4 px-4 pb-10">
        {games.map((game, idx) => {
          let gradientClass = 'bg-gradient-to-br from-blue-500 to-blue-700';
          if (game.type.includes('dear')) gradientClass = 'bg-gradient-to-br from-rose-500 to-rose-700 shadow-rose-500/30';
          else if (game.type.includes('kerala')) gradientClass = 'bg-gradient-to-br from-emerald-500 to-emerald-700 shadow-emerald-500/30';
          else if (game.type.includes('dubai')) gradientClass = 'bg-gradient-to-br from-purple-500 to-purple-700 shadow-purple-500/30';

          return (
            <div 
              key={idx} 
              className={`${gradientClass} p-4 rounded-2xl relative overflow-hidden h-[160px] shadow-lg transition-all ${
                game.closed ? 'opacity-60 grayscale scale-[0.98]' : 'cursor-pointer hover:shadow-xl hover:scale-[1.02]'
              }`}
              onClick={() => !game.closed && navigate(`/select/${game.id}`)}
            >
              <div className="relative z-10 flex flex-col justify-between h-full">
                <div className="text-white">
                  <p className="text-[10px] font-bold opacity-90 leading-tight uppercase tracking-widest mb-2">Booking Time</p>
                  {game.closed ? (
                    <div className="h-10 flex items-center">
                      <span className="bg-slate-900/50 text-white px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border border-white/20">CLOSED</span>
                    </div>
                  ) : (
                    <CountdownTimer drawTime={game.time} brand={game.name} appSettings={appSettings} />
                  )}
                </div>
                
                <div className="flex justify-between items-end mt-3 border-t border-white/20 pt-2">
                  <span className="text-white text-[13px] font-black">{game.time}</span>
                  {game.type.includes('dear') ? (
                    <div className="flex flex-col items-end leading-[0.8]">
                      <span className="text-rose-100 font-black text-[16px] tracking-tight">DEAR</span>
                      <span className="text-white text-[8px] font-black tracking-[0.2em] opacity-90">LOTTERY</span>
                    </div>
                  ) : game.type.includes('kerala') ? (
                    <div className="flex flex-col items-end leading-[0.8]">
                       <span className="text-emerald-100 font-black text-[15px] tracking-tight">KERALA</span>
                       <span className="text-white text-[8px] font-black tracking-[0.2em] opacity-90">LOTTERY</span>
                    </div>
                  ) : game.type.includes('dubai') ? (
                    <div className="flex flex-col items-end leading-[0.8]">
                       <span className="text-purple-100 font-black text-[16px] tracking-tight">DUBAI</span>
                       <span className="text-white text-[8px] font-black tracking-[0.2em] opacity-90">LOTTERY</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-end leading-[0.8]">
                       <span className="text-blue-100 font-black text-[16px] tracking-tight">{game.name.split(' ')[0]}</span>
                       <span className="text-white text-[8px] font-black tracking-[0.2em] opacity-90">LOTTERY</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Jackpot Section */}
      {jackpotVisible && (
        <>
          <div className="px-5 py-4 flex items-center gap-3 border-t border-slate-400 pt-8">
            <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center border border-indigo-100">
               <Diamond className="text-indigo-600 fill-indigo-100" size={20} />
            </div>
            <h2 className="text-xl font-bold text-black uppercase tracking-tight">Jackpot</h2>
          </div>

          <div className="px-4 py-2">
            <div 
              className="rounded-2xl overflow-hidden shadow-sm border border-slate-400 cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => navigate('/jackpot')}
            >
              <img 
                src="/jackpot-banner.png" 
                alt="Jackpot Play Banner" 
                className="w-full h-auto"
              />
            </div>
          </div>

          <div className="flex gap-4 px-4 pb-20 pt-6">
            <button 
              className="bg-primary-dark text-white py-3.5 px-6 rounded-xl font-bold text-sm shadow-sm hover:opacity-90 active:scale-95 flex-1 uppercase tracking-wider transition-opacity"
              onClick={() => navigate('/jackpot')}
            >
              Wins Wins
            </button>
            <button 
              className="bg-primary text-white py-3.5 px-6 rounded-xl font-bold text-sm shadow-sm hover:bg-primary-hover active:scale-95 flex-1 uppercase tracking-wider transition-colors"
              onClick={() => navigate('/jackpot')}
            >
              JackPot
            </button>
          </div>
        </>
      )}
      <SupportSection />
    </div>
  );
};

export default Dashboard;
