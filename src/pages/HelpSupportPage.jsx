import React from 'react';
import PageWrapper from '../components/PageWrapper';
import { HelpCircle, Mail, MessageCircle, FileText, ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const HelpSupportPage = () => {
  const navigate = useNavigate();
  const { appSettings } = useCart();

  const supportNumber = "447988024040";
  const displayMobile = "+44 79 88 02 40 40";

  const supportOptions = [
    { 
      icon: <img src="https://img.icons8.com/color/48/whatsapp--v1.png" alt="WA" className="w-6 h-6" />, 
      label: 'WhatsApp', 
      desc: 'Direct Messaging Support', 
      action: () => window.open(`https://wa.me/${supportNumber}`, '_blank') 
    },
    { 
      icon: <img src="https://img.icons8.com/color/48/telegram-app.png" alt="TG" className="w-6 h-6" />, 
      label: 'Telegram', 
      desc: 'Official Support Group', 
      action: () => window.open(`https://t.me/+${supportNumber}`, '_blank') 
    },
    { 
      icon: <Mail size={20} />, 
      label: 'Email Support', 
      desc: 'smswinsms@gmail.com', 
      action: () => window.location.href = 'mailto:smswinsms@gmail.com' 
    },
    { 
      icon: <FileText size={20} />, 
      label: 'FAQs', 
      desc: 'Frequently asked questions', 
      action: () => alert('FAQs are currently being updated.') 
    },
  ];

  return (
    <PageWrapper title="HELP & SUPPORT" showNav={false}>
      <div className="bg-[#f8f9fa] min-h-screen pb-24">
        {/* Header */}
        <div className="bg-[#ff0033] h-[70px] flex items-center px-4 text-white shadow-md relative z-10">
          <button onClick={() => navigate('/settings')} className="p-2 -ml-2 active:scale-95 transition-all">
            <ChevronLeft size={28} />
          </button>
          <h1 className="text-xl font-black font-condensed tracking-tighter uppercase italic ml-2">Support Center</h1>
        </div>

        <div className="p-4 space-y-4 max-w-lg mx-auto mt-4">
          <div className="flex flex-col items-center py-6 text-center">
             <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center text-[#ff0033] mb-4 shadow-inner border-4 border-white">
                <HelpCircle size={36} />
             </div>
             <h2 className="text-2xl font-black font-condensed tracking-tighter uppercase italic text-gray-900">How can we help?</h2>
             <p className="text-gray-500 text-[11px] font-bold mt-2 max-w-[80%]">
                Our support team is available 24/7 to assist you with any questions or issues.
             </p>
          </div>

          <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-4 mb-2 italic">Contact Methods</p>
          
          {supportOptions.map((opt, idx) => (
            <div 
              key={idx} 
              className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 flex items-center justify-between group active:scale-[0.98] transition-all cursor-pointer hover:border-gray-200"
              onClick={opt.action}
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center text-[#ff0033] group-hover:bg-[#ff0033] group-hover:text-white transition-colors border border-gray-100 shadow-sm">
                  {opt.icon}
                </div>
                <div>
                  <h3 className="text-sm font-black text-gray-800 uppercase tracking-tight italic">{opt.label}</h3>
                  <p className="text-[10px] font-medium text-gray-400 mt-0.5">{opt.desc}</p>
                </div>
              </div>
              <ChevronRight size={20} className="text-gray-300 group-hover:text-[#ff0033] transition-colors" />
            </div>
          ))}

          <div className="bg-white p-6 rounded-[2rem] border border-gray-200 mt-8 shadow-sm text-center">
             <h3 className="text-sm font-black text-gray-900 uppercase italic">{appSettings.brandName}</h3>
             <p className="text-[10px] text-gray-400 font-bold mt-1 italic tracking-widest uppercase">Support: {displayMobile}</p>
             <p className="text-[9px] text-gray-300 font-bold uppercase tracking-widest mt-2">Available 24/7 Official Support Network</p>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
};

export default HelpSupportPage;
