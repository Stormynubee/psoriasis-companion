import { useState } from 'react';
import { db } from '../../db/db';
import { Camera, Save } from 'lucide-react';

export const DetailedLog = ({ setActiveTab }: any) => {
  const [photo, setPhoto] = useState<string | null>(null);
  const [severity, setSeverity] = useState(5);
  const [itchLevel, setItchLevel] = useState(5);
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
      locationId: 'general', // Default for now until full body map integration
      severity,
      itchLevel,
      photoUrl: photo || undefined,
      note
    };

    try {
      const existingLog = await db.logs.where('date').equals(today).first();

      if (existingLog) {
        await db.logs.update(existingLog.id!, {
          flareUps: [...existingLog.flareUps, newFlareUp]
        });
      } else {
        await db.logs.add({
          date: today,
          medsTaken: [],
          flareUps: [newFlareUp],
          lifestyle: { sleepHours: 0, stressLevel: 1, dietNotes: '' }
        });
      }
      setActiveTab('home'); // Redirect back to home after saving
    } catch (error) {
      console.error("Error saving log:", error);
      alert("Failed to save log.");
    }
  };

  return (
    <>
      <h2 style={{ marginBottom: '20px', marginTop: 0 }}>Log Flare-Up</h2>
      <form onSubmit={handleSave} className="card">
        
        <div style={{ marginBottom: '20px' }}>
          <div style={{ color: 'var(--text-dim)', fontSize: '12px', fontWeight: 'bold', marginBottom: '10px' }}>PHOTO</div>
          {photo ? (
            <div style={{ position: 'relative', marginBottom: '10px' }}>
              <img src={photo} alt="Flare-up" style={{ width: '100%', borderRadius: '8px', maxHeight: '200px', objectFit: 'cover' }} />
              <button 
                type="button" 
                onClick={() => setPhoto(null)} 
                style={{ position: 'absolute', top: 5, right: 5, background: 'rgba(0,0,0,0.6)', color: 'white', border: 'none', borderRadius: '50%', padding: '5px', width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
              >
                X
              </button>
            </div>
          ) : (
            <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '120px', background: '#2a2a2a', border: '2px dashed #444', borderRadius: '8px', cursor: 'pointer' }}>
              <Camera size={32} color="#888" style={{ marginBottom: '10px' }} />
              <span style={{ color: '#888', fontSize: '14px' }}>Tap to take photo</span>
              {/* capture="environment" encourages mobile devices to use the back camera */}
              <input type="file" accept="image/*" capture="environment" onChange={handlePhotoChange} style={{ display: 'none' }} />
            </label>
          )}
        </div>

        <div style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
            <span style={{ color: 'var(--text-dim)', fontSize: '12px', fontWeight: 'bold' }}>SEVERITY (1-10)</span>
            <span style={{ color: 'var(--accent)', fontWeight: 'bold' }}>{severity}</span>
          </div>
          <input type="range" min="1" max="10" value={severity} onChange={e => setSeverity(Number(e.target.value))} style={{ width: '100%', accentColor: 'var(--accent)' }} />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
            <span style={{ color: 'var(--text-dim)', fontSize: '12px', fontWeight: 'bold' }}>ITCHINESS (1-10)</span>
            <span style={{ color: 'var(--accent)', fontWeight: 'bold' }}>{itchLevel}</span>
          </div>
          <input type="range" min="1" max="10" value={itchLevel} onChange={e => setItchLevel(Number(e.target.value))} style={{ width: '100%', accentColor: 'var(--accent)' }} />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <div style={{ color: 'var(--text-dim)', fontSize: '12px', fontWeight: 'bold', marginBottom: '10px' }}>NOTES</div>
          <textarea 
            value={note}
            onChange={e => setNote(e.target.value)}
            placeholder="Any triggers? E.g., ate spicy food, stressed..."
            style={{ width: '100%', boxSizing: 'border-box', padding: '10px', background: '#1a1a1a', border: '1px solid #444', color: 'white', borderRadius: '4px', minHeight: '80px', fontFamily: 'inherit' }}
          />
        </div>

        <button type="submit" style={{ width: '100%', padding: '12px', background: 'var(--accent-blue)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
          <Save size={20} /> Save Log
        </button>
      </form>
    </>
  );
};
