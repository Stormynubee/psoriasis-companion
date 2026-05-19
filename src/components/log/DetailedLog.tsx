import { useState } from 'react';
import { db } from '../../db/db';
import { Camera, Save, X } from 'lucide-react';

export const DetailedLog = ({ setActiveTab }: any) => {
  const [photo, setPhoto] = useState<string | null>(null);
  const [severity, setSeverity] = useState(5);
  const [itchLevel, setItchLevel] = useState(5);
  const [sleepHours, setSleepHours] = useState(7);
  const [stressLevel, setStressLevel] = useState(2);
  const [note, setNote] = useState('');

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const today = new Date().toISOString().split('T')[0];

    const newFlareUp = {
      locationId: 'general',
      severity,
      itchLevel,
      photoUrl: photo || undefined,
      note
    };

    try {
      const existingLog = await db.logs.where('date').equals(today).first();

      if (existingLog) {
        await db.logs.update(existingLog.id!, {
          flareUps: [...existingLog.flareUps, newFlareUp],
          lifestyle: { sleepHours, stressLevel: stressLevel as 1|2|3, dietNotes: '' }
        });
      } else {
        await db.logs.add({
          date: today,
          medsTaken: [],
          flareUps: [newFlareUp],
          lifestyle: { sleepHours, stressLevel: stressLevel as 1|2|3, dietNotes: '' }
        });
      }
      setActiveTab('home'); 
    } catch (error) {
      console.error("Error saving log:", error);
      alert("Failed to save log.");
    }
  };

  return (
    <>
      <h2 style={{ marginBottom: '20px', marginTop: '10px' }}>Log Flare-Up</h2>
      <form onSubmit={handleSave}>
        <div className="card">
          <div style={{ color: 'var(--text-dim)', fontSize: '12px', fontWeight: 'bold', marginBottom: '15px', letterSpacing: '1px' }}>VISUAL</div>
          {photo ? (
            <div style={{ position: 'relative', marginBottom: '10px' }}>
              <img src={photo} alt="Flare-up" style={{ width: '100%', borderRadius: '12px', maxHeight: '250px', objectFit: 'cover' }} />
              <button 
                type="button" 
                onClick={() => setPhoto(null)} 
                style={{ position: 'absolute', top: 10, right: 10, background: 'rgba(0,0,0,0.7)', color: 'white', border: 'none', borderRadius: '50%', padding: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', backdropFilter: 'blur(4px)' }}
              >
                <X size={18} />
              </button>
            </div>
          ) : (
            <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '140px', background: '#2a2a2c', border: '2px dashed #444', borderRadius: '12px', cursor: 'pointer', transition: 'background 0.2s' }}>
              <Camera size={36} color="var(--text-dim)" style={{ marginBottom: '12px' }} />
              <span style={{ color: 'var(--text-dim)', fontSize: '15px', fontWeight: '500' }}>Tap to take photo</span>
              <input type="file" accept="image/*" capture="environment" onChange={handlePhotoChange} style={{ display: 'none' }} />
            </label>
          )}
        </div>

        <div className="card">
          <div style={{ color: 'var(--text-dim)', fontSize: '12px', fontWeight: 'bold', marginBottom: '20px', letterSpacing: '1px' }}>SYMPTOMS</div>
          
          <div style={{ marginBottom: '25px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
              <span style={{ fontSize: '15px', fontWeight: '500' }}>Severity</span>
              <span style={{ color: 'var(--accent)', fontWeight: 'bold', fontSize: '18px' }}>{severity}</span>
            </div>
            <input type="range" min="1" max="10" value={severity} onChange={e => setSeverity(Number(e.target.value))} style={{ width: '100%' }} />
          </div>

          <div style={{ marginBottom: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
              <span style={{ fontSize: '15px', fontWeight: '500' }}>Itchiness</span>
              <span style={{ color: 'var(--accent)', fontWeight: 'bold', fontSize: '18px' }}>{itchLevel}</span>
            </div>
            <input type="range" min="1" max="10" value={itchLevel} onChange={e => setItchLevel(Number(e.target.value))} style={{ width: '100%' }} />
          </div>
        </div>

        <div className="card">
           <div style={{ color: 'var(--text-dim)', fontSize: '12px', fontWeight: 'bold', marginBottom: '15px', letterSpacing: '1px' }}>LIFESTYLE</div>
           <div style={{ display: 'flex', gap: '15px' }}>
              <div style={{ flex: 1 }}>
                 <label style={{ fontSize: '14px', fontWeight: '500', display: 'block', marginBottom: '8px' }}>Sleep (Hrs)</label>
                 <input type="number" step="0.5" value={sleepHours} onChange={e => setSleepHours(Number(e.target.value))} style={{ width: '100%', boxSizing: 'border-box', padding: '12px', background: '#2a2a2c', border: '1px solid var(--border)', color: 'white', borderRadius: '10px', fontSize: '16px' }} />
              </div>
              <div style={{ flex: 1 }}>
                 <label style={{ fontSize: '14px', fontWeight: '500', display: 'block', marginBottom: '8px' }}>Stress</label>
                 <select value={stressLevel} onChange={e => setStressLevel(Number(e.target.value))} style={{ width: '100%', boxSizing: 'border-box', padding: '12px', background: '#2a2a2c', border: '1px solid var(--border)', color: 'white', borderRadius: '10px', fontSize: '16px', appearance: 'none' }}>
                   <option value={1}>Low</option>
                   <option value={2}>Medium</option>
                   <option value={3}>High</option>
                 </select>
              </div>
           </div>
        </div>

        <div className="card">
          <div style={{ color: 'var(--text-dim)', fontSize: '12px', fontWeight: 'bold', marginBottom: '15px', letterSpacing: '1px' }}>NOTES</div>
          <textarea 
            value={note}
            onChange={e => setNote(e.target.value)}
            placeholder="Any triggers? E.g., ate spicy food, stressed..."
            style={{ width: '100%', boxSizing: 'border-box', padding: '15px', background: '#2a2a2c', border: '1px solid var(--border)', color: 'white', borderRadius: '12px', minHeight: '100px', fontSize: '15px', resize: 'none' }}
          />
        </div>

        <button type="submit" style={{ width: '100%', padding: '16px', background: 'var(--accent-blue)', color: 'white', border: 'none', borderRadius: '14px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', boxShadow: '0 4px 15px rgba(10, 132, 255, 0.4)' }}>
          <Save size={22} /> Save Daily Log
        </button>
      </form>
    </>
  );
};
