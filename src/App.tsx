import { useState, useEffect, useRef } from 'react';
import './index.css';
import { Navigation } from './components/layout/Navigation';
import { MedChecklist } from './components/dashboard/MedChecklist';
import { BodyMap } from './components/dashboard/BodyMap';
import { useInsights } from './hooks/useInsights';
import { Settings } from './components/settings/Settings';
import { DetailedLog } from './components/log/DetailedLog';
import { History } from './components/history/History';
import { Trends } from './components/trends/Trends';
import { useGestureTracking } from './hooks/useGestureTracking';
import { useDwellClick } from './hooks/useDwellClick';
import { useCard3DTilt } from './hooks/useCard3DTilt';

function App() {
  const [activeTab, setActiveTab] = useState('home');
  const insight = useInsights();

  // Load Aether accessibility configs
  const [aetherActive, setAetherActive] = useState(false);
  const [alpha, setAlpha] = useState(0.35);
  const [dwellTime, setDwellTime] = useState(1500);

  useEffect(() => {
    const active = JSON.parse(localStorage.getItem('aether_active') || 'false');
    const a = parseFloat(localStorage.getItem('aether_alpha') || '0.35');
    const d = parseInt(localStorage.getItem('aether_dwell') || '1500');
    setAetherActive(active);
    setAlpha(a);
    setDwellTime(d);

    // Listen to local settings adjustment events
    const handleStorageChange = () => {
      const activeNew = JSON.parse(localStorage.getItem('aether_active') || 'false');
      const aNew = parseFloat(localStorage.getItem('aether_alpha') || '0.35');
      const dNew = parseInt(localStorage.getItem('aether_dwell') || '1500');
      setAetherActive(activeNew);
      setAlpha(aNew);
      setDwellTime(dNew);
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Hook Instantiations
  const { coords, gesture, fps, trackingStatus, rawLandmarks } = useGestureTracking(aetherActive, alpha);
  const { dwellProgress } = useDwellClick(aetherActive, coords.x, coords.y, dwellTime);

  // Staggered 3D tilting variables with dynamic virtual pointer feedback
  const virtualCoords = { x: coords.x, y: coords.y, active: aetherActive };
  const checklistTilt = useCard3DTilt(8, virtualCoords);
  const bodymapTilt = useCard3DTilt(8, virtualCoords);
  const insightTilt = useCard3DTilt(8, virtualCoords);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Swipe Action Listener for cycling tabs
  useEffect(() => {
    const tabs = ['home', 'history', 'log', 'trends', 'settings'];
    const currIndex = tabs.indexOf(activeTab);
    
    if (gesture === 'swipe_left' && currIndex < tabs.length - 1) {
      setActiveTab(tabs[currIndex + 1]);
    } else if (gesture === 'swipe_right' && currIndex > 0) {
      setActiveTab(tabs[currIndex - 1]);
    }
  }, [gesture]);

  // Draw hand landmarks on a miniature canvas inside HUD
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || rawLandmarks.length === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Abstract neon wireframe parameters
    ctx.strokeStyle = '#ff9500';
    ctx.lineWidth = 1.5;
    ctx.fillStyle = '#ff00ff';

    // Skeletal mapping indices
    const connections = [
      [0, 1], [1, 2], [2, 3], [3, 4],
      [0, 5], [5, 6], [6, 7], [7, 8],
      [5, 9], [9, 10], [10, 11], [11, 12],
      [9, 13], [13, 14], [14, 15], [15, 16],
      [13, 17], [17, 18], [18, 19], [19, 20],
      [0, 17]
    ];

    // Draw connections
    connections.forEach(([start, end]) => {
      const pt1 = rawLandmarks[start];
      const pt2 = rawLandmarks[end];
      if (pt1 && pt2) {
        ctx.beginPath();
        // Mirror coordinates for visual balance
        ctx.moveTo((1 - pt1.x) * canvas.width, pt1.y * canvas.height);
        ctx.lineTo((1 - pt2.x) * canvas.width, pt2.y * canvas.height);
        ctx.stroke();
      }
    });

    // Draw joints
    rawLandmarks.forEach((pt) => {
      ctx.beginPath();
      ctx.arc((1 - pt.x) * canvas.width, pt.y * canvas.height, 2.5, 0, 2 * Math.PI);
      ctx.fill();
    });
  }, [rawLandmarks]);

  const Dashboard = () => (
    <>
      <div style={{ marginBottom: '24px', paddingTop: '10px' }}>
        <h1 style={{ margin: '0 0 5px 0', fontSize: '28px', letterSpacing: '-0.5px' }}>Hello, Storm</h1>
        <div style={{ color: 'var(--text-dim)', fontSize: '15px' }}>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</div>
      </div>
      <div className="card-stagger-1 antigravity-card-container">
        <div 
          ref={checklistTilt.cardRef as any}
          className="antigravity-card"
          onMouseMove={checklistTilt.handleMouseMove}
          onMouseLeave={checklistTilt.handleMouseLeave}
          style={{ transform: checklistTilt.transformStyle, filter: `drop-shadow(${checklistTilt.shadowStyle})` }}
        >
          <MedChecklist />
        </div>
      </div>
      <div className="card-stagger-2 antigravity-card-container">
        <div 
          ref={bodymapTilt.cardRef as any}
          className="antigravity-card"
          onMouseMove={bodymapTilt.handleMouseMove}
          onMouseLeave={bodymapTilt.handleMouseLeave}
          style={{ transform: bodymapTilt.transformStyle, filter: `drop-shadow(${bodymapTilt.shadowStyle})` }}
        >
          <BodyMap />
        </div>
      </div>
      <div className="card-stagger-3 antigravity-card-container">
        <div 
          ref={insightTilt.cardRef as any}
          className="antigravity-card card"
          onMouseMove={insightTilt.handleMouseMove}
          onMouseLeave={insightTilt.handleMouseLeave}
          style={{ 
            transform: insightTilt.transformStyle, 
            filter: `drop-shadow(${insightTilt.shadowStyle})`,
            borderTop: '4px solid var(--accent-blue)', 
            marginBottom: 0 
          }}
        >
          <div style={{ color: 'var(--accent-blue)', fontSize: '13px', marginBottom: '10px', fontWeight: 'bold', letterSpacing: '1px' }}>DAILY INSIGHT</div>
          <p style={{ fontSize: '15px', margin: 0, lineHeight: '1.4' }}>{insight || "Loading insights..."}</p>
        </div>
      </div>
    </>
  );

  return (
    <div style={{ height: '100%', overflowY: 'auto', padding: '20px', paddingBottom: '90px', boxSizing: 'border-box' }}>
      {activeTab === 'home' && <Dashboard />}
      {activeTab === 'history' && <History />}
      {activeTab === 'log' && <DetailedLog setActiveTab={setActiveTab} />}
      {activeTab === 'trends' && <Trends />}
      {activeTab === 'settings' && <Settings />}
      <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Floating Glowing Reticle Cursor */}
      {aetherActive && (
        <div className="aether-pointer" style={{ left: `${coords.x}px`, top: `${coords.y}px` }}>
          <svg className="dwell-ring">
            <circle 
              className="dwell-ring-circle" 
              cx="18" 
              cy="18" 
              r="15" 
              style={{ strokeDashoffset: 100 - dwellProgress }}
            />
          </svg>
        </div>
      )}

      {/* Glassmorphic Side diagnostic HUD Panel */}
      {aetherActive && (
        <div className="aether-hud-panel">
          <div style={{ color: 'var(--accent)', fontWeight: 'bold', marginBottom: '6px', fontSize: '11px', letterSpacing: '1px' }}>AETHER HUD v2.0</div>
          
          <div style={{ marginBottom: '4px' }}>
            CAMERA: <span style={{ 
              color: trackingStatus === 'ACTIVE' ? '#00ffff' :
                     trackingStatus === 'SEARCHING' ? '#ffb300' : '#ff0055',
              fontWeight: 'bold' 
            }}>
              {trackingStatus === 'ACTIVE' && 'ACTIVE'}
              {trackingStatus === 'SEARCHING' && 'SEARCHING...'}
              {trackingStatus === 'PERMISSION_BLOCKED' && 'BLOCKED ⚠️'}
              {trackingStatus === 'NO_WEBCAM' && 'NO CAMERA 🔌'}
              {trackingStatus === 'OFFLINE' && 'OFFLINE'}
            </span>
          </div>

          <div style={{ marginBottom: '4px' }}>FPS: {fps}</div>
          
          <div style={{ marginBottom: '8px' }}>
            GESTURE: <span style={{ color: 'var(--hud-magenta)', fontWeight: 'bold', textTransform: 'uppercase' }}>{gesture}</span>
          </div>

          {/* Skeleton Diagnostic Preview */}
          {trackingStatus === 'ACTIVE' && (
            <div>
              <div style={{ color: 'var(--text-dim)', fontSize: '9px', marginBottom: '4px', letterSpacing: '0.5px' }}>WIRE-LANDMARKS</div>
              <canvas ref={canvasRef} width="150" height="90" className="aether-hud-canvas" />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default App;
