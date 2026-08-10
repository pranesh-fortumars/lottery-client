import React, { useState, useRef, useEffect } from 'react';
import { AlertTriangle, DatabaseZap, ListFilter } from 'lucide-react';
import { db, secondaryDb, tertiaryDb } from '../../firebase';
import { collection, getDocs, writeBatch, doc } from 'firebase/firestore';

const AdminMigration = () => {
  const [logs, setLogs] = useState([]);
  const [migrating, setMigrating] = useState(false);
  const [sourceDbId, setSourceDbId] = useState('secondary');
  const [selectedCollection, setSelectedCollection] = useState('all');
  const terminalEndRef = useRef(null);

  const ALL_COLLECTIONS = [
    'users', 'settings', 'results', 'withdrawals', 
    'security_logs', 'pending_transactions', 'tickets', 'transactions', 'announcements'
  ];

  const addLog = (text, type = 'info') => {
    const time = new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: true }).toLowerCase();
    setLogs(prev => [...prev, { time, text, type }]);
  };

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const handleMigration = async () => {
    if (!window.confirm(`Are you sure you want to migrate ${selectedCollection === 'all' ? 'ALL collections' : `the '${selectedCollection}' collection`}?`)) return;
    
    setMigrating(true);
    setLogs([]);
    addLog("Starting migration process...", "success");

    const sourceDb = sourceDbId === 'tertiary' ? tertiaryDb : secondaryDb;
    const sourceName = sourceDbId === 'tertiary' ? 'sms-lottery' : 'lottery-application-136';

    addLog(`Source Database selected: ${sourceName}`, "info");

    const collectionsToMigrate = selectedCollection === 'all' ? ALL_COLLECTIONS : [selectedCollection];

    try {
      for (const colName of collectionsToMigrate) {
        addLog(`Reading collection: ${colName}...`, "success");
        const snap = await getDocs(collection(sourceDb, colName));
        
        addLog(`Found ${snap.size} documents in ${colName}. Starting copy...`, "success");
        
        if (snap.size === 0) {
           continue;
        }

        let batch = writeBatch(db);
        let count = 0;
        let batchCount = 1;
        
        for (const docSnap of snap.docs) {
          batch.set(doc(db, colName, docSnap.id), docSnap.data());
          count++;
          if (count % 400 === 0) {
            await batch.commit();
            addLog(`Copied ${count} docs to ${colName} backup (Batch ${batchCount}).`, "success");
            batch = writeBatch(db);
            batchCount++;
            // small delay to let UI breathe and terminal scroll update
            await new Promise(r => setTimeout(r, 100));
          }
        }
        if (count % 400 !== 0) {
          await batch.commit();
          addLog(`Copied ${count} docs to ${colName} backup (Batch ${batchCount}).`, "success");
        }
        
        addLog(`✓ Collection ${colName} copied successfully.`, "success");
      }
      addLog(`✅ MIGRATION COMPLETED SUCCESSFULLY.`, "info");
    } catch (err) {
      console.error(err);
      addLog(`❌ MIGRATION FAILED: ${err.message}`, "error");
    }
    setMigrating(false);
  };

  return (
    <div className="space-y-6 pb-20 p-4 max-w-4xl mx-auto">
      {/* Warning Banner */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-4">
        <AlertTriangle className="text-amber-700 flex-shrink-0" size={24} />
        <div>
          <h3 className="text-amber-700 font-bold text-sm">Live Migration Engine</h3>
          <p className="text-amber-700 text-xs mt-1 leading-relaxed">
            Copy historical data from the selected source database to your Primary Database. To avoid hitting Firestore daily write limits (20,000 writes/day), you can migrate individual collections (chunks) one by one on different days.
          </p>
        </div>
      </div>

      {/* Control Panel */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6">
        <div className="flex flex-col gap-4 mb-6">
          <div>
            <h2 className="text-xl font-black text-slate-800 tracking-tight">Execute Migration</h2>
            <p className="text-slate-500 text-sm">Select source database and collections to migrate.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Source Database</label>
              <div className="relative">
                 <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                    <DatabaseZap size={16} />
                 </div>
                 <select 
                   value={sourceDbId}
                   onChange={(e) => setSourceDbId(e.target.value)}
                   disabled={migrating}
                   className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-bold text-slate-700 outline-none focus:border-blue-500 disabled:opacity-50 appearance-none transition-all"
                 >
                   <option value="secondary">lottery-application-136 (Secondary)</option>
                   <option value="tertiary">sms-lottery (Tertiary)</option>
                 </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Target Collections</label>
              <div className="relative">
                 <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                    <ListFilter size={16} />
                 </div>
                 <select 
                   value={selectedCollection}
                   onChange={(e) => setSelectedCollection(e.target.value)}
                   disabled={migrating}
                   className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-bold text-slate-700 outline-none focus:border-blue-500 disabled:opacity-50 appearance-none transition-all"
                 >
                   <option value="all">⚡ ALL COLLECTIONS (Full Migration)</option>
                   <option disabled>──────────</option>
                   {ALL_COLLECTIONS.map(col => (
                     <option key={col} value={col}>Only '{col}' Collection</option>
                   ))}
                 </select>
              </div>
            </div>
          </div>

          <button 
            onClick={handleMigration}
            disabled={migrating}
            className={`w-full mt-2 px-5 py-4 rounded-xl font-black text-white flex justify-center items-center gap-2 transition-all shadow-sm ${migrating ? 'bg-slate-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 active:scale-95'}`}
          >
            {migrating ? (
              <>
                <div className="w-5 h-5 border-[3px] border-white/30 border-t-white rounded-full animate-spin"></div>
                Synchronizing...
              </>
            ) : (
              <>
                <DatabaseZap size={20} />
                {selectedCollection === 'all' ? 'Start Full Migration' : `Migrate '${selectedCollection}' Only`}
              </>
            )}
          </button>
        </div>

        {/* Progress Bar (Indeterminate when migrating) */}
        {migrating && (
          <div className="w-full bg-slate-100 h-2 rounded-full mb-6 overflow-hidden">
            <div className="bg-blue-500 h-full rounded-full w-1/3 animate-[slide_1.5s_ease-in-out_infinite]"></div>
          </div>
        )}

        {/* Terminal Window */}
        <div className="bg-slate-900 rounded-xl p-4 h-[400px] overflow-auto font-mono text-sm shadow-inner relative">
          {logs.length === 0 ? (
            <p className="text-slate-500">Awaiting execution command...</p>
          ) : (
            <div className="space-y-2 min-w-max">
              {logs.map((log, i) => (
                <div key={i} className="flex gap-2">
                  <span className="text-slate-500 shrink-0">[{log.time}]</span>
                  <span className={`${log.type === 'success' ? 'text-emerald-400' : log.type === 'error' ? 'text-red-400' : 'text-blue-400'} whitespace-nowrap leading-relaxed`}>
                    {log.text}
                  </span>
                </div>
              ))}
              <div ref={terminalEndRef} className="h-2" />
            </div>
          )}
        </div>
      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes slide {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(300%); }
        }
      `}} />
    </div>
  );
};

export default AdminMigration;
