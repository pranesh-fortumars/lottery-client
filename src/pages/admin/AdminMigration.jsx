import React, { useState, useRef, useEffect } from 'react';
import { AlertTriangle, DatabaseZap } from 'lucide-react';
import { db, secondaryDb, tertiaryDb } from '../../firebase';
import { collection, getDocs, writeBatch, doc } from 'firebase/firestore';

const AdminMigration = () => {
  const [logs, setLogs] = useState([]);
  const [migrating, setMigrating] = useState(false);
  const [sourceDbId, setSourceDbId] = useState('secondary');
  const terminalEndRef = useRef(null);

  const collectionsToMigrate = [
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
    if (!window.confirm("Are you sure you want to start the live data migration?")) return;
    
    setMigrating(true);
    setLogs([]);
    addLog("Starting migration process...", "success");

    const sourceDb = sourceDbId === 'tertiary' ? tertiaryDb : secondaryDb;
    const sourceName = sourceDbId === 'tertiary' ? 'sms-lottery' : 'lottery-application-136';

    addLog(`Source Database selected: ${sourceName}`, "info");

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
      addLog("✅ ALL COLLECTIONS MIGRATED SUCCESSFULLY.", "info");
    } catch (err) {
      console.error(err);
      addLog(`❌ MIGRATION FAILED: ${err.message}`, "error");
    }
    setMigrating(false);
  };

  return (
    <div className="space-y-6 pb-20 p-4">
      {/* Warning Banner */}
      <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex gap-4">
        <AlertTriangle className="text-red-700 flex-shrink-0" size={24} />
        <div>
          <h3 className="text-red-700 font-bold text-sm">Warning: Live Migration Engine</h3>
          <p className="text-red-700 text-xs mt-1 leading-relaxed">
            This tool performs a one-way historical data copy from the selected source database to your Primary Database. It executes heavy batch writes. Do not refresh the page while migration is running.
          </p>
        </div>
      </div>

      {/* Control Panel */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h2 className="text-xl font-black text-[#0f172a] tracking-tight">Execute Migration</h2>
            <p className="text-gray-500 text-sm">Target: {collectionsToMigrate.length} Collections</p>
          </div>
          
          <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 w-full md:w-auto">
            <select 
              value={sourceDbId}
              onChange={(e) => setSourceDbId(e.target.value)}
              disabled={migrating}
              className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-gray-700 outline-none focus:border-red-500 disabled:opacity-50"
            >
              <option value="secondary">Source: lottery-application-136</option>
              <option value="tertiary">Source: sms-lottery</option>
            </select>

            <button 
              onClick={handleMigration}
              disabled={migrating}
              className={`px-5 py-3 rounded-xl font-black text-white flex items-center gap-2 transition-all ${migrating ? 'bg-[#94a3b8] cursor-not-allowed' : 'bg-[#e11d48] hover:bg-[#be123c] active:scale-95'}`}
            >
              {migrating ? (
                <>
                  <div className="w-5 h-5 border-[3px] border-white/30 border-t-white rounded-full animate-spin"></div>
                  Syncing...
                </>
              ) : (
                <>
                  <DatabaseZap size={20} />
                  Start Full Migration
                </>
              )}
            </button>
          </div>
        </div>

        {/* Progress Bar (Indeterminate when migrating) */}
        {migrating && (
          <div className="w-full bg-gray-100 h-2 rounded-full mb-6 overflow-hidden">
            <div className="bg-[#e11d48] h-full rounded-full w-1/3 animate-[slide_1.5s_ease-in-out_infinite]"></div>
          </div>
        )}

        {/* Terminal Window */}
        <div className="bg-[#0f172a] rounded-xl p-4 h-[400px] overflow-y-auto font-mono text-sm shadow-inner relative">
          {logs.length === 0 ? (
            <p className="text-gray-500">Awaiting execution command...</p>
          ) : (
            <div className="space-y-2">
              {logs.map((log, i) => (
                <div key={i} className="flex gap-2">
                  <span className="text-gray-500 shrink-0">[{log.time}]</span>
                  <span className={`${log.type === 'success' ? 'text-[#34d399]' : log.type === 'error' ? 'text-red-400' : 'text-blue-400'} break-all whitespace-pre-wrap leading-relaxed`}>
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
