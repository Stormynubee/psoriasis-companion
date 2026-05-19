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
      <div style={{ marginBottom: '20px' }}>
        <h2 style={{ margin: '0 0 5px 0' }}>Hello, Storm</h2>
        <div style={{ color: '#888', fontSize: '14px' }}>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</div>
      </div>
      <MedChecklist />
      <BodyMap />
      <div className="card" style={{ borderTop: '3px solid var(--accent-blue)' }}>
        <div style={{ color: 'var(--accent-blue)', fontSize: '12px', marginBottom: '10px', fontWeight: 'bold' }}>INSIGHT</div>
        <p style={{ fontSize: '14px', margin: 0 }}>{insight || "Loading insights..."}</p>
      </div>
    </>
  );

  return (
    <div style={{ padding: '20px', paddingBottom: '80px' }}>
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
