import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../db/db';

export const History = () => {
  const logs = useLiveQuery(async () => {
    const allLogs = await db.logs.toArray();
    return allLogs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  });

  const meds = useLiveQuery(() => db.medications.toArray());

  const getMedNames = (medIds: number[]) => {
    if (!meds) return '';
    return medIds.map(id => meds.find(m => m.id === id)?.name).filter(Boolean).join(', ');
  };

  return (
    <>
      <h2 className="card-stagger-1" style={{ marginBottom: '20px', marginTop: '10px' }}>History</h2>
      
      {!logs ? (
        <p>Loading history...</p>
      ) : logs.length === 0 ? (
        <div className="card card-stagger-2">
           <p style={{ textAlign: 'center', color: '#888' }}>No logs yet. Start logging to see your history here.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {logs.map((log, idx) => (
            <div key={log.id} className={`card card-stagger-${Math.min(idx + 2, 3)}`} style={{ marginBottom: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '12px', marginBottom: '15px' }}>
                <span style={{ fontWeight: 'bold', fontSize: '16px', color: 'var(--accent-blue)' }}>
                  {new Date(log.date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                </span>
              </div>
              
              {/* Flare-ups */}
              {log.flareUps && log.flareUps.length > 0 && (
                <div style={{ marginBottom: '15px' }}>
                  <div style={{ fontSize: '12px', color: 'var(--text-dim)', marginBottom: '8px', fontWeight: 'bold', letterSpacing: '0.5px' }}>FLARE-UPS</div>
                  {log.flareUps.map((flare, idx) => (
                    <div key={idx} style={{ background: '#2a2a2c', padding: '12px', borderRadius: '12px', marginBottom: '8px' }}>
                      <div style={{ display: 'flex', gap: '12px' }}>
                        {flare.photoUrl && (
                          <img src={flare.photoUrl} alt="Flare-up" style={{ width: '65px', height: '65px', objectFit: 'cover', borderRadius: '8px' }} />
                        )}
                        <div style={{ flex: 1 }}>
                           <div style={{ fontSize: '14px', display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                             <span style={{ fontWeight: '500' }}>Severity: <span style={{ color: 'var(--error)' }}>{flare.severity}/10</span></span>
                             <span style={{ fontWeight: '500' }}>Itch: <span style={{ color: '#ff9f0a' }}>{flare.itchLevel}/10</span></span>
                           </div>
                           {flare.note && <div style={{ fontSize: '13px', color: 'var(--text-dim)', marginTop: '4px', fontStyle: 'italic' }}>"{flare.note}"</div>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Meds Taken */}
              {log.medsTaken && log.medsTaken.length > 0 && (
                <div style={{ marginBottom: '15px' }}>
                   <div style={{ fontSize: '12px', color: 'var(--text-dim)', marginBottom: '5px', fontWeight: 'bold', letterSpacing: '0.5px' }}>MEDICATIONS TAKEN</div>
                   <div style={{ fontSize: '14px', color: 'var(--accent)', fontWeight: '500' }}>✓ {getMedNames(log.medsTaken)}</div>
                </div>
              )}
              
              {/* Lifestyle */}
              {log.lifestyle && (
                 <div style={{ background: '#1a1a1c', padding: '10px', borderRadius: '8px', fontSize: '13px', display: 'flex', justifyContent: 'space-around', color: 'var(--text-dim)' }}>
                    <span><b style={{color: 'white'}}>{log.lifestyle.sleepHours}h</b> Sleep</span>
                    <span style={{ borderLeft: '1px solid var(--border)', paddingLeft: '15px' }}><b style={{color: 'white'}}>Lvl {log.lifestyle.stressLevel}</b> Stress</span>
                 </div>
              )}
            </div>
          ))}
        </div>
      )}
    </>
  );
};
