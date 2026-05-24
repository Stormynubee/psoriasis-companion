import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../db/db';

export const Trends = () => {
  const logs = useLiveQuery(async () => {
    const allLogs = await db.logs.toArray();
    return allLogs.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  });

  const handleAutoSeed = async () => {
    const today = new Date();
    const seedData = [];

    // Generate 5 days of history (starting 5 days ago to yesterday)
    for (let i = 5; i >= 1; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];

      seedData.push({
        date: dateStr,
        medsTaken: [],
        flareUps: [
          {
            locationId: 'general',
            severity: Math.floor(Math.random() * 6) + 3, // random 3-8
            itchLevel: Math.floor(Math.random() * 5) + 4, // random 4-8
            note: 'Generated sample data for trend analysis'
          }
        ],
        lifestyle: {
          sleepHours: Math.floor(Math.random() * 4) + 5, // random 5-8
          stressLevel: (Math.floor(Math.random() * 3) + 1) as 1 | 2 | 3,
          dietNotes: 'Sample diet data'
        }
      });
    }

    try {
      await db.logs.bulkAdd(seedData);
      window.location.reload();
    } catch (err) {
      console.error("Auto seeding logs failed:", err);
    }
  };

  if (!logs) return <p>Loading trends...</p>;

  if (logs.length < 3) {
    return (
      <>
        <h2 style={{ marginBottom: '20px', marginTop: '10px' }}>Trends</h2>
        <div className="card card-stagger-1" style={{ textAlign: 'center', padding: '40px 20px' }}>
          <span style={{ fontSize: '48px', display: 'block', marginBottom: '10px' }}>📊</span>
          <p style={{ color: 'var(--text)', fontSize: '18px', fontWeight: '600' }}>Not enough data yet</p>
          <p style={{ fontSize: '14px', color: 'var(--text-dim)', lineHeight: '1.5', marginBottom: '22px' }}>
            Log your flare-ups and lifestyle for at least 3 days to unlock insights and trends here.
          </p>
          <button
            onClick={handleAutoSeed}
            className="clickable"
            style={{
              background: 'var(--accent-blue)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              padding: '12px 24px',
              fontSize: '14px',
              fontWeight: 'bold',
              cursor: 'pointer',
              boxShadow: '0 4px 15px rgba(10, 132, 255, 0.4)',
              transition: 'transform 0.15s ease'
            }}
          >
            Auto-Seed 5 Days of Test Data
          </button>
        </div>
      </>
    );
  }

  // Simple Analytics Calculations
  const avgSeverity = (logs.reduce((acc, l) => acc + (l.flareUps[0]?.severity || 0), 0) / logs.length).toFixed(1);
  const avgSleep = (logs.reduce((acc, l) => acc + (l.lifestyle?.sleepHours || 0), 0) / logs.length).toFixed(1);

  const goodSleepLogs = logs.filter(l => (l.lifestyle?.sleepHours || 0) > 7);
  const goodSleepSeverity = goodSleepLogs.length > 0
    ? (goodSleepLogs.reduce((acc, l) => acc + (l.flareUps[0]?.severity || 0), 0) / goodSleepLogs.length).toFixed(1)
    : "N/A";

  const badSleepLogs = logs.filter(l => (l.lifestyle?.sleepHours || 0) <= 6);
  const badSleepSeverity = badSleepLogs.length > 0
    ? (badSleepLogs.reduce((acc, l) => acc + (l.flareUps[0]?.severity || 0), 0) / badSleepLogs.length).toFixed(1)
    : "N/A";

  // Chart coordinate calculation setup
  const chartLogs = logs.slice(-7);
  const paddingX = 25;
  const paddingY = 15;
  const chartWidth = 300;
  const chartHeight = 90;

  let pathD = '';
  let areaD = '';

  if (chartLogs.length > 1) {
    chartLogs.forEach((log, i) => {
      const x = paddingX + (i * (chartWidth / (chartLogs.length - 1)));
      const severityVal = log.flareUps[0]?.severity || 0;
      const y = paddingY + chartHeight - ((severityVal - 1) / 9) * chartHeight;

      if (i === 0) {
        pathD = `M ${x} ${y}`;
      } else {
        pathD += ` L ${x} ${y}`;
      }
    });

    const startX = paddingX;
    const endX = paddingX + chartWidth;
    const bottomY = paddingY + chartHeight;
    areaD = `${pathD} L ${endX} ${bottomY} L ${startX} ${bottomY} Z`;
  }

  return (
    <>
      <h2 style={{ marginBottom: '20px', marginTop: '10px' }}>Trends & Analytics</h2>

      <div className="card card-stagger-1">
        <div style={{ color: 'var(--text-dim)', fontSize: '12px', fontWeight: 'bold', marginBottom: '15px', letterSpacing: '1px' }}>OVERALL AVERAGES</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
          <div style={{ background: '#2a2a2c', padding: '20px 10px', borderRadius: '14px', textAlign: 'center' }}>
            <div style={{ fontSize: '28px', fontWeight: 'bold', color: 'var(--error)', marginBottom: '4px' }}>{avgSeverity}</div>
            <div style={{ fontSize: '11px', color: 'var(--text-dim)', fontWeight: '600', letterSpacing: '0.5px' }}>AVG SEVERITY</div>
          </div>
          <div style={{ background: '#2a2a2c', padding: '20px 10px', borderRadius: '14px', textAlign: 'center' }}>
            <div style={{ fontSize: '28px', fontWeight: 'bold', color: 'var(--accent-blue)', marginBottom: '4px' }}>{avgSleep}h</div>
            <div style={{ fontSize: '11px', color: 'var(--text-dim)', fontWeight: '600', letterSpacing: '0.5px' }}>AVG SLEEP</div>
          </div>
        </div>
      </div>

      <div className="card card-stagger-2" style={{ borderTop: '4px solid var(--accent-blue)' }}>
        <div style={{ color: 'var(--accent-blue)', fontSize: '12px', fontWeight: 'bold', marginBottom: '18px', letterSpacing: '1px' }}>THE DATA SCIENTIST</div>

        <div style={{ marginBottom: '20px', background: '#1a1a1c', padding: '15px', borderRadius: '12px' }}>
          <div style={{ fontSize: '14px', marginBottom: '8px', color: 'var(--text-dim)' }}>Flare Severity with <b style={{ color: 'white' }}>Good Sleep (&gt;7h)</b>:</div>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--accent)' }}>{goodSleepSeverity} <span style={{ fontSize: '14px', fontWeight: 'normal', color: 'var(--text-dim)' }}>/ 10</span></div>
        </div>

        <div style={{ background: '#1a1a1c', padding: '15px', borderRadius: '12px' }}>
          <div style={{ fontSize: '14px', marginBottom: '8px', color: 'var(--text-dim)' }}>Flare Severity with <b style={{ color: 'white' }}>Poor Sleep (≤6h)</b>:</div>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--error)' }}>{badSleepSeverity} <span style={{ fontSize: '14px', fontWeight: 'normal', color: 'var(--text-dim)' }}>/ 10</span></div>
        </div>

        <p style={{ fontSize: '12px', color: 'var(--text-dim)', marginTop: '20px', textAlign: 'center' }}>
          Insights become more accurate as you log more days.
        </p>
      </div>

      <div className="card card-stagger-3">
        <div style={{ color: 'var(--text-dim)', fontSize: '12px', fontWeight: 'bold', marginBottom: '15px', letterSpacing: '1px' }}>SEVERITY OVER TIME</div>
        <div style={{ background: '#2a2a2c', height: '170px', borderRadius: '12px', padding: '15px 10px 5px 10px', boxSizing: 'border-box', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg viewBox="0 0 350 140" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
            <defs>
              <linearGradient id="chartGlow" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0a84ff" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#0a84ff" stopOpacity="0" />
              </linearGradient>
            </defs>

            {/* Horizontal Grid lines */}
            <line x1={paddingX} y1={paddingY} x2={paddingX + chartWidth} y2={paddingY} stroke="rgba(255,255,255,0.05)" strokeDasharray="3,3" />
            <line x1={paddingX} y1={paddingY + chartHeight / 2} x2={paddingX + chartWidth} y2={paddingY + chartHeight / 2} stroke="rgba(255,255,255,0.05)" strokeDasharray="3,3" />
            <line x1={paddingX} y1={paddingY + chartHeight} x2={paddingX + chartWidth} y2={paddingY + chartHeight} stroke="rgba(255,255,255,0.1)" />

            {/* Y Axis Numeric Labels */}
            <text x={paddingX - 8} y={paddingY + 3} fill="var(--text-dim)" fontSize="8" textAnchor="end" fontFamily="monospace">10</text>
            <text x={paddingX - 8} y={paddingY + chartHeight / 2 + 3} fill="var(--text-dim)" fontSize="8" textAnchor="end" fontFamily="monospace">5</text>
            <text x={paddingX - 8} y={paddingY + chartHeight + 3} fill="var(--text-dim)" fontSize="8" textAnchor="end" fontFamily="monospace">1</text>

            {/* Area Gradient Overlay */}
            {areaD && <path d={areaD} fill="url(#chartGlow)" />}

            {/* SVG Trend Line */}
            {pathD && (
              <path
                d={pathD}
                fill="none"
                stroke="var(--accent-blue)"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ filter: 'drop-shadow(0 0 4px var(--accent-blue))' }}
              />
            )}

            {/* Joint Nodes */}
            {chartLogs.map((log) => {
              const i = chartLogs.indexOf(log);
              const x = paddingX + (i * (chartWidth / (chartLogs.length - 1)));
              const severityVal = log.flareUps[0]?.severity || 0;
              const y = paddingY + chartHeight - ((severityVal - 1) / 9) * chartHeight;
              return (
                <g key={log.id}>
                  <circle
                    cx={x}
                    cy={y}
                    r="4.5"
                    fill="var(--bg)"
                    stroke="var(--accent-blue)"
                    strokeWidth="2"
                    style={{ filter: 'drop-shadow(0 0 3px rgba(10,132,255,0.6))' }}
                  />
                  <text x={x} y={y - 8} fill="white" fontSize="8" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
                    {severityVal}
                  </text>
                </g>
              );
            })}

            {/* X Axis Dates */}
            {chartLogs.map((log) => {
              const i = chartLogs.indexOf(log);
              const x = paddingX + (i * (chartWidth / (chartLogs.length - 1)));
              const dateParts = log.date.split('-');
              const monthDay = `${dateParts[1]}/${dateParts[2]}`;
              return (
                <text key={log.id} x={x} y={130} fill="var(--text-dim)" fontSize="8" textAnchor="middle" fontFamily="monospace">
                  {monthDay}
                </text>
              );
            })}
          </svg>
        </div>
      </div>
    </>
  );
};
