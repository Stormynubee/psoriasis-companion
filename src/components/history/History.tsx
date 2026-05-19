import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../db/db';

export const History = () => {
  const logs = useLiveQuery(async () => {
    const allLogs = await db.logs.toArray();
    // Sort by date descending (newest first)
    return allLogs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  });

  const meds = useLiveQuery(() => db.medications.toArray());

  const getMedNames = (medIds: number[]) => {
    if (!meds) return '';
    return medIds.map(id => meds.find(m => m.id === id)?.name).filter(Boolean).join(', ');
  };

  return (
    <>
      <h2 style={{ marginBottom: '20px', marginTop: 0 }}>History</h2>
      
      {!logs ? (
        <p>Loading history...</p>
      ) : logs.length === 0 ? (
        <div className="card">
           <p style={{ textAlign: 'center', color: '#888' }}>No logs yet. Start logging to see your history here.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {logs.map(log => (
            <div key={log.id} className="card" style={{ marginBottom: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #333', paddingBottom: '10px', marginBottom: '10px' }}>
                <span style={{ fontWeight: 'bold', color: 'var(--accent-blue)' }}>
                  {new Date(log.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                </span>
              </div>
              
              {/* Flare-ups */}
              {log.flareUps && log.flareUps.length > 0 && (
                <div style={{ marginBottom: '10px' }}>
                  <div style={{ fontSize: '12px', color: 'var(--text-dim)', marginBottom: '5px' }}>FLARE-UPS</div>
                  {log.flareUps.map((flare, idx) => (
                    <div key={idx} style={{ background: '#2a2a2a', padding: '10px', borderRadius: '8px', marginBottom: '5px' }}>
                      <div style={{ display: 'flex', gap: '10px' }}>
                        {flare.photoUrl && (
                          <img src={flare.photoUrl} alt="Flare-up" style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '4px' }} />
                        )}
                        <div style={{ flex: 1 }}>
                           <div style={{ fontSize: '14px', display: 'flex', justifyContent: 'space-between' }}>
                             <span>Severity: <span style={{ color: 'var(--error)' }}>{flare.severity}/10</span></span>
                             <span>Itch: <span style={{ color: '#f39c12' }}>{flare.itchLevel}/10</span></span>
                           </div>
                           {flare.note && <div style={{ fontSize: '12px', color: '#ccc', marginTop: '5px' }}>"{flare.note}"</div>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Meds Taken */}
              {log.medsTaken && log.medsTaken.length > 0 && (
                <div>
                   <div style={{ fontSize: '12px', color: 'var(--text-dim)', marginBottom: '5px' }}>MEDICATIONS TAKEN</div>
                   <div style={{ fontSize: '14px', color: 'var(--accent)' }}>✓ {getMedNames(log.medsTaken)}</div>
                </div>
              )}
              
              {/* Lifestyle */}
              {log.lifestyle && (
                 <div style={{ marginTop: '10px', fontSize: '12px', display: 'flex', gap: '15px', color: '#888' }}>
                    <span>Sleep: {log.lifestyle.sleepHours}h</span>
                    <span>Stress: Level {log.lifestyle.stressLevel}</span>
                 </div>
              )}
            </div>
          ))}
        </div>
      )}
    </>
  );
};
