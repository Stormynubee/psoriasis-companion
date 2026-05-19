import { useState } from 'react';
import './index.css';
import { Navigation } from './components/layout/Navigation';

function App() {
  const [activeTab, setActiveTab] = useState('home');

  return (
    <div style={{ padding: '20px', paddingBottom: '80px' }}>
      {activeTab === 'home' && <h2>Dashboard</h2>}
      {activeTab === 'history' && <h2>History</h2>}
      {activeTab === 'log' && <h2>Add Log</h2>}
      {activeTab === 'trends' && <h2>Trends</h2>}
      {activeTab === 'settings' && <h2>Settings</h2>}
      <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
}
export default App;
