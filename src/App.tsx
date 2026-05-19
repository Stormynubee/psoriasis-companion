import { useState } from 'react';
import './index.css';
import { Navigation } from './components/layout/Navigation';
import { MedChecklist } from './components/dashboard/MedChecklist';
import { BodyMap } from './components/dashboard/BodyMap';
import { useInsights } from './hooks/useInsights';
import { Settings } from './components/settings/Settings';
import { DetailedLog } from './components/log/DetailedLog';
import { History } from './components/history/History';
import { Trends } from './components/trends/Trends';

function App() {
  const [activeTab, setActiveTab] = useState('home');
  const insight = useInsights();

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
    </div>
  );
}

export default App;
