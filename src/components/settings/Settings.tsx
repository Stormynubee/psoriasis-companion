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
      <h2 style={{ marginBottom: '20px', marginTop: '10px' }}>Settings</h2>
      
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
          <div style={{ color: 'var(--text-dim)', fontSize: '12px', fontWeight: 'bold', letterSpacing: '1px' }}>MY MEDICATIONS</div>
          <button 
            onClick={() => setShowAddForm(!showAddForm)}
            style={{ background: 'var(--accent)', color: 'black', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 8px rgba(48, 209, 88, 0.4)' }}
          >
            <Plus size={20} strokeWidth={3} />
          </button>
        </div>

        {showAddForm && (
          <form onSubmit={handleAdd} style={{ marginBottom: '20px', padding: '15px', background: '#2a2a2c', borderRadius: '12px', border: '1px solid var(--border)' }}>
            <input 
              placeholder="Medication Name" 
              value={newMed.name}
              onChange={e => setNewMed({...newMed, name: e.target.value})}
              style={{ width: '100%', boxSizing: 'border-box', marginBottom: '10px', padding: '12px', background: '#1a1a1c', border: '1px solid #444', color: 'white', borderRadius: '8px', fontSize: '15px' }}
              required
            />
            <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
              <input 
                placeholder="Dosage (e.g., 20mg)" 
                value={newMed.dosage}
                onChange={e => setNewMed({...newMed, dosage: e.target.value})}
                style={{ flex: 1, padding: '12px', background: '#1a1a1c', border: '1px solid #444', color: 'white', borderRadius: '8px', fontSize: '15px' }}
              />
              <select 
                value={newMed.schedule}
                onChange={e => setNewMed({...newMed, schedule: e.target.value})}
                style={{ flex: 1, padding: '12px', background: '#1a1a1c', border: '1px solid #444', color: 'white', borderRadius: '8px', fontSize: '15px', appearance: 'none' }}
              >
                <option value="morning">Morning</option>
                <option value="evening">Evening</option>
                <option value="custom">Custom</option>
              </select>
            </div>
            <button type="submit" style={{ width: '100%', padding: '12px', background: 'var(--accent-blue)', color: 'white', border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: 'bold', cursor: 'pointer' }}>
              Save Medication
            </button>
          </form>
        )}

        {!meds ? (
          <p>Loading...</p>
        ) : meds.length === 0 ? (
          <p style={{ fontSize: '14px', color: '#888', textAlign: 'center', padding: '10px 0' }}>No medications added yet.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {meds.map(med => (
              <div key={med.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 15px', background: '#2a2a2c', borderRadius: '12px' }}>
                <div>
                  <div style={{ fontWeight: '600', fontSize: '15px' }}>{med.name}</div>
                  <div style={{ fontSize: '13px', color: 'var(--text-dim)', marginTop: '2px' }}>{med.dosage} • <span style={{ textTransform: 'capitalize' }}>{med.schedule}</span></div>
                </div>
                <button onClick={() => handleDelete(med.id)} style={{ background: 'transparent', border: 'none', color: 'var(--error)', cursor: 'pointer', padding: '5px' }}>
                  <Trash2 size={20} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="card">
         <div style={{ color: 'var(--text-dim)', fontSize: '12px', fontWeight: 'bold', marginBottom: '20px', letterSpacing: '1px' }}>APP PREFERENCES</div>
         <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '15px', borderBottom: '1px solid var(--border)', marginBottom: '15px' }}>
            <span style={{ fontSize: '15px', fontWeight: '500' }}>Push Notifications</span>
            <input type="checkbox" className="toggle" defaultChecked />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '15px', fontWeight: '500' }}>Dark Mode</span>
            <input type="checkbox" className="toggle" defaultChecked />
          </div>
      </div>

      <div className="card">
         <div style={{ color: 'var(--text-dim)', fontSize: '12px', fontWeight: 'bold', marginBottom: '20px', letterSpacing: '1px' }}>AETHER GESTURES ACCESSIBILITY</div>
         
         <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '15px', borderBottom: '1px solid var(--border)', marginBottom: '15px' }}>
            <div>
              <span style={{ fontSize: '15px', fontWeight: '500', display: 'block' }}>Touchless Gesture Mode</span>
              <span style={{ fontSize: '12px', color: 'var(--text-dim)' }}>Navigate using physical hand gestures</span>
            </div>
            <input 
              type="checkbox" 
              className="toggle" 
              checked={JSON.parse(localStorage.getItem('aether_active') || 'false')}
              onChange={(e) => {
                localStorage.setItem('aether_active', JSON.stringify(e.target.checked));
                window.location.reload();
              }}
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
             <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '14px', fontWeight: '500' }}>Pointer Smoothness (EMA Alpha)</span>
                <span style={{ color: 'var(--accent)', fontWeight: 'bold' }}>{parseFloat(localStorage.getItem('aether_alpha') || '0.35')}</span>
             </div>
             <input 
               type="range" 
               min="0.1" 
               max="0.9" 
               step="0.05"
               value={parseFloat(localStorage.getItem('aether_alpha') || '0.35')}
               onChange={(e) => {
                 localStorage.setItem('aether_alpha', e.target.value);
                 window.dispatchEvent(new Event('storage'));
               }}
               style={{ width: '100%' }}
             />
          </div>

          <div>
             <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '14px', fontWeight: '500' }}>Dwell Click Delay (seconds)</span>
                <span style={{ color: 'var(--accent)', fontWeight: 'bold' }}>{(parseInt(localStorage.getItem('aether_dwell') || '1500') / 1000).toFixed(1)}s</span>
             </div>
             <input 
               type="range" 
               min="800" 
               max="3000" 
               step="100"
               value={parseInt(localStorage.getItem('aether_dwell') || '1500')}
               onChange={(e) => {
                 localStorage.setItem('aether_dwell', e.target.value);
                 window.dispatchEvent(new Event('storage'));
               }}
               style={{ width: '100%' }}
             />
          </div>
      </div>
    </>
  );
};
