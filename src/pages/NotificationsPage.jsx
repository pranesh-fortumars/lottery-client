import React, { useState } from 'react';
import PageWrapper from '../components/PageWrapper';
import { Bell, Smartphone, Mail, ChevronLeft, ToggleLeft, ToggleRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const NotificationsPage = () => {
  const navigate = useNavigate();
  const [settings, setSettings] = useState({
    push: true,
    email: false,
    sms: true,
    marketing: false
  });

  const toggleSetting = (key) => setSettings(prev => ({ ...prev, [key]: !prev[key] }));

  const ToggleSwitch = ({ label, desc, icon: Icon, stateKey }) => (
    <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 flex items-center justify-between group active:scale-[0.98] transition-all cursor-pointer hover:border-gray-200" onClick={() => toggleSetting(stateKey)}>
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors border ${settings[stateKey] ? 'bg-[#ff0033] text-white border-[#ff0033]' : 'bg-gray-50 text-gray-500 border-gray-100'}`}>
          <Icon size={20} />
        </div>
        <div>
          <h3 className="text-sm font-black text-gray-800 uppercase tracking-tight italic">{label}</h3>
          <p className="text-[10px] font-medium text-gray-400 mt-0.5">{desc}</p>
        </div>
      </div>
      <div>
        {settings[stateKey] ? <ToggleRight size={32} className="text-[#ff0033]" /> : <ToggleLeft size={32} className="text-gray-300" />}
      </div>
    </div>
  );

  return (
    <PageWrapper title="NOTIFICATIONS" showNav={false}>
      <div className="bg-[#f8f9fa] min-h-screen pb-24">
        {/* Header */}
        <div className="bg-[#ff0033] h-[70px] flex items-center px-4 text-white shadow-md relative z-10">
          <button onClick={() => navigate('/settings')} className="p-2 -ml-2 active:scale-95 transition-all">
            <ChevronLeft size={28} />
          </button>
          <h1 className="text-xl font-black font-condensed tracking-tighter uppercase italic ml-2">Notifications</h1>
        </div>

        <div className="p-4 space-y-4 max-w-lg mx-auto mt-4">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-4 mb-2 italic">Alert Preferences</p>
          
          <ToggleSwitch label="Push Notifications" desc="Instant alerts on your device" icon={Bell} stateKey="push" />
          <ToggleSwitch label="Email Alerts" desc="Daily summary and receipts" icon={Mail} stateKey="email" />
          <ToggleSwitch label="SMS Notifications" desc="Important security and account texts" icon={Smartphone} stateKey="sms" />
          
          <div className="h-4"></div>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-4 mb-2 italic">Promotional</p>
          <ToggleSwitch label="Marketing & Offers" desc="Receive special bonuses and news" icon={Bell} stateKey="marketing" />
        </div>
      </div>
    </PageWrapper>
  );
};

export default NotificationsPage;
