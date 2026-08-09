import React, { useState } from 'react';
import PageWrapper from '../components/PageWrapper';
import { Shield, Key, DownloadCloud, History, ChevronLeft, ChevronRight, AlertTriangle, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { doc, updateDoc, addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';

const PrivacySecurityPage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteAccount = async () => {
    if (!user) return;
    setIsDeleting(true);
    try {
      // 1. Soft delete the user document
      await updateDoc(doc(db, 'users', user.uid), {
        status: 'Deleted',
        isDeleted: true,
        active: false,
        deletedAt: new Date().toISOString()
      });

      // 2. Generate Admin Notification
      await addDoc(collection(db, 'notifications'), {
        userId: 'ADMIN',
        title: '⚠️ Account Deleted',
        message: `User ${user.name || 'Unknown'} (${user.mobile || 'N/A'} / ${user.email || 'N/A'}) has deleted their account. Final Balance: ₹${user.balance || 0}.`,
        type: 'alert',
        timestamp: serverTimestamp(),
        read: false
      });

      // 3. Force logout
      await logout();
    } catch (error) {
      console.error("Error deleting account:", error);
      alert("Failed to delete account. Please try again or contact support.");
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const securityOptions = [
    { icon: <Key size={20} />, label: 'Two-Factor Authentication', desc: 'Add an extra layer of security', status: 'Disabled', color: 'text-slate-400' },
    { icon: <History size={20} />, label: 'Login History', desc: 'Review recent account access', status: 'Secure', color: 'text-emerald-500' },
    { icon: <DownloadCloud size={20} />, label: 'Download Account Data', desc: 'Get a copy of your info', status: 'Ready', color: 'text-blue-500' },
  ];

  return (
    <PageWrapper title="PRIVACY & SECURITY" showNav={false}>
      <div className="bg-slate-50 min-h-screen pb-24">
        {/* Header */}
        <div className="bg-blue-600 h-[70px] flex items-center px-4 text-white shadow-sm relative z-10">
          <button onClick={() => navigate('/settings')} className="p-2 -ml-2 active:scale-95 transition-all">
            <ChevronLeft size={28} />
          </button>
          <h1 className="text-xl font-bold tracking-tight uppercase ml-2">Privacy & Security</h1>
        </div>

        <div className="p-4 space-y-4 max-w-lg mx-auto mt-4">
          
          <div className="bg-slate-900 rounded-3xl p-6 text-white shadow-sm relative overflow-hidden group mb-6">
             <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl"></div>
             <div className="relative z-10 flex gap-4 items-center">
                <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center border border-white/10 text-emerald-400">
                   <Shield size={28} />
                </div>
                <div>
                   <h2 className="text-xl font-bold tracking-tight uppercase leading-none">Security Status</h2>
                   <p className="text-emerald-400 text-[10px] font-bold uppercase tracking-widest mt-1">Good - Protected</p>
                </div>
             </div>
          </div>

          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-4 mb-2">Advanced Security</p>
          
          {securityOptions.map((opt, idx) => (
            <div 
              key={idx} 
              className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 flex items-center justify-between group active:scale-[0.98] transition-all cursor-pointer hover:border-blue-200"
              onClick={() => alert(`Redirecting to ${opt.label} configuration...`)}
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-500 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors border border-slate-100">
                  {opt.icon}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800 uppercase tracking-tight">{opt.label}</h3>
                  <p className="text-[10px] font-medium text-slate-500 mt-0.5">{opt.desc}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                 <span className={`text-[9px] font-bold uppercase tracking-widest ${opt.color}`}>{opt.status}</span>
                 <ChevronRight size={16} className="text-slate-300 group-hover:text-blue-600 transition-colors" />
              </div>
            </div>
          ))}

          <div className="mt-8 pt-6 border-t border-slate-200 text-center">
            <button 
              onClick={() => setShowDeleteModal(true)}
              className="text-[10px] font-bold text-red-600 uppercase tracking-widest hover:underline underline-offset-4"
            >
               Delete Account Permanently
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl relative overflow-hidden animate-in fade-in zoom-in duration-200 border border-slate-100">
            <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-full blur-3xl"></div>
            
            <div className="flex justify-between items-start mb-6 relative z-10">
              <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center text-red-600">
                <AlertTriangle size={24} />
              </div>
              <button 
                onClick={() => !isDeleting && setShowDeleteModal(false)}
                className="w-8 h-8 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 active:scale-95 transition-all"
              >
                <X size={16} />
              </button>
            </div>

            <h2 className="text-xl font-bold uppercase tracking-tight text-slate-900 mb-2 relative z-10">
              Delete Account?
            </h2>
            <p className="text-sm text-slate-600 mb-6 font-medium relative z-10">
              This action is permanent and irreversible. You will immediately lose access to:
              <ul className="list-disc ml-5 mt-2 space-y-1 text-xs text-slate-500">
                <li>Your wallet balance and funds</li>
                <li>Active lottery tickets</li>
                <li>Transaction and win history</li>
              </ul>
            </p>

            <div className="flex gap-3 relative z-10">
              <button 
                onClick={() => setShowDeleteModal(false)}
                disabled={isDeleting}
                className="flex-1 py-4 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-bold text-[10px] uppercase tracking-widest active:scale-95 transition-all disabled:opacity-50"
              >
                Cancel
              </button>
              <button 
                onClick={handleDeleteAccount}
                disabled={isDeleting}
                className="flex-1 py-4 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-[10px] uppercase tracking-widest active:scale-95 shadow-sm transition-all disabled:opacity-50"
              >
                {isDeleting ? 'Deleting...' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </PageWrapper>
  );
};

export default PrivacySecurityPage;
