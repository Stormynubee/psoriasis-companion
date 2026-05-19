import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../db/db';
import { Plus, Trash2 } from 'lucide-react';

export const Settings = () => {
  const meds = useLiveQuery(() => db.medications.toArray());
  const [showAddForm, setShowAddForm] = useState(false);
  const [newMed, setNewMed] = useState({ name: '', dosage: '', schedule: 'morning', reminderTime: '08:00' });

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMed.name) return;
    await db.medications.add({
      name: newMed.name,
      dosage: newMed.dosage,
      schedule: newMed.schedule as 'morning' | 'evening' | 'custom',
      reminderTime: newMed.reminderTime
    });
    setNewMed({ name: '', dosage: '', schedule: 'morning', reminderTime: '08:00' });
    setShowAddForm(false);
  };

  const handleDelete = async (id?: number) => {
    if (id) await db.medications.delete(id);
  };

  return (
    <>
      <h2 style={{ marginBottom: '20px', marginTop: 0 }}>Settings</h2>
      
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
          <div style={{ color: 'var(--text-dim)', fontSize: '12px', fontWeight: 'bold' }}>MY MEDICATIONS</div>
          <button 
            onClick={() => setShowAddForm(!showAddForm)}
            style={{ background: 'var(--accent)', color: 'white', border: 'none', borderRadius: '50%', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
          >
            <Plus size={16} />
          </button>
        </div>

        {showAddForm && (
          <form onSubmit={handleAdd} style={{ marginBottom: '20px', padding: '15px', background: '#2a2a2a', borderRadius: '8px' }}>
            <input 
              placeholder="Medication Name" 
              value={newMed.name}
              onChange={e => setNewMed({...newMed, name: e.target.value})}
              style={{ width: '100%', boxSizing: 'border-box', marginBottom: '10px', padding: '8px', background: '#1a1a1a', border: '1px solid #444', color: 'white', borderRadius: '4px' }}
              required
            />
            <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
              <input 
                placeholder="Dosage (e.g., 20mg)" 
                value={newMed.dosage}
                onChange={e => setNewMed({...newMed, dosage: e.target.value})}
                style={{ flex: 1, padding: '8px', background: '#1a1a1a', border: '1px solid #444', color: 'white', borderRadius: '4px' }}
              />
              <select 
                value={newMed.schedule}
                onChange={e => setNewMed({...newMed, schedule: e.target.value})}
                style={{ flex: 1, padding: '8px', background: '#1a1a1a', border: '1px solid #444', color: 'white', borderRadius: '4px' }}
              >
                <option value="morning">Morning</option>
                <option value="evening">Evening</option>
                <option value="custom">Custom</option>
              </select>
            </div>
            <button type="submit" style={{ width: '100%', padding: '10px', background: 'var(--accent-blue)', color: 'white', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>
              Save Medication
            </button>
          </form>
        )}

        {!meds ? (
          <p>Loading...</p>
        ) : meds.length === 0 ? (
          <p style={{ fontSize: '14px', color: '#888' }}>No medications added yet. Tap the + to add one.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {meds.map(med => (
              <div key={med.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', background: '#2a2a2a', borderRadius: '8px' }}>
                <div>
                  <div style={{ fontWeight: 'bold' }}>{med.name}</div>
                  <div style={{ fontSize: '12px', color: '#888' }}>{med.dosage} • {med.schedule}</div>
                </div>
                <button onClick={() => handleDelete(med.id)} style={{ background: 'transparent', border: 'none', color: 'var(--error)', cursor: 'pointer' }}>
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="card">
         <div style={{ color: 'var(--text-dim)', fontSize: '12px', fontWeight: 'bold', marginBottom: '15px' }}>APP PREFERENCES</div>
         <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #333' }}>
            <span>Push Notifications</span>
            <input type="checkbox" defaultChecked style={{ accentColor: 'var(--accent)' }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0' }}>
            <span>Dark Mode</span>
            <input type="checkbox" defaultChecked style={{ accentColor: 'var(--accent)' }} />
          </div>
      </div>
    </>
  );
};
