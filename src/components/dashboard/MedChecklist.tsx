import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../db/db';

export const MedChecklist = () => {
  const meds = useLiveQuery(() => db.medications.toArray());
  
  if (!meds) return <div className="card">Loading meds...</div>;

  return (
    <div className="card">
      <div style={{ color: 'var(--text-dim)', fontSize: '12px', marginBottom: '15px', fontWeight: 'bold', letterSpacing: '1px' }}>MEDICATION CHECKLIST</div>
      {meds.length === 0 ? (
        <p style={{ fontSize: '14px', color: 'var(--text-dim)' }}>No meds added. Go to settings.</p>
      ) : (
        meds.map((med, i) => (
          <div key={med.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: i === meds.length - 1 ? 'none' : '1px solid var(--border)' }}>
            <div>
              <div style={{ fontSize: '16px', fontWeight: '500' }}>{med.name}</div>
              <div style={{ fontSize: '12px', color: 'var(--text-dim)' }}>{med.dosage}</div>
            </div>
            <input type="checkbox" style={{ accentColor: 'var(--accent)', width: '22px', height: '22px', cursor: 'pointer' }} />
          </div>
        ))
      )}
    </div>
  );
};
