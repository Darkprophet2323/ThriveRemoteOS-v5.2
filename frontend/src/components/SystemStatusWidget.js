import React, { useState, useEffect } from 'react';

const SystemStatusWidget = () => {
  const [systemStats, setSystemStats] = useState({
    memory: { used: 4.2, total: 16 },
    battery: 85,
    temperature: 22,
    uptime: '2h 45m',
    processes: 134
  });
  
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
      
      // Simulate system stats changes
      setSystemStats(prev => ({
        ...prev,
        memory: {
          ...prev.memory,
          used: Math.max(3.5, Math.min(6.0, prev.memory.used + (Math.random() - 0.5) * 0.2))
        },
        battery: Math.max(20, Math.min(100, prev.battery + (Math.random() > 0.9 ? -1 : 0))),
        temperature: Math.max(18, Math.min(26, prev.temperature + (Math.random() - 0.5) * 0.5)),
        processes: Math.max(120, Math.min(150, prev.processes + Math.floor((Math.random() - 0.5) * 4)))
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const getBatteryColor = (level) => {
    if (level < 30) return '#FF6B6B';
    if (level < 60) return '#FFEAA7';
    return '#4CAF50';
  };

  const getMemoryUsageColor = (percentage) => {
    if (percentage > 80) return '#FF6B6B';
    if (percentage > 60) return '#FFEAA7';
    return '#4CAF50';
  };

  const memoryPercentage = (systemStats.memory.used / systemStats.memory.total) * 100;

  return (
    <div style={{
      position: 'fixed',
      top: '0',
      left: '0',
      right: '0',
      height: '40px',
      background: 'rgba(0, 0, 0, 0.8)',
      backdropFilter: 'blur(20px)',
      borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 1rem',
      zIndex: 1000,
      fontSize: '0.8rem',
      color: '#ffffff',
      fontFamily: 'Inter, sans-serif'
    }}>
      {/* Left side - System info */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
          <span className="material-icons" style={{ fontSize: '1rem' }}>computer</span>
          <span>ThriveRemoteOS V5.1</span>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
          <span className="material-icons" style={{ fontSize: '1rem' }}>memory</span>
          <span style={{ color: getMemoryUsageColor(memoryPercentage) }}>
            {systemStats.memory.used.toFixed(1)}GB / {systemStats.memory.total}GB
          </span>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
          <span className="material-icons" style={{ fontSize: '1rem' }}>developer_board</span>
          <span>{systemStats.processes} processes</span>
        </div>
      </div>

      {/* Right side - Status indicators */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        {/* Weather */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          background: 'rgba(255, 255, 255, 0.1)',
          padding: '0.2rem 0.5rem',
          borderRadius: '8px'
        }}>
          <span className="material-icons" style={{ fontSize: '1rem', color: '#FFA726' }}>wb_sunny</span>
          <span>{systemStats.temperature}°C</span>
        </div>

        {/* Battery */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
          <div style={{
            width: '20px',
            height: '10px',
            border: '1px solid #ffffff',
            borderRadius: '2px',
            position: 'relative'
          }}>
            <div style={{
              height: '100%',
              width: `${systemStats.battery}%`,
              background: getBatteryColor(systemStats.battery),
              borderRadius: '1px'
            }}></div>
          </div>
          <span>{systemStats.battery}%</span>
        </div>

        {/* WiFi */}
        <div style={{ display: 'flex', gap: '1px', alignItems: 'end' }}>
          <div style={{ width: '3px', height: '4px', background: '#ffffff', borderRadius: '1px' }}></div>
          <div style={{ width: '3px', height: '6px', background: '#ffffff', borderRadius: '1px' }}></div>
          <div style={{ width: '3px', height: '8px', background: '#ffffff', borderRadius: '1px' }}></div>
          <div style={{ width: '3px', height: '10px', background: '#ffffff', borderRadius: '1px' }}></div>
        </div>

        {/* Time and Date */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', fontSize: '0.7rem' }}>
          <div style={{ fontWeight: '600' }}>
            {currentTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
          </div>
          <div style={{ opacity: '0.8' }}>
            {currentTime.toLocaleDateString([], {month: 'short', day: 'numeric'})}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemStatusWidget;