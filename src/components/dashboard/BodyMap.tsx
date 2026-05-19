import { useState } from 'react';

export const BodyMap = () => {
  const [dots, setDots] = useState<{id: number, x: number, y: number}[]>([]);

  const handleSvgClick = (e: React.MouseEvent<SVGSVGElement>) => {
    // Calculate relative coordinates based on the SVG's viewBox (0 0 100 220)
    const svg = e.currentTarget;
    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    
    // Transform screen coordinates to SVG coordinates
    const cursorPt = pt.matrixTransform(svg.getScreenCTM()?.inverse());
    
    setDots([...dots, { id: Date.now(), x: cursorPt.x, y: cursorPt.y }]);
  };

  const removeDot = (e: React.MouseEvent, id: number) => {
    e.stopPropagation(); // Prevent adding a new dot underneath
    setDots(dots.filter(d => d.id !== id));
  };

  return (
    <div className="card">
       <div style={{ color: 'var(--text-dim)', fontSize: '12px', marginBottom: '15px', fontWeight: 'bold', letterSpacing: '1px' }}>FLARE-UP BODY MAP</div>
       <div style={{ background: '#2a2a2c', height: '220px', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
          
          <svg 
            viewBox="0 0 100 220" 
            style={{ height: '90%', width: 'auto', opacity: 0.8, cursor: 'crosshair', touchAction: 'none' }}
            onClick={handleSvgClick}
          >
            {/* Minimalist human silhouette */}
            <circle cx="50" cy="25" r="14" fill="var(--border)" /> 
            <path d="M 32 50 Q 50 42 68 50 L 90 100 L 78 105 L 68 65 L 62 115 L 68 210 L 53 210 L 50 120 L 47 210 L 32 210 L 38 115 L 32 65 L 22 105 L 10 100 Z" fill="var(--border)" stroke="#3a3a3c" strokeWidth="2" strokeLinejoin="round" />
            
            {/* Render interactive dots */}
            {dots.map(dot => (
              <circle 
                key={dot.id}
                cx={dot.x} 
                cy={dot.y} 
                r="6" 
                fill="var(--error)" 
                opacity="0.9" 
                style={{ filter: 'drop-shadow(0 0 4px var(--error))', cursor: 'pointer' }} 
                onClick={(e) => removeDot(e, dot.id)}
              />
            ))}
          </svg>
          
          <div style={{ position: 'absolute', bottom: '10px', backgroundColor: 'rgba(0,0,0,0.6)', padding: '4px 10px', borderRadius: '12px', fontSize: '11px', color: 'var(--text-dim)', backdropFilter: 'blur(4px)', pointerEvents: 'none' }}>
            {dots.length === 0 ? "Tap body to mark locations" : "Tap a red dot to remove it"}
          </div>
       </div>
    </div>
  );
};
