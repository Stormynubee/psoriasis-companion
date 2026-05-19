export const BodyMap = () => {
  return (
    <div className="card">
       <div style={{ color: 'var(--text-dim)', fontSize: '12px', marginBottom: '15px', fontWeight: 'bold', letterSpacing: '1px' }}>FLARE-UP BODY MAP</div>
       <div style={{ background: '#2a2a2c', height: '220px', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
          
          <svg viewBox="0 0 100 220" style={{ height: '90%', width: 'auto', opacity: 0.8 }}>
            {/* Minimalist human silhouette */}
            <circle cx="50" cy="25" r="14" fill="var(--border)" /> 
            <path d="M 32 50 Q 50 42 68 50 L 90 100 L 78 105 L 68 65 L 62 115 L 68 210 L 53 210 L 50 120 L 47 210 L 32 210 L 38 115 L 32 65 L 22 105 L 10 100 Z" fill="var(--border)" stroke="#3a3a3c" strokeWidth="2" strokeLinejoin="round" />
            
            {/* Mock interactive flare points */}
            <circle cx="63" cy="85" r="5" fill="var(--error)" opacity="0.8" style={{ filter: 'drop-shadow(0 0 4px var(--error))' }} />
            <circle cx="38" cy="170" r="5" fill="var(--error)" opacity="0.8" style={{ filter: 'drop-shadow(0 0 4px var(--error))' }} />
          </svg>
          
          <div style={{ position: 'absolute', bottom: '10px', backgroundColor: 'rgba(0,0,0,0.6)', padding: '4px 10px', borderRadius: '12px', fontSize: '11px', color: 'var(--text-dim)', backdropFilter: 'blur(4px)' }}>
            Tap body to mark locations
          </div>
       </div>
    </div>
  );
};
