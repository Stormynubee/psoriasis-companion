import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../db/db';

export const MedChecklist = () => {
  const meds = useLiveQuery(() => db.medications.toArray());
  
  if (!meds) return <div className="card">Loading meds...</div>;

  return (
    <div className="card">
      <div style={{ color: 'var(--text-dim)', fontSize: '12px', marginBottom: '10px' }}>MEDICATION CHECKLIST</div>
      {meds.length === 0 ? (
        <p style={{ fontSize: '14px' }}>No meds added. Go to settings.</p>
      ) : (
        meds.map(med => (
          <div key={med.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #333' }}>
            <span>{med.name}</span>
            <input type="checkbox" style={{ accentColor: 'var(--accent)', width: '20px', height: '20px' }} />
          </div>
        ))
      )}
    </div>
  );
};
