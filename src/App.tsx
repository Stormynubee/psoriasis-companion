import { useState, useEffect } from 'react';
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
  const { coords, gesture, fps, trackingActive } = useGestureTracking(aetherActive, alpha);
  const { dwellProgress } = useDwellClick(aetherActive, coords.x, coords.y, dwellTime);

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

  const Dashboard = () => (
    <>
      <div style={{ marginBottom: '24px', paddingTop: '10px' }}>
        <h1 style={{ margin: '0 0 5px 0', fontSize: '28px', letterSpacing: '-0.5px' }}>Hello, Storm</h1>
        <div style={{ color: 'var(--text-dim)', fontSize: '15px' }}>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</div>
      </div>
      <MedChecklist />
      <BodyMap />
      <div className="card" style={{ borderTop: '4px solid var(--accent-blue)' }}>
        <div style={{ color: 'var(--accent-blue)', fontSize: '13px', marginBottom: '10px', fontWeight: 'bold', letterSpacing: '1px' }}>DAILY INSIGHT</div>
        <p style={{ fontSize: '15px', margin: 0, lineHeight: '1.4' }}>{insight || "Loading insights..."}</p>
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
          <div style={{ marginBottom: '4px' }}>CAMERA: <span style={{ color: trackingActive ? '#00ffff' : '#ff0055', fontWeight: 'bold' }}>{trackingActive ? 'TRACKING' : 'SEARCHING'}</span></div>
          <div style={{ marginBottom: '4px' }}>FPS: {fps}</div>
          <div>GESTURE: <span style={{ color: 'var(--hud-magenta)', fontWeight: 'bold', textTransform: 'uppercase' }}>{gesture}</span></div>
        </div>
      )}
    </div>
  );
}

export default App;
