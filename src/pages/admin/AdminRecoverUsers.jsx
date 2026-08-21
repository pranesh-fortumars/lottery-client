import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { collection, getDocs, doc, writeBatch, deleteDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../../context/AuthContext';
import { ShieldAlert, RefreshCcw, ArrowLeft, DatabaseBackup, AlertCircle } from 'lucide-react';

const AdminRecoverUsers = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [archivedUsers, setArchivedUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [restoringId, setRestoringId] = useState(null);

  useEffect(() => {
    fetchArchivedUsers();
  }, []);

  const fetchArchivedUsers = async () => {
    try {
      const snap = await getDocs(collection(db, 'archived_users'));
      const list = [];
      snap.forEach(docSnap => {
        list.push({ id: docSnap.id, ...docSnap.data() });
      });
      setArchivedUsers(list.sort((a, b) => new Date(b.archivedAt) - new Date(a.archivedAt)));
    } catch (error) {
      console.error("Error fetching archived users:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFullRecovery = async (archivedUser) => {
    if (!user?.isSuperAdmin) {
      alert("Only Super Admins can perform full data recovery.");
      return;
    }
    const confirm = window.prompt("CRITICAL: This will reconstruct this user's entire profile, tickets, and transactions from the backup exactly as they were before deletion. Type 'RESTORE' to confirm.");
    if (confirm !== 'RESTORE') return;

    setRestoringId(archivedUser.id);
    try {
      const { profile, tickets, pending_transactions, withdrawals, notifications, login_sessions } = archivedUser;
      
      const docsToCreate = [];
      
      if (profile) docsToCreate.push({ collection: 'users', id: archivedUser.id, data: profile });
      
      const arraysToMap = [
        { name: 'tickets', data: tickets },
        { name: 'pending_transactions', data: pending_transactions },
        { name: 'withdrawals', data: withdrawals },
        { name: 'notifications', data: notifications },
        { name: 'login_sessions', data: login_sessions },
      ];

      arraysToMap.forEach(({ name, data }) => {
        if (Array.isArray(data)) {
          data.forEach(item => {
            const { id, ...docData } = item;
            docsToCreate.push({ collection: name, id, data: docData });
          });
        }
      });

      // Write in chunks of 450
      const chunkSize = 450;
      for (let i = 0; i < docsToCreate.length; i += chunkSize) {
        const chunk = docsToCreate.slice(i, i + chunkSize);
        const batch = writeBatch(db);
        chunk.forEach(item => {
          const ref = doc(db, item.collection, item.id);
          batch.set(ref, item.data);
        });
        await batch.commit();
      }

      // Finally, delete the backup document
      await deleteDoc(doc(db, 'archived_users', archivedUser.id));

      alert("Data recovery completed successfully! The user and all their records have been completely restored.");
      fetchArchivedUsers();
    } catch (error) {
      console.error("Error recovering data:", error);
      alert("Failed to recover user data.");
    } finally {
      setRestoringId(null);
    }
  };

  return (
    <div className="space-y-6 p-4 pb-24 relative min-h-screen bg-[#f8f9fa]">
      <div className="flex items-center justify-between">
         <button onClick={() => navigate(-1)} className="p-3 bg-white border border-gray-900 rounded-2xl shadow-sm hover:bg-gray-50 active:scale-95 transition-all">
            <ArrowLeft size={20} className="text-gray-900" />
         </button>
         <h1 className="text-xl font-black uppercase italic tracking-tighter text-gray-900">Restricted Recovery</h1>
      </div>

      <div className="bg-red-50 border-2 border-red-500/20 rounded-2xl p-4 flex gap-3 shadow-sm">
        <ShieldAlert className="text-red-600 flex-shrink-0" size={24} />
        <div>
           <h3 className="text-red-900 font-black text-xs uppercase tracking-widest mb-1">Super Admin Access Only</h3>
           <p className="text-red-800 text-[10px] font-medium leading-relaxed">
             This area contains full immutable backups of permanently deleted users. Recovering a user will explosively restore all their tickets, wallet history, and profile back to the live database.
           </p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-10">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
        </div>
      ) : (
        <div className="space-y-4">
          <AnimatePresence>
            {archivedUsers.length > 0 ? archivedUsers.map(u => (
              <motion.div
                key={u.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-2xl p-4 border border-gray-900 shadow-sm"
              >
                <div className="flex justify-between items-start mb-4 border-b border-gray-100 pb-3">
                  <div>
                    <h3 className="font-black text-gray-900 uppercase italic">{u.profile?.name || 'Unknown'}</h3>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{u.profile?.mobile}</p>
                    <p className="text-[9px] text-red-500 font-black uppercase tracking-widest mt-1 bg-red-50 inline-block px-2 py-0.5 rounded">
                      Deleted: {new Date(u.archivedAt).toLocaleString('en-IN')}
                    </p>
                  </div>
                  <DatabaseBackup size={24} className="text-gray-300" />
                </div>
                
                <div className="grid grid-cols-2 gap-2 mb-4">
                  <div className="bg-gray-50 p-2 rounded-xl text-center border border-gray-100">
                     <p className="text-[8px] text-gray-500 font-black uppercase tracking-widest">Backed Up Tickets</p>
                     <p className="font-black text-sm">{u.tickets?.length || 0}</p>
                  </div>
                  <div className="bg-gray-50 p-2 rounded-xl text-center border border-gray-100">
                     <p className="text-[8px] text-gray-500 font-black uppercase tracking-widest">Wallet Trans.</p>
                     <p className="font-black text-sm">{(u.pending_transactions?.length || 0) + (u.withdrawals?.length || 0)}</p>
                  </div>
                </div>

                <button
                  onClick={() => handleFullRecovery(u)}
                  disabled={restoringId === u.id}
                  className="w-full bg-gray-900 text-white rounded-xl py-3 text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2 hover:bg-gray-800 active:scale-95 transition-all disabled:opacity-50 shadow-xl shadow-black/10"
                >
                  {restoringId === u.id ? <RefreshCcw className="animate-spin" size={16} /> : <RefreshCcw size={16} />}
                  {restoringId === u.id ? 'Restoring...' : 'Perform Full Recovery'}
                </button>
              </motion.div>
            )) : (
              <div className="text-center py-12">
                 <AlertCircle size={32} className="text-gray-300 mx-auto mb-3" />
                 <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">No Backups Found</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

export default AdminRecoverUsers;
