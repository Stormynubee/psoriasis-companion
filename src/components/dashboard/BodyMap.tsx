export const BodyMap = ({ onSelectArea }: any) => {
  return (
    <div className="card">
       <div style={{ color: 'var(--text-dim)', fontSize: '12px', marginBottom: '10px' }}>FLARE-UP BODY MAP</div>
       <div style={{ background: '#2a2a2a', height: '150px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ color: '#666' }}>[Interactive Body Map SVG]</span>
       </div>
    </div>
  );
};
