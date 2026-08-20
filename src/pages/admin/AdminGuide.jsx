import React from 'react';
import { BookOpen, User, ShieldCheck, ShieldAlert, CheckCircle2, ChevronRight, Wallet, ShoppingCart, Info } from 'lucide-react';
import PageWrapper from '../../components/PageWrapper';
import { useAuth } from '../../context/AuthContext';

const AdminGuide = () => {
  const { user } = useAuth();
  
  const sections = [
    {
      title: "1. User Workflow (How to Play)",
      icon: <User className="text-blue-500" size={24} />,
      items: [
        { title: "Registration", desc: "Users sign up using their email, name, and phone number. They are automatically logged into the mobile dashboard." },
        { title: "Topping up Wallet", desc: "Users go to the Wallet tab, click 'Top Up', view the Admin's UPI details, make a payment via a payment app, and submit their UTR/Transaction ID along with a screenshot." },
        { title: "Buying Tickets", desc: "Once the Admin approves the top-up, funds appear in the User's wallet. The user can then select available lottery tickets and purchase them using their wallet balance." },
        { title: "Checking Results", desc: "When an Admin or Super Admin declares the results, winners are credited automatically. Users can view the Results tab to see winning tickets." },
        { title: "Withdrawing", desc: "Users with a balance above ₹300 can request a withdrawal to their bank/UPI. The Admin manually processes this request." }
      ]
    },
    {
      title: "2. Admin Responsibilities",
      icon: <ShieldCheck className="text-emerald-500" size={24} />,
      items: [
        { title: "Manage Payments (Top-Ups)", desc: "Admins monitor the 'Manage Payments' tab. When a user submits a top-up receipt, the Admin verifies the UTR and screenshot, then clicks 'Approve' to credit the user's wallet." },
        { title: "Withdrawal Requests", desc: "Admins monitor the 'Withdrawals' tab. When a request appears, the Admin manually sends the money to the user's provided bank/UPI, then clicks 'Mark as Paid'." },
        { title: "Reports", desc: "Admins can view basic reports like Total Topups, Withdrawals, and Sales in the dashboard." }
      ]
    },
    {
      title: "3. Super Admin Responsibilities",
      icon: <ShieldAlert className="text-indigo-500" size={24} />,
      items: [
        { title: "Declare Results", desc: "Super Admins can go to System Control and run the result declaration for a ticket. This automatically awards prizes to the winners' wallets." },
        { title: "Announcements & News", desc: "Super Admins can broadcast messages to all users via the Announcements tab. These appear as moving tickers on the users' screens." },
        { title: "User Management", desc: "Super Admins have the power to view all registered users, adjust their wallet balances directly, ban malicious users, or unban them." },
        { title: "System Settings", desc: "Super Admins can change the brand name, modify UPI details for payments, edit global withdrawal limits, and enable 'Maintenance Mode' to lock out regular users." },
        { title: "Data Migration", desc: "Super Admins can use the Data Migration tool to copy historical data from old databases in chunks." },
        { title: "Global Theme Control", desc: "Super Admins can instantly broadcast global application theme colors across all connected clients via live Firebase synchronization without page reloads." }
      ]
    },
    {
      title: "4. Advanced Analytics & Reporting",
      icon: <ShoppingCart className="text-purple-500" size={24} />,
      items: [
        { title: "Today's Tickets", desc: "Admins can monitor a live feed of all tickets purchased for the current day, complete with total volume tracking and dynamic time/type filters." },
        { title: "Revenue Explorer", desc: "Admins can view real-time daily income and use the Custom Range Explorer to calculate exact revenue over specific dates, as well as track lifetime platform revenue." },
        { title: "Active Sessions", desc: "Admins can view real-time online user presence, tracking who is currently active in the application based on live session indicators." }
      ]
    }
  ];

  return (
    <>
      <div className="p-4 sm:p-6 pb-24 max-w-4xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
           <div className="absolute top-0 right-0 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl"></div>
           <div className="flex items-center gap-4 mb-4 relative z-10">
              <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/10">
                 <BookOpen size={28} className="text-blue-300" />
              </div>
              <div>
                 <h1 className="text-2xl font-black tracking-tight uppercase italic">Platform Guide</h1>
                 <p className="text-blue-200 text-xs font-bold uppercase tracking-widest mt-1">Operational Manual v4.1</p>
              </div>
           </div>
           <p className="text-slate-300 text-sm leading-relaxed relative z-10">
             Welcome to the Official System Guide. This document outlines the complete workflow of the application, detailing how users interact with the platform and what responsibilities fall under the Admin and Super Admin roles.
           </p>
        </div>

        {/* Content Sections */}
        <div className="space-y-6">
          {sections.map((section, idx) => (
            <div key={idx} className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-900">
               <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-900">
                  <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center shadow-inner">
                    {section.icon}
                  </div>
                  <h2 className="text-lg font-black text-black tracking-tight uppercase italic">{section.title}</h2>
               </div>
               
               <div className="space-y-5">
                 {section.items.map((item, i) => (
                   <div key={i} className="flex gap-4">
                      <div className="mt-1">
                         <div className="w-6 h-6 rounded-full bg-blue-50 flex items-center justify-center border border-blue-100">
                            <span className="text-blue-600 font-bold text-[10px]">{i + 1}</span>
                         </div>
                      </div>
                      <div>
                         <h3 className="font-bold text-black text-sm">{item.title}</h3>
                         <p className="text-xs text-slate-500 leading-relaxed mt-1">{item.desc}</p>
                      </div>
                   </div>
                 ))}
               </div>
            </div>
          ))}
        </div>
        
        {/* Important Notice */}
        <div className="bg-amber-50 border border-amber-200 rounded-[2rem] p-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
           <Info className="text-amber-800 shrink-0" size={28} />
           <div>
              <h4 className="text-amber-800 font-bold text-sm">Need Help?</h4>
              <p className="text-amber-900/80 text-xs mt-1 leading-relaxed">
                If you encounter any critical issues not covered in this guide, please check the system logs in your database or contact your technical administrator for assistance. Always ensure you are logged in with the correct role (Admin vs Super Admin) to see your specific tools.
              </p>
           </div>
        </div>

      </div>
    </>
  );
};

export default AdminGuide;
