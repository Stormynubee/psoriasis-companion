import { Home, Calendar, Camera, BarChart2, Settings } from 'lucide-react';

export const Navigation = ({ activeTab, setActiveTab }: any) => {
  const tabs = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'history', icon: Calendar, label: 'History' },
    { id: 'log', icon: Camera, label: 'Log' },
    { id: 'trends', icon: BarChart2, label: 'Trends' },
    { id: 'settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <nav style={{
      position: 'fixed', bottom: 0, width: '100%', height: '65px',
      background: '#1a1a1a', display: 'flex', justifyContent: 'space-around',
      alignItems: 'center', borderTop: '1px solid #333', paddingBottom: 'env(safe-area-inset-bottom)'
    }}>
      {tabs.map(tab => (
        <div key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
          color: activeTab === tab.id ? '#4caf50' : '#666',
          display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer'
        }}>
          <tab.icon size={22} />
          <span style={{ fontSize: '10px', marginTop: '4px' }}>{tab.label}</span>
        </div>
      ))}
    </nav>
  );
};
