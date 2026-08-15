import React, { useState } from 'react';
import { 
  FileText, 
  Download, 
  Calendar, 
  PieChart, 
  Activity,
  ArrowRight,
  TrendingUp,
  Target,
  ChevronRight,
  Filter,
  Loader2
} from 'lucide-react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../firebase';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const AdminReports = () => {
  // Date range state (default: Last 7 Days)
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return d.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });

  const [loadingPdf, setLoadingPdf] = useState(null);
  const [loadingCsv, setLoadingCsv] = useState(null);

  // Generate Date Range Objects for Firebase Queries
  const getDateRange = () => {
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);
    return { start, end };
  };

  const fetchReportData = async (collectionName) => {
    const { start, end } = getDateRange();
    
    // Fetch all documents and filter locally to avoid Firestore missing index hangs
    const snapshot = await getDocs(collection(db, collectionName));
    const allData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    return allData.filter(item => {
      // Handle both 'timestamp' (tickets, transactions) and 'createdAt' (users) fields
      const itemDate = item.timestamp?.toDate ? item.timestamp.toDate() 
                       : (item.createdAt ? new Date(item.createdAt) : new Date(0));
      return itemDate >= start && itemDate <= end;
    });
  };

  const generateRevenueReport = async (format) => {
    setLoadingPdf(format === 'pdf' ? 'revenue' : null);
    setLoadingCsv(format === 'csv' ? 'revenue' : null);
    try {
      const tickets = await fetchReportData('tickets');
      const data = tickets.map(t => [
        t.ticketId || t.id,
        t.userName || t.userId,
        t.lotteryName,
        t.drawDate,
        `₹${t.totalPrice || 0}`,
        t.timestamp?.toDate().toLocaleString() || 'N/A'
      ]);

      if (format === 'pdf') {
        const doc = new jsPDF();
        doc.text(`Revenue Report (${startDate} to ${endDate})`, 14, 15);
        doc.autoTable({
          startY: 25,
          head: [['Ticket ID', 'User', 'Lottery', 'Draw Date', 'Amount', 'Date']],
          body: data,
        });
        doc.save(`Revenue_Report_${startDate}.pdf`);
      } else {
        const csvContent = "data:text/csv;charset=utf-8," 
          + "Ticket ID,User,Lottery,Draw Date,Amount,Date\n"
          + data.map(e => e.join(",")).join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `Revenue_Report_${startDate}.csv`);
        document.body.appendChild(link);
        link.click();
      }
    } catch (err) {
      alert("Error generating report: " + err.message);
    } finally {
      setLoadingPdf(null);
      setLoadingCsv(null);
    }
  };

  const generateGrowthReport = async (format) => {
    setLoadingPdf(format === 'pdf' ? 'growth' : null);
    setLoadingCsv(format === 'csv' ? 'growth' : null);
    try {
      const users = await fetchReportData('users');
      const data = users.map(u => [
        u.name || 'Unknown',
        u.email || u.phone || 'N/A',
        `₹${u.walletBalance || 0}`,
        u.timestamp?.toDate().toLocaleString() || 'N/A'
      ]);

      if (format === 'pdf') {
        const doc = new jsPDF();
        doc.text(`User Growth Analytics (${startDate} to ${endDate})`, 14, 15);
        doc.autoTable({
          startY: 25,
          head: [['Name', 'Contact', 'Wallet Balance', 'Joined Date']],
          body: data,
        });
        doc.save(`User_Growth_Report_${startDate}.pdf`);
      } else {
        const csvContent = "data:text/csv;charset=utf-8," 
          + "Name,Contact,Wallet Balance,Joined Date\n"
          + data.map(e => e.join(",")).join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `User_Growth_Report_${startDate}.csv`);
        document.body.appendChild(link);
        link.click();
      }
    } catch (err) {
      alert("Error generating report: " + err.message);
    } finally {
      setLoadingPdf(null);
      setLoadingCsv(null);
    }
  };

  const generateWalletReport = async (format) => {
    setLoadingPdf(format === 'pdf' ? 'wallet' : null);
    setLoadingCsv(format === 'csv' ? 'wallet' : null);
    try {
      const transactions = await fetchReportData('transactions');
      const data = transactions.map(t => [
        t.id,
        t.userId,
        t.type || t.transactionType,
        t.status,
        `₹${t.amount || 0}`,
        t.timestamp?.toDate().toLocaleString() || 'N/A'
      ]);

      if (format === 'pdf') {
        const doc = new jsPDF();
        doc.text(`Wallet Transaction Log (${startDate} to ${endDate})`, 14, 15);
        doc.autoTable({
          startY: 25,
          head: [['Transaction ID', 'User ID', 'Type', 'Status', 'Amount', 'Date']],
          body: data,
        });
        doc.save(`Wallet_Transactions_${startDate}.pdf`);
      } else {
        const csvContent = "data:text/csv;charset=utf-8," 
          + "Transaction ID,User ID,Type,Status,Amount,Date\n"
          + data.map(e => e.join(",")).join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `Wallet_Transactions_${startDate}.csv`);
        document.body.appendChild(link);
        link.click();
      }
    } catch (err) {
      alert("Error generating report: " + err.message);
    } finally {
      setLoadingPdf(null);
      setLoadingCsv(null);
    }
  };

  const reports = [
    { 
      id: 'revenue',
      title: 'Revenue Report', 
      desc: 'Detailed breakdown of sales and prize payouts.', 
      date: 'Live Data', 
      icon: Activity, color: 'text-emerald-500', bg: 'bg-emerald-50',
      onGenerate: generateRevenueReport
    },
    { 
      id: 'growth',
      title: 'User Growth Analytics', 
      desc: 'Tracking new registrations and user retention.', 
      date: 'Live Data', 
      icon: PieChart, color: 'text-blue-500', bg: 'bg-blue-50',
      onGenerate: generateGrowthReport
    },
    { 
      id: 'wallet',
      title: 'Wallet Transaction Log', 
      desc: 'Complete history of all deposits and winnings.', 
      date: 'Live Data', 
      icon: Calendar, color: 'text-primary-hover', bg: 'bg-[#eff6ff]',
      onGenerate: generateWalletReport
    },
  ];

  return (
    <div className="space-y-10 pb-32 p-4 min-h-screen bg-[#f8f9fa]">
      {/* Top Banner - Treasure Chest Theme */}
      <div className="border-[1.5px] border-primary rounded-[2.5rem] p-8 bg-white shadow-2xl relative overflow-hidden group">
         <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl"></div>
         <div className="flex gap-4 items-center">
            <img src="https://img.icons8.com/color/64/000000/treasure-chest.png" alt="Chest" className="w-16 h-16 drop-shadow-xl group-hover:scale-110 transition-transform" />
            <div className="flex-grow">
               <h2 className="text-2xl font-black text-gray-900 font-condensed uppercase tracking-tighter italic leading-none">Intelligence</h2>
               <p className="text-primary font-black text-[10px] uppercase tracking-widest leading-none mt-1">SMS Lottery Insights</p>
            </div>
         </div>
      </div>

      {/* Date Filter Controls */}
      <div className="bg-white rounded-[2rem] p-6 border border-slate-400 shadow-sm flex flex-col sm:flex-row gap-4 items-center justify-between">
         <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary shrink-0">
               <Filter size={18} />
            </div>
            <div>
               <h3 className="text-sm font-black text-gray-800 uppercase">Report Date Filter</h3>
               <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Custom Time Range</p>
            </div>
         </div>
         
         <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <div className="flex flex-col">
               <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1 mb-1">Start Date</label>
               <input 
                 type="date" 
                 value={startDate}
                 onChange={(e) => setStartDate(e.target.value)}
                 className="border border-slate-400 rounded-xl px-4 py-2 text-sm font-bold text-gray-700 focus:border-primary outline-none"
               />
            </div>
            <div className="flex flex-col">
               <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1 mb-1">End Date</label>
               <input 
                 type="date" 
                 value={endDate}
                 onChange={(e) => setEndDate(e.target.value)}
                 className="border border-slate-400 rounded-xl px-4 py-2 text-sm font-bold text-gray-700 focus:border-primary outline-none"
               />
            </div>
         </div>
      </div>

      {/* Reports List */}
      <div className="space-y-6">
         <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4 mb-2 italic">Standard Audit Logs</p>
         <div className="space-y-4">
            {reports.map((report) => (
               <div key={report.id} className="bg-white rounded-[2.2rem] p-6 border border-slate-400 shadow-sm flex flex-col gap-6 transition-all hover:border-primary-hover/50">
                  <div className="flex items-center gap-5">
                     <div className={`w-14 h-14 rounded-2xl shrink-0 flex items-center justify-center shadow-md border border-white ${report.bg} ${report.color}`}>
                        <report.icon size={28} strokeWidth={2.5} />
                     </div>
                     
                     <div className="flex-grow">
                        <div className="flex justify-between items-center mb-1">
                           <h3 className="text-sm font-black text-gray-800 tracking-tight uppercase italic">{report.title}</h3>
                           <span className="text-[8px] font-black text-gray-400 uppercase tracking-[0.2em]">{report.date}</span>
                        </div>
                        <p className="text-[10px] text-gray-400 font-medium leading-relaxed italic line-clamp-1">
                           {report.desc}
                        </p>
                     </div>
                  </div>

                  <div className="flex gap-3 justify-end border-t border-slate-200 pt-5">
                     <button 
                       onClick={() => report.onGenerate('pdf')}
                       disabled={loadingPdf === report.id || loadingCsv === report.id}
                       className="bg-slate-100 text-slate-700 px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-primary-hover hover:text-white transition-all disabled:opacity-50"
                     >
                        {loadingPdf === report.id ? <Loader2 size={14} className="animate-spin" /> : <FileText size={14} />} 
                        {loadingPdf === report.id ? 'Loading...' : 'View PDF'}
                     </button>
                     <button 
                       onClick={() => report.onGenerate('csv')}
                       disabled={loadingPdf === report.id || loadingCsv === report.id}
                       className="bg-slate-100 text-slate-700 px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-gray-900 hover:text-white transition-all disabled:opacity-50"
                     >
                        {loadingCsv === report.id ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />} 
                        {loadingCsv === report.id ? 'Loading...' : 'Export CSV'}
                     </button>
                  </div>
               </div>
            ))}
         </div>
      </div>

      {/* Mini Insight */}
      <div className="bg-gray-900 rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden group">
         <div className="absolute top-0 right-0 w-48 h-48 bg-primary-hover/20 rounded-full -mr-24 -mt-24 blur-[100px] group-hover:bg-primary-hover/40 transition-colors"></div>
         
         <div className="relative z-10 flex flex-col items-center text-center space-y-4">
            <div className="bg-primary-hover px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest shadow-xl shadow-primary-hover/20">Pro Insights</div>
            <h2 className="text-2xl font-black font-condensed tracking-tighter uppercase leading-none italic">Predictive Revenue Projection</h2>
            <p className="text-gray-400 text-xs font-medium leading-relaxed max-w-[80%] mx-auto">
              Advanced machine learning analysis of spending patterns and winning ratios for the 2024 fiscal cycle.
            </p>
            <button className="w-full bg-white text-gray-900 py-4 rounded-2xl font-black text-[12px] uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl active:scale-95 transition-all mt-4">
               Access Full Forecast <ChevronRight size={18} className="text-primary-hover" />
            </button>
         </div>
      </div>
      
      <div className="pt-8 text-center opacity-30">
         <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.3em]">Compliance & Audit Authority Protocol</p>
      </div>
    </div>
  );
};

export default AdminReports;
