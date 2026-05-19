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
      position: 'absolute', bottom: 0, left: 0, width: '100%', height: '80px',
      background: 'rgba(28, 28, 30, 0.85)', backdropFilter: 'blur(15px)', WebkitBackdropFilter: 'blur(15px)',
      display: 'flex', justifyContent: 'space-around', alignItems: 'flex-start', paddingTop: '12px',
      borderTop: '1px solid rgba(255,255,255,0.05)', zIndex: 100
    }}>
      {tabs.map(tab => {
        const isActive = activeTab === tab.id;
        return (
          <div key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
            color: isActive ? 'var(--accent)' : '#8e8e93',
            display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer',
            transition: 'color 0.2s', width: '60px'
          }}>
            <tab.icon size={24} strokeWidth={isActive ? 2.5 : 2} />
            <span style={{ fontSize: '10px', marginTop: '6px', fontWeight: isActive ? '600' : '500' }}>{tab.label}</span>
          </div>
        );
      })}
    </nav>
  );
};
