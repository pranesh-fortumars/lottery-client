import React from 'react';
import { BookOpen, Wallet, Target, Trophy, Banknote, ChevronLeft } from 'lucide-react';
import PageWrapper from '../components/PageWrapper';
import { useNavigate } from 'react-router-dom';

const UserGuide = () => {
  const navigate = useNavigate();

  const sections = [
    {
      title: "1. Getting Started & Wallet",
      icon: <Wallet className="text-[#2563eb]" size={24} />,
      items: [
        { title: "Topping up your Wallet", desc: "Go to the Wallet tab and click 'Top Up'. Copy our official UPI ID or scan the QR code to make a payment from your bank app (GPay, PhonePe, Paytm). Take a screenshot of your successful payment." },
        { title: "Submit your Receipt", desc: "Enter the 12-digit UTR/Reference number from your payment app into our Top Up page, upload the screenshot, and submit. The admin will verify it and add funds to your wallet instantly!" }
      ]
    },
    {
      title: "2. Game Types & Slots",
      icon: <Target className="text-emerald-500" size={24} />,
      items: [
        { title: "Kerela Lottery (3:00 PM)", desc: "A special daily draw where you can bet on up to 4 digits. The results are based on the Kerela state lottery's first prize." },
        { title: "Dear Lottery (1PM, 6PM, 8PM)", desc: "Daily draws where you can bet on up to 3 digits. Results are based on the official Dear Lottery first prize." },
        { title: "Jackpot Lots (Hourly)", desc: "Quick 3-digit games running almost every hour (10:30 AM to 7:30 PM). Results are announced 30 minutes after the draw closes." }
      ]
    },
    {
      title: "3. How to Place Bets",
      icon: <Trophy className="text-amber-500" size={24} />,
      items: [
        { title: "Single Digit (A, B, or C)", desc: "Pick a single number (0-9) and choose a board (A, B, or C). If your number matches the result in that exact position, you win!" },
        { title: "Two Digit (AB, BC, AC)", desc: "Pick a two-digit combination (00-99). Example: If the result is 062, AB=06, BC=62, AC=02. If you bet on '62' for BC, you win!" },
        { title: "Three Digit (ABC)", desc: "Pick a three-digit combination (000-999). If your number matches the last 3 digits of the official result, you hit the big prize!" },
        { title: "Four Digit (XABC)", desc: "Available only in Kerela. Pick a four-digit combination. Match all 4 digits for the massive jackpot payout!" }
      ]
    },
    {
      title: "4. Results & Withdrawals",
      icon: <Banknote className="text-purple-500" size={24} />,
      items: [
        { title: "Checking Results", desc: "Visit the 'Results' tab from the bottom menu. You will see the official winning numbers. If you win, funds are credited automatically to your wallet." },
        { title: "Withdrawing Winnings", desc: "Go to the Wallet tab and click 'Withdraw'. Enter your Bank details or UPI ID. You must have a minimum balance of ₹300 to withdraw. Admins process payouts quickly!" }
      ]
    }
  ];

  return (
    <PageWrapper title="HOW TO PLAY" showNav={false} showHeader={false}>
      {/* Header matching the user theme */}
      <div className="bg-[#2563eb] h-[70px] flex items-center px-4 text-white shadow-md relative z-10 shrink-0">
        <button onClick={() => navigate('/settings/help')} className="p-2 -ml-2 active:scale-95 transition-all">
          <ChevronLeft size={28} />
        </button>
        <h1 className="text-xl font-black font-condensed tracking-tighter uppercase italic ml-2">How To Play</h1>
      </div>

      <div className="bg-[#f8f9fa] min-h-screen px-4 sm:px-6 py-6 pb-24 space-y-6 overflow-y-auto">
        
        {/* Intro Card */}
        <div className="bg-white rounded-[2rem] p-6 sm:p-8 shadow-sm border border-gray-100 relative overflow-hidden">
           <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#2563eb]/5 rounded-full blur-3xl"></div>
           <div className="flex flex-col items-center text-center gap-4 relative z-10">
              <div className="w-16 h-16 bg-blue-50 rounded-[1.5rem] flex items-center justify-center border-4 border-white shadow-inner">
                 <BookOpen size={32} className="text-[#2563eb]" />
              </div>
              <div>
                 <h2 className="text-2xl font-black text-gray-900 font-condensed uppercase tracking-tighter italic">Official User Guide</h2>
                 <p className="text-gray-500 text-[11px] font-bold mt-2 max-w-xs mx-auto leading-relaxed">
                   Learn everything you need to know about topping up, placing bets, winning, and withdrawing!
                 </p>
              </div>
           </div>
        </div>

        {/* Content Sections */}
        <div className="space-y-6">
          {sections.map((section, idx) => (
            <div key={idx} className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100">
               <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
                  <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center shadow-inner border border-gray-100">
                    {section.icon}
                  </div>
                  <h2 className="text-lg font-black text-gray-900 font-condensed tracking-tighter uppercase italic">{section.title}</h2>
               </div>
               
               <div className="space-y-5">
                 {section.items.map((item, i) => (
                   <div key={i} className="flex gap-4">
                      <div className="mt-1">
                         <div className="w-6 h-6 rounded-full bg-blue-50 flex items-center justify-center border border-blue-100">
                            <span className="text-[#2563eb] font-bold text-[10px]">{i + 1}</span>
                         </div>
                      </div>
                      <div>
                         <h3 className="font-bold text-gray-800 text-sm uppercase italic tracking-tight">{item.title}</h3>
                         <p className="text-[11px] font-medium text-gray-500 leading-relaxed mt-1">{item.desc}</p>
                      </div>
                   </div>
                 ))}
               </div>
            </div>
          ))}
        </div>

      </div>
    </PageWrapper>
  );
};

export default UserGuide;
