import React from 'react';
import PageWrapper from '../components/PageWrapper';
import { ChevronLeft, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const RulesPage = () => {
  const navigate = useNavigate();

  const RuleSection = ({ title, children }) => (
    <div className="mb-6">
      <h3 className="text-gray-900 font-bold text-sm mb-2 font-sans">{title}</h3>
      <div className="text-[12px] text-gray-700 leading-relaxed font-sans space-y-1">
        {children}
      </div>
    </div>
  );

  const PrizeTier = ({ price, win, note }) => (
    <div className="mb-4">
      <div className="flex gap-1 items-baseline">
        <span className="text-[12px] font-bold text-gray-800 font-sans">Ticket Price{note && <span className="text-gray-500 font-normal"> ({note})</span>}: </span>
        <span className="text-[13px] font-black text-red-600 font-sans">{price}</span>
      </div>
      <div className="flex gap-1 items-baseline">
        <span className="text-[12px] font-bold text-gray-800 font-sans">Winning Amount: </span>
        <span className="text-[12px] font-bold text-red-600 font-sans">{win}</span>
      </div>
    </div>
  );

  return (
    <PageWrapper title="SMS LOTTERY RULES" showNav={true} showHeader={false}>
      {/* Custom Header to match image exactly */}
      <div className="bg-[#f42464] h-[60px] flex items-center justify-between px-4 text-white shrink-0">
        <div className="flex items-center gap-2">
          <button onClick={() => navigate('/home')}>
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
              <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
            </svg>
          </button>
          <h1 className="text-xl font-condensed font-black tracking-tighter uppercase italic">SMS LOTTERY RULES</h1>
        </div>
        <button onClick={() => navigate('/profile')}>
          <div className="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center">
            <User size={20} fill="white" />
          </div>
        </button>
      </div>

      <div className="bg-white min-h-screen px-6 py-8 pb-32 overflow-y-auto">
        <div className="max-w-[400px] mx-auto text-center mb-8">
          <h2 className="text-gray-900 font-black text-lg font-sans uppercase tracking-tight">SMS Lottery</h2>
        </div>

        <div className="space-y-6">
          <p className="text-[12px] text-gray-800 font-sans leading-relaxed">
            This 4 & 3 digit game is based on the daily result of Kerela & Dear lottery first prize results with the last four & 3 digits based.
          </p>

          <RuleSection title="Kerela [Upto 4 digits game]:">
            <p className="text-blue-600 font-bold mb-1">03:00 PM</p>
            <p>An example of a first price ticket is 5635</p>
            <p>X=5, A=6, B=3, C=5, AB=63, BC=35, AC=65,</p>
            <p>ABC = 635, XABC = 5635</p>
          </RuleSection>

          <RuleSection title="Dear [Upto 3 digits game]:">
            <p className="text-blue-600 font-bold mb-1">01:00 PM, 06:00 PM & 08:00 PM</p>
            <p>An example of a first price ticket is 062</p>
            <p>A=0, B=6, C=2, AB=06, BC=62, AC=02,</p>
            <p>ABC = 062</p>
          </RuleSection>

          <RuleSection title="Jackpot [Upto 3 digits game]:">
            <p className="text-blue-600 font-bold mb-1">
              10:30 AM, 11:30 AM, 12:30 PM, 01:30 PM, 03:30 PM, 05:30 PM, 06:30 PM & 07:30 PM
            </p>
            <p>An example of a first price ticket is 620</p>
            <p>A=6, B=2, C=0, AB=62, BC=20, AC=60,</p>
            <p>ABC = 620</p>
            <p className="mt-2 text-gray-800 italic">
              Every lot result announce after 30 minutes (example: 10:30 AM lot result announce in 11:00 AM. So Buyers can buy this Jackpot lot upto x:45 time for example 10:30 AM lot you can buy upto 10:45 AM).
            </p>
          </RuleSection>

          <RuleSection title="Single Digiti Game - A, B, C Board">
            <p>Single digit games can be played on any board between A, B and C.</p>
            <PrizeTier price="11" win="100" />
          </RuleSection>

          <RuleSection title="Two Digiti Game - AB, BC, AC">
            <p>In a two digit game, players can pick two numbers in the last three digits of the result in the combination of AB, BC and AC.</p>
            <PrizeTier price="11" win="1000" />
          </RuleSection>

          <RuleSection title="Three Digiti Game - ABC">
            <p>If a player places a bet on an ABC 3 digit game in a particular lottery there is a three chance of winning.</p>
            <p>(ABC Matching or BC Matching or C Matching)</p>
            
            <div className="mt-4 space-y-4">
              <PrizeTier price="12" win="6250, 250, 25" />
              <PrizeTier price="0" win="10000, 1000" note="only available in Jackpot Lot" />
              <PrizeTier price="28" win="15000, 500, 50" />
              <PrizeTier price="30" win="17500, 500, 50" />
              <PrizeTier price="33" win="20000, 500, 50" note="only available in kerela lottery" />
              <PrizeTier price="55" win="30000, 1000, 100" />
              <PrizeTier price="60" win="35000, 1000, 100" />
              <PrizeTier price="65" win="40000, 1000, 100" note="only available in kerela lottery" />
            </div>
          </RuleSection>

          <RuleSection title="Four Digiti Game - XABC">
            <p className="italic font-bold">This one available only in Kerela Lottery.</p>
            <p>If a player places a bet on an XABC 4 digit game in a particular lottery there is a chance of winning upto 4 chances.</p>
            <p>(XABC Matching or ABC Matching or BC Matching or C Matching)</p>
            
            <div className="mt-4 space-y-4">
              <div className="mb-4">
                <div className="flex gap-1 items-baseline">
                  <span className="text-[12px] font-bold text-gray-800 font-sans">Ticket Price: </span>
                  <span className="text-[14px] font-black text-red-600 font-sans">20</span>
                </div>
                <p className="text-[11px] font-bold text-gray-900 italic font-sans">This one have one chance of winning!.</p>
                <div className="flex gap-1 items-baseline">
                  <span className="text-[12px] font-bold text-gray-800 font-sans">Winning Amount: </span>
                  <span className="text-[12px] font-bold text-red-600 font-sans">100000</span>
                </div>
              </div>
              
              <PrizeTier price="50" win="250000, 5000, 500, 50" />
              <PrizeTier price="100" win="500000, 10000, 1000, 100" />
            </div>
          </RuleSection>
        </div>
      </div>
    </PageWrapper>
  );
};

export default RulesPage;
