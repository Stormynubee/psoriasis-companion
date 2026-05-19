import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../db/db';

export const Trends = () => {
  const logs = useLiveQuery(async () => {
    const allLogs = await db.logs.toArray();
    return allLogs.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  });

  if (!logs) return <p>Loading trends...</p>;
  
  if (logs.length < 3) {
      return (
          <>
            <h2 style={{ marginBottom: '20px', marginTop: 0 }}>Trends</h2>
            <div className="card" style={{ textAlign: 'center', padding: '30px 15px' }}>
                <span style={{ fontSize: '40px' }}>📊</span>
                <p style={{ color: '#888' }}>Not enough data yet.</p>
                <p style={{ fontSize: '14px' }}>Log your flare-ups and lifestyle for at least 3 days to see insights and trends here.</p>
            </div>
          </>
      )
  }

  // Simple Analytics Calculations
  const avgSeverity = (logs.reduce((acc, l) => acc + (l.flareUps[0]?.severity || 0), 0) / logs.length).toFixed(1);
  const avgSleep = (logs.reduce((acc, l) => acc + (l.lifestyle?.sleepHours || 0), 0) / logs.length).toFixed(1);
  
  const goodSleepLogs = logs.filter(l => (l.lifestyle?.sleepHours || 0) > 7);
  const goodSleepSeverity = goodSleepLogs.length > 0 
    ? (goodSleepLogs.reduce((acc, l) => acc + (l.flareUps[0]?.severity || 0), 0) / goodSleepLogs.length).toFixed(1) 
    : "N/A";

  const badSleepLogs = logs.filter(l => (l.lifestyle?.sleepHours || 0) <= 6);
  const badSleepSeverity = badSleepLogs.length > 0
    ? (badSleepLogs.reduce((acc, l) => acc + (l.flareUps[0]?.severity || 0), 0) / badSleepLogs.length).toFixed(1)
    : "N/A";

  return (
    <>
      <h2 style={{ marginBottom: '20px', marginTop: 0 }}>Trends & Analytics</h2>
      
      <div className="card">
         <div style={{ color: 'var(--text-dim)', fontSize: '12px', fontWeight: 'bold', marginBottom: '15px' }}>OVERALL AVERAGES</div>
         <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
             <div style={{ background: '#2a2a2a', padding: '15px', borderRadius: '8px', textAlign: 'center' }}>
                 <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--error)' }}>{avgSeverity}</div>
                 <div style={{ fontSize: '12px', color: '#888' }}>AVG SEVERITY</div>
             </div>
             <div style={{ background: '#2a2a2a', padding: '15px', borderRadius: '8px', textAlign: 'center' }}>
                 <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--accent-blue)' }}>{avgSleep}h</div>
                 <div style={{ fontSize: '12px', color: '#888' }}>AVG SLEEP</div>
             </div>
         </div>
      </div>

      <div className="card" style={{ borderTop: '3px solid var(--accent-blue)' }}>
         <div style={{ color: 'var(--accent-blue)', fontSize: '12px', fontWeight: 'bold', marginBottom: '15px' }}>THE DATA SCIENTIST</div>
         
         <div style={{ marginBottom: '15px' }}>
             <div style={{ fontSize: '14px', marginBottom: '5px' }}>Flare Severity with <b>Good Sleep (&gt;7h)</b>:</div>
             <div style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--accent)' }}>{goodSleepSeverity} <span style={{fontSize:'14px', fontWeight:'normal', color:'#888'}}>/ 10</span></div>
         </div>
         
         <div>
             <div style={{ fontSize: '14px', marginBottom: '5px' }}>Flare Severity with <b>Poor Sleep (≤6h)</b>:</div>
             <div style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--error)' }}>{badSleepSeverity} <span style={{fontSize:'14px', fontWeight:'normal', color:'#888'}}>/ 10</span></div>
         </div>
         
         <p style={{ fontSize: '12px', color: '#888', marginTop: '15px', fontStyle: 'italic' }}>
             * Insights get more accurate as you log more days.
         </p>
      </div>
      
      {/* Placeholder for a future chart */}
      <div className="card">
         <div style={{ color: 'var(--text-dim)', fontSize: '12px', fontWeight: 'bold', marginBottom: '10px' }}>SEVERITY OVER TIME</div>
         <div style={{ background: '#2a2a2a', height: '120px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: '#555', fontSize: '12px' }}>[ Interactive Line Chart Coming Soon ]</span>
         </div>
      </div>
    </>
  );
};
