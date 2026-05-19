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
            <h2 style={{ marginBottom: '20px', marginTop: '10px' }}>Trends</h2>
            <div className="card" style={{ textAlign: 'center', padding: '40px 20px' }}>
                <span style={{ fontSize: '48px', display: 'block', marginBottom: '10px' }}>📊</span>
                <p style={{ color: 'var(--text)', fontSize: '18px', fontWeight: '600' }}>Not enough data yet</p>
                <p style={{ fontSize: '14px', color: 'var(--text-dim)', lineHeight: '1.5' }}>Log your flare-ups and lifestyle for at least 3 days to unlock insights and trends here.</p>
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
      <h2 style={{ marginBottom: '20px', marginTop: '10px' }}>Trends & Analytics</h2>
      
      <div className="card">
         <div style={{ color: 'var(--text-dim)', fontSize: '12px', fontWeight: 'bold', marginBottom: '15px', letterSpacing: '1px' }}>OVERALL AVERAGES</div>
         <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
             <div style={{ background: '#2a2a2c', padding: '20px 10px', borderRadius: '14px', textAlign: 'center' }}>
                 <div style={{ fontSize: '28px', fontWeight: 'bold', color: 'var(--error)', marginBottom: '4px' }}>{avgSeverity}</div>
                 <div style={{ fontSize: '11px', color: 'var(--text-dim)', fontWeight: '600', letterSpacing: '0.5px' }}>AVG SEVERITY</div>
             </div>
             <div style={{ background: '#2a2a2c', padding: '20px 10px', borderRadius: '14px', textAlign: 'center' }}>
                 <div style={{ fontSize: '28px', fontWeight: 'bold', color: 'var(--accent-blue)', marginBottom: '4px' }}>{avgSleep}h</div>
                 <div style={{ fontSize: '11px', color: 'var(--text-dim)', fontWeight: '600', letterSpacing: '0.5px' }}>AVG SLEEP</div>
             </div>
         </div>
      </div>

      <div className="card" style={{ borderTop: '4px solid var(--accent-blue)' }}>
         <div style={{ color: 'var(--accent-blue)', fontSize: '12px', fontWeight: 'bold', marginBottom: '18px', letterSpacing: '1px' }}>THE DATA SCIENTIST</div>
         
         <div style={{ marginBottom: '20px', background: '#1a1a1c', padding: '15px', borderRadius: '12px' }}>
             <div style={{ fontSize: '14px', marginBottom: '8px', color: 'var(--text-dim)' }}>Flare Severity with <b style={{color: 'white'}}>Good Sleep (&gt;7h)</b>:</div>
             <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--accent)' }}>{goodSleepSeverity} <span style={{fontSize:'14px', fontWeight:'normal', color:'var(--text-dim)'}}>/ 10</span></div>
         </div>
         
         <div style={{ background: '#1a1a1c', padding: '15px', borderRadius: '12px' }}>
             <div style={{ fontSize: '14px', marginBottom: '8px', color: 'var(--text-dim)' }}>Flare Severity with <b style={{color: 'white'}}>Poor Sleep (≤6h)</b>:</div>
             <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--error)' }}>{badSleepSeverity} <span style={{fontSize:'14px', fontWeight:'normal', color:'var(--text-dim)'}}>/ 10</span></div>
         </div>
         
         <p style={{ fontSize: '12px', color: 'var(--text-dim)', marginTop: '20px', textAlign: 'center' }}>
             Insights become more accurate as you log more days.
         </p>
      </div>
      
      <div className="card">
         <div style={{ color: 'var(--text-dim)', fontSize: '12px', fontWeight: 'bold', marginBottom: '15px', letterSpacing: '1px' }}>SEVERITY OVER TIME</div>
         <div style={{ background: '#2a2a2c', height: '140px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: '#666', fontSize: '13px', fontWeight: '500' }}>[ Interactive Line Chart Coming Soon ]</span>
         </div>
      </div>
    </>
  );
};
