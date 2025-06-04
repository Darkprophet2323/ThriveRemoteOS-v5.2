import { useEffect, useState } from "react";
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import axios from "axios";
import WaitressJobPortal from "./components/WaitressJobPortal";
import KDEMusicPlayer from "./components/KDEMusicPlayer";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Desktop Environment Component
const ThriveRemoteDesktop = () => {
  const [windows, setWindows] = useState([]);
  const [systemStatus, setSystemStatus] = useState(null);
  const [virtualPets, setVirtualPets] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showStartMenu, setShowStartMenu] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSystemData = async () => {
      try {
        const statusResponse = await axios.get(`${API}/database/status`);
        setSystemStatus(statusResponse.data);

        const petsResponse = await axios.get(`${API}/virtual-pets`);
        setVirtualPets(petsResponse.data);

        setLoading(false);
      } catch (error) {
        console.error("Failed to connect to ThriveRemote systems:", error);
        setLoading(false);
      }
    };

    fetchSystemData();

    // Update time every second
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timeInterval);
  }, []);

  const createWindow = (id, title, content, icon = "🖥️", size = { width: 600, height: 400 }) => {
    const newWindow = {
      id,
      title,
      content,
      icon,
      position: { x: 100 + windows.length * 30, y: 100 + windows.length * 30 },
      size,
      isMinimized: false,
      isMaximized: false,
      zIndex: windows.length + 100
    };
    setWindows([...windows, newWindow]);
  };

  const closeWindow = (id) => {
    setWindows(windows.filter(w => w.id !== id));
  };

  const minimizeWindow = (id) => {
    setWindows(windows.map(w => 
      w.id === id ? { ...w, isMinimized: !w.isMinimized } : w
    ));
  };

  const maximizeWindow = (id) => {
    setWindows(windows.map(w => 
      w.id === id ? { 
        ...w, 
        isMaximized: !w.isMaximized,
        previousPosition: w.isMaximized ? w.previousPosition : w.position,
        previousSize: w.isMaximized ? w.previousSize : w.size,
        position: w.isMaximized ? (w.previousPosition || w.position) : { x: 0, y: 0 },
        size: w.isMaximized ? (w.previousSize || w.size) : { width: window.innerWidth, height: window.innerHeight - 60 }
      } : w
    ));
  };

  const bringToFront = (id) => {
    const maxZ = Math.max(...windows.map(w => w.zIndex));
    setWindows(windows.map(w => 
      w.id === id ? { ...w, zIndex: maxZ + 1 } : w
    ));
  };

  if (loading) {
    return (
      <div className="boot-screen">
        <div className="boot-logo">🚀</div>
        <div className="boot-text">ThriveRemoteOS V5.0</div>
        <div className="boot-subtitle">Initializing Quantum Desktop Environment...</div>
        <div className="boot-progress">
          <div className="boot-progress-bar"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="desktop-environment">
      {/* KDE Music Player Integration */}
      <KDEMusicPlayer />

      {/* Desktop Background */}
      <div className="desktop-wallpaper"></div>

      {/* Enhanced Desktop Icons with Music Player */}
      <div className="desktop-icons">
        <div className="desktop-icon" onClick={() => createWindow('jobs', 'AI Job Portal', <WaitressJobPortal />, '🤖')}>
          <div className="icon material-icons-outlined">smart_toy</div>
          <div className="label">AI Jobs</div>
        </div>
        <div className="desktop-icon" onClick={() => createWindow('music', 'Music Player', <div style={{padding: '20px', textAlign: 'center'}}><h3>🎵 KDE Music Player</h3><p>Integrated in taskbar below</p></div>, '🎵')}>
          <div className="icon material-icons-outlined">library_music</div>
          <div className="label">Music</div>
        </div>
        <div className="desktop-icon" onClick={() => createWindow('pets', 'Virtual Pets', <VirtualPetsManager virtualPets={virtualPets} />, '🐾')}>
          <div className="icon material-icons-outlined">pets</div>
          <div className="label">Pets</div>
        </div>
        <div className="desktop-icon" onClick={() => createWindow('files', 'File Manager', <div style={{padding: '20px'}}><h3>📁 KDE File Manager</h3><p>Navigate your system files</p></div>, '📁')}>
          <div className="icon material-icons-outlined">folder</div>
          <div className="label">Files</div>
        </div>
        <div className="desktop-icon" onClick={() => createWindow('terminal', 'Terminal', <QuantumTerminal />, '💻', { width: 800, height: 500 })}>
          <div className="icon material-icons-outlined">terminal</div>
          <div className="label">Terminal</div>
        </div>
        <div className="desktop-icon" onClick={() => createWindow('settings', 'Settings', <SystemSettings />, '⚙️')}>
          <div className="icon material-icons-outlined">settings</div>
          <div className="label">Settings</div>
        </div>
        <div className="desktop-icon" onClick={() => createWindow('calculator', 'Calculator', <div style={{padding: '20px'}}><h3>🧮 KDE Calculator</h3><p>Perform calculations</p></div>, '🧮')}>
          <div className="icon material-icons-outlined">calculate</div>
          <div className="label">Calculator</div>
        </div>
        <div className="desktop-icon" onClick={() => createWindow('editor', 'Text Editor', <div style={{padding: '20px'}}><h3>📝 KDE Text Editor</h3><p>Edit documents and code</p></div>, '📝')}>
          <div className="icon material-icons-outlined">edit_note</div>
          <div className="label">Editor</div>
        </div>
      </div>

      {/* Windows */}
      {windows.map(window => (
        <Window
          key={window.id}
          window={window}
          onClose={() => closeWindow(window.id)}
          onMinimize={() => minimizeWindow(window.id)}
          onMaximize={() => maximizeWindow(window.id)}
          onBringToFront={() => bringToFront(window.id)}
          onMove={(newPosition) => {
            setWindows(windows.map(w => 
              w.id === window.id ? { ...w, position: newPosition } : w
            ));
          }}
          onResize={(newSize) => {
            setWindows(windows.map(w => 
              w.id === window.id ? { ...w, size: newSize } : w
            ));
          }}
        />
      ))}

      {/* Taskbar */}
      <div className="taskbar">
        <div className="start-menu-container">
          <button 
            className="start-button"
            onClick={() => setShowStartMenu(!showStartMenu)}
          >
            <span className="start-icon">🚀</span>
            <span className="start-text">ThriveOS</span>
          </button>
          
          {showStartMenu && (
            <div className="start-menu">
              <div className="start-menu-header">
                <div className="start-menu-title">ThriveRemoteOS V5.0</div>
                <div className="start-menu-subtitle">Quantum Desktop</div>
              </div>
              
              <div className="start-menu-section">
                <div className="section-title">📊 System</div>
                <div className="menu-item" onClick={() => { createWindow('database', 'Database Manager', <DatabaseManager systemStatus={systemStatus} />, '🗄️'); setShowStartMenu(false); }}>
                  <span className="menu-icon">🗄️</span>Database Manager
                </div>
                <div className="menu-item" onClick={() => { createWindow('settings', 'System Settings', <SystemSettings />, '⚙️'); setShowStartMenu(false); }}>
                  <span className="menu-icon">⚙️</span>System Settings
                </div>
                <div className="menu-item" onClick={() => { createWindow('terminal', 'Quantum Terminal', <QuantumTerminal />, '💻'); setShowStartMenu(false); }}>
                  <span className="menu-icon">💻</span>Quantum Terminal
                </div>
              </div>
              
              <div className="start-menu-section">
                <div className="section-title">🎮 Applications</div>
                <div className="menu-item" onClick={() => { createWindow('pets', 'Virtual Pets', <VirtualPetsManager virtualPets={virtualPets} />, '🎮'); setShowStartMenu(false); }}>
                  <span className="menu-icon">🎮</span>Virtual Pets Manager
                </div>
                <div className="menu-item" onClick={() => { createWindow('desktop-pets', 'Desktop Pets', <DesktopPetsLauncher />, '🐾'); setShowStartMenu(false); }}>
                  <span className="menu-icon">🐾</span>Desktop Pets
                </div>
                <div className="menu-item" onClick={() => { createWindow('content', 'Content Manager', <ContentManager />, '📁'); setShowStartMenu(false); }}>
                  <span className="menu-icon">📁</span>Content Manager
                </div>
                <div className="menu-item" onClick={() => { createWindow('jobs', 'Job Portal', <JobPortal />, '💼'); setShowStartMenu(false); }}>
                  <span className="menu-icon">💼</span>Job Portal
                </div>
                <div className="menu-item" onClick={() => { createWindow('job-portal', 'Waitress Jobs', <JobPortalLauncher />, '🍽️'); setShowStartMenu(false); }}>
                  <span className="menu-icon">🍽️</span>Waitress Jobs Portal
                </div>
              </div>
              
              <div className="start-menu-section">
                <div className="section-title">🔧 Tools & Games</div>
                <div className="menu-item" onClick={() => window.open('/virtual-pets-tool/', '_blank')}>
                  <span className="menu-icon">🥚</span>Cosmic Pets Game
                </div>
                <div className="menu-item" onClick={() => window.open('/virtual-sheep-pet/', '_blank')}>
                  <span className="menu-icon">🐑</span>Cosmic Sheep Game
                </div>
                <div className="menu-item" onClick={() => window.open('/virtual-desktop-pets/', '_blank')}>
                  <span className="menu-icon">🐾</span>Desktop Pets Game
                </div>
                <div className="menu-item" onClick={() => window.open('/waitress-job-portal/', '_blank')}>
                  <span className="menu-icon">🍽️</span>Job Hunting Portal
                </div>
                <div className="menu-item" onClick={() => window.open('https://aiapply.co/', '_blank')}>
                  <span className="menu-icon">🤖</span>AI Apply Tool
                </div>
                <div className="menu-item" onClick={() => window.open('https://makemydrivefun.com/', '_blank')}>
                  <span className="menu-icon">🚗</span>Journey Planner
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="taskbar-windows">
          {windows.map(window => (
            <div 
              key={window.id}
              className={`taskbar-window ${window.isMinimized ? 'minimized' : ''}`}
              onClick={() => minimizeWindow(window.id)}
            >
              <span className="taskbar-icon">{window.icon}</span>
              <span className="taskbar-title">{window.title}</span>
            </div>
          ))}
        </div>

        <div className="system-tray">
          <div className="tray-item">
            <span className="tray-icon">🔋</span>
            <span className="tray-text">98%</span>
          </div>
          <div className="tray-item">
            <span className="tray-icon">📶</span>
          </div>
          <div className="clock">
            <div className="time">{currentTime.toLocaleTimeString()}</div>
            <div className="date">{currentTime.toLocaleDateString()}</div>
          </div>
        </div>
      </div>

      {/* Click outside to close start menu */}
      {showStartMenu && (
        <div className="start-menu-overlay" onClick={() => setShowStartMenu(false)}></div>
      )}
    </div>
  );
};

// Window Component with enhanced functionality
const Window = ({ window, onClose, onMinimize, onMaximize, onBringToFront, onMove, onResize }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 });

  const handleMouseDown = (e) => {
    if (e.target.classList.contains('window-title') || e.target.classList.contains('window-header')) {
      if (!window.isMaximized) {
        setIsDragging(true);
        setDragOffset({
          x: e.clientX - window.position.x,
          y: e.clientY - window.position.y
        });
        onBringToFront();
      }
    }
  };

  const handleResizeMouseDown = (e) => {
    e.stopPropagation();
    if (!window.isMaximized) {
      setIsResizing(true);
      setResizeStart({
        x: e.clientX,
        y: e.clientY,
        width: window.size.width,
        height: window.size.height
      });
      onBringToFront();
    }
  };

  const handleMouseMove = (e) => {
    if (isDragging && !window.isMaximized) {
      const newX = e.clientX - dragOffset.x;
      const newY = e.clientY - dragOffset.y;
      
      // Keep window within screen bounds
      const maxX = window.innerWidth - window.size.width;
      const maxY = window.innerHeight - window.size.height - 60; // Account for taskbar
      
      onMove({
        x: Math.max(0, Math.min(newX, maxX)),
        y: Math.max(0, Math.min(newY, maxY))
      });
    } else if (isResizing && !window.isMaximized) {
      const deltaX = e.clientX - resizeStart.x;
      const deltaY = e.clientY - resizeStart.y;
      
      const newWidth = Math.max(300, resizeStart.width + deltaX);
      const newHeight = Math.max(200, resizeStart.height + deltaY);
      
      // Keep within screen bounds
      const maxWidth = window.innerWidth - window.position.x;
      const maxHeight = window.innerHeight - window.position.y - 60;
      
      onResize({
        width: Math.min(newWidth, maxWidth),
        height: Math.min(newHeight, maxHeight)
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setIsResizing(false);
  };

  const handleDoubleClick = (e) => {
    if (e.target.classList.contains('window-title') || e.target.classList.contains('window-header')) {
      onMaximize();
    }
  };

  useEffect(() => {
    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, isResizing, dragOffset, resizeStart, window.isMaximized, window.size, window.position]);

  if (window.isMinimized) {
    return null;
  }

  return (
    <div
      className={`window ${window.isMaximized ? 'maximized' : ''}`}
      style={{
        left: window.position.x,
        top: window.position.y,
        width: window.size.width,
        height: window.size.height,
        zIndex: window.zIndex
      }}
      onClick={onBringToFront}
    >
      <div 
        className="window-header" 
        onMouseDown={handleMouseDown}
        onDoubleClick={handleDoubleClick}
      >
        <div className="window-title">
          <span className="window-icon">{window.icon}</span>
          {window.title}
        </div>
        <div className="window-controls">
          <button className="window-control minimize" onClick={(e) => { e.stopPropagation(); onMinimize(); }}>
            −
          </button>
          <button className="window-control maximize" onClick={(e) => { e.stopPropagation(); onMaximize(); }}>
            {window.isMaximized ? '❐' : '□'}
          </button>
          <button className="window-control close" onClick={(e) => { e.stopPropagation(); onClose(); }}>
            ×
          </button>
        </div>
      </div>
      <div className="window-content">
        <div className="window-content-inner">
          {window.content}
        </div>
      </div>
      {!window.isMaximized && (
        <div 
          className="window-resize-handle"
          onMouseDown={handleResizeMouseDown}
        />
      )}
    </div>
  );
};

// Window Content Components
const DatabaseManager = ({ systemStatus }) => (
  <div className="app-content">
    <h3>🗄️ Database Manager</h3>
    {systemStatus ? (
      <div className="status-grid">
        <div className="status-card">
          <h4>Connection Status</h4>
          <p className="success">✅ {systemStatus.status}</p>
        </div>
        <div className="status-card">
          <h4>Database Type</h4>
          <p>{systemStatus.database_type}</p>
        </div>
        <div className="status-card">
          <h4>Total Records</h4>
          <p className="highlight">{systemStatus.total_records}</p>
        </div>
        <div className="status-card">
          <h4>Migration Status</h4>
          <p className="success">✅ {systemStatus.migration_status}</p>
        </div>
      </div>
    ) : (
      <p>Loading database information...</p>
    )}
    <div className="action-buttons">
      <button className="btn-primary" onClick={() => window.open(`${BACKEND_URL}/api/database/status`, '_blank')}>
        📊 View Full Status
      </button>
      <button className="btn-secondary" onClick={() => window.open(`${BACKEND_URL}/api/admin/backup`, '_blank')}>
        💾 Download Backup
      </button>
    </div>
  </div>
);

const ContentManager = () => {
  const [relocationContent, setRelocationContent] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchRelocationContent = async () => {
      try {
        const response = await axios.get(`${API}/content/relocation-arizona-peak`);
        setRelocationContent(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch relocation content:", error);
        setLoading(false);
      }
    };
    
    fetchRelocationContent();
  }, []);
  
  if (loading) {
    return (
      <div className="app-content">
        <h3>📁 Content Manager</h3>
        <p>Loading Arizona to Peak District relocation content...</p>
      </div>
    );
  }
  
  return (
    <div className="app-content">
      <h3>📁 Arizona → Peak District Content Manager</h3>
      {relocationContent && (
        <div className="relocation-content">
          <div className="content-summary">
            <h4>🎯 Relocation Focus: {relocationContent.relocation_focus}</h4>
            <p>Total Items: {relocationContent.total_items}</p>
          </div>
          
          <div className="content-categories">
            <div className="category-section">
              <h4>📋 Relocation Guides ({relocationContent.categories?.guides || '0 items'})</h4>
              <div className="content-links">
                <button className="portal-btn" onClick={() => window.open(`${BACKEND_URL}/api/content/relocation-arizona-peak`, '_blank')}>
                  📖 View All Guides
                </button>
              </div>
            </div>
            
            <div className="category-section">
              <h4>💼 UK Remote Jobs ({relocationContent.categories?.uk_jobs || '0 items'})</h4>
              <div className="content-links">
                <button className="portal-btn" onClick={() => window.open(`${BACKEND_URL}/api/content/job-resources`, '_blank')}>
                  💼 Browse UK Jobs
                </button>
                <button className="portal-btn" onClick={() => window.open('https://aiapply.co/', '_blank')}>
                  🤖 AI Apply Tool
                </button>
              </div>
            </div>
            
            <div className="category-section">
              <h4>🏔️ Peak District Activities ({relocationContent.categories?.peak_activities || '0 items'})</h4>
              <div className="content-links">
                <button className="portal-btn" onClick={() => window.open(`${BACKEND_URL}/api/content/peak-district`, '_blank')}>
                  🏔️ Peak District Guide
                </button>
              </div>
            </div>
            
            <div className="category-section">
              <h4>🛠️ Integration Tools ({relocationContent.categories?.integration_tools || '0 items'})</h4>
              <div className="content-links">
                <button className="portal-btn" onClick={() => window.open(`${BACKEND_URL}/api/content/waitress`, '_blank')}>
                  🛠️ Integration Resources
                </button>
              </div>
            </div>
            
            <div className="category-section">
              <h4>🚗 Journey Planning ({relocationContent.categories?.transport_planning || '0 items'})</h4>
              <div className="content-links">
                <button className="portal-btn" onClick={() => window.open('https://makemydrivefun.com/', '_blank')}>
                  🚗 Plan Your Journey
                </button>
                <button className="portal-btn" onClick={() => window.open(`${BACKEND_URL}/api/content/journey`, '_blank')}>
                  📍 Transport Resources
                </button>
              </div>
            </div>
          </div>
          
          <div className="external-resources">
            <h4>🌐 Key External Resources</h4>
            <div className="external-links">
              <a href="https://aiapply.co/" target="_blank" rel="noopener noreferrer" className="portal-btn">
                🤖 AI Apply - Automated UK Job Applications
              </a>
              <a href="https://makemydrivefun.com/" target="_blank" rel="noopener noreferrer" className="portal-btn">
                🚗 Make My Drive Fun - Journey Planning
              </a>
              <a href="https://jobs.gov.uk/" target="_blank" rel="noopener noreferrer" className="portal-btn">
                🏛️ UK Government Jobs
              </a>
              <a href="https://nhs.uk/careers/" target="_blank" rel="noopener noreferrer" className="portal-btn">
                🏥 NHS Careers
              </a>
              <a href="https://peakdistrict.gov.uk/" target="_blank" rel="noopener noreferrer" className="portal-btn">
                🏔️ Peak District Official Site
              </a>
            </div>
          </div>
          
          <div className="quick-actions">
            <h4>⚡ Quick Actions</h4>
            <div className="action-buttons">
              <button className="btn-primary" onClick={() => window.open(`${BACKEND_URL}/api/admin/populate-relocation-content`, '_blank')}>
                📥 Populate Database
              </button>
              <button className="btn-secondary" onClick={() => window.open(`${BACKEND_URL}/api/content/all`, '_blank')}>
                📊 All Content API
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const VirtualPetsManager = ({ virtualPets }) => (
  <div className="app-content">
    <h3>🎮 Virtual Pet Manager</h3>
    {virtualPets && (
      <div className="pets-grid">
        {Object.entries(virtualPets.pets).map(([key, pet]) => (
          <div key={key} className="pet-card">
            <div className="pet-icon">{pet.description.includes('hatching') ? '🥚' : '🐑'}</div>
            <h4>{pet.description.split(' ')[2]}</h4>
            <p>{pet.description}</p>
            <div className="pet-features">
              {pet.features.slice(0, 3).map((feature, index) => (
                <span key={index} className="feature-tag">{feature}</span>
              ))}
            </div>
            <button className="btn-primary" onClick={() => window.open(pet.url, '_blank')}>
              🎮 Play Now
            </button>
          </div>
        ))}
      </div>
    )}
  </div>
);

const JobPortal = () => (
  <div className="app-content">
    <h3>💼 Job Portal</h3>
    <div className="job-actions">
      <button className="btn-primary" onClick={() => window.open(`${BACKEND_URL}/api/jobs/live`, '_blank')}>
        📋 View Live Jobs
      </button>
      <button className="btn-secondary" onClick={() => window.open(`${BACKEND_URL}/api/jobs/refresh`, '_blank')}>
        🔄 Refresh Jobs
      </button>
    </div>
    <div className="job-info">
      <p>Access real-time remote job listings and application tracking.</p>
      <ul>
        <li>✅ Live job feeds from multiple sources</li>
        <li>✅ Application status tracking</li>
        <li>✅ Curated remote positions</li>
        <li>✅ Phoenix to Peak District relocations</li>
      </ul>
    </div>
  </div>
);

const SystemSettings = () => (
  <div className="app-content">
    <h3>⚙️ System Settings</h3>
    <div className="settings-sections">
      <div className="setting-group">
        <h4>🎨 Appearance</h4>
        <div className="setting-item">
          <label>Theme: </label>
          <select>
            <option>Cosmic Dark</option>
            <option>Plasma Blue</option>
            <option>Quantum Purple</option>
          </select>
        </div>
      </div>
      <div className="setting-group">
        <h4>🔧 System</h4>
        <div className="setting-item">
          <label>Auto-refresh jobs: </label>
          <input type="checkbox" defaultChecked />
        </div>
        <div className="setting-item">
          <label>Enable notifications: </label>
          <input type="checkbox" defaultChecked />
        </div>
      </div>
    </div>
  </div>
);

const DesktopPetsLauncher = () => (
  <div className="app-content">
    <h3>🐾 Advanced Desktop Pets</h3>
    <div className="pets-info">
      <p>Launch the advanced desktop pets with AI behavior and autonomous actions.</p>
      <div className="pet-features-grid">
        <div className="feature-item">
          <h4>🤖 AI Behavior</h4>
          <p>Pets make autonomous decisions based on their needs and personality</p>
        </div>
        <div className="feature-item">
          <h4>🎮 Interactive</h4>
          <p>Click to interact, drag to move, watch them roam freely</p>
        </div>
        <div className="feature-item">
          <h4>🍖 Feeding System</h4>
          <p>Spawn food and watch pets seek it out automatically</p>
        </div>
        <div className="feature-item">
          <h4>🎭 Personality</h4>
          <p>Each pet has unique behaviors and speech bubbles</p>
        </div>
      </div>
      <div className="pet-types">
        <h4>Available Pet Types:</h4>
        <div className="pet-type-grid">
          <span>🐱 Cat</span>
          <span>🐶 Dog</span>
          <span>🐰 Rabbit</span>
          <span>🐻 Bear</span>
          <span>🦊 Fox</span>
          <span>🐼 Panda</span>
          <span>🐸 Frog</span>
          <span>🐧 Penguin</span>
        </div>
      </div>
    </div>
    <div className="action-buttons">
      <button className="btn-primary" onClick={() => window.open('/virtual-desktop-pets/', '_blank')}>
        🚀 Launch Desktop Pets
      </button>
      <button className="btn-secondary" onClick={() => window.open(`${BACKEND_URL}/api/desktop-pets/status`, '_blank')}>
        📊 View Pet Status API
      </button>
    </div>
  </div>
);

const JobPortalLauncher = () => (
  <div className="app-content">
    <WaitressJobPortal />
  </div>
);

const QuantumTerminal = () => {
  const [commandHistory, setCommandHistory] = useState(['Welcome to ThriveRemoteOS Quantum Terminal v5.0']);
  const [currentCommand, setCurrentCommand] = useState('');

  const executeCommand = (cmd) => {
    const command = cmd.trim().toLowerCase();
    let output = '';

    switch (command) {
      case 'help':
        output = 'Available commands: help, status, jobs, pets, desktop-pets, waitress-jobs, clear, version, ls, pwd';
        break;
      case 'status':
        output = 'System Status: MySQL Connected | 67+ Records | All Services Online | 3 Pet Games Active';
        break;
      case 'jobs':
        output = 'Fetching live job listings... Use "waitress-jobs" for specialized opportunities.';
        break;
      case 'pets':
        output = 'Virtual Pets: 🥚 Cosmic Pets | 🐑 Cosmic Sheep | 🐾 Desktop Pets | Status: Active';
        break;
      case 'desktop-pets':
        output = 'Desktop Pets: AI-powered virtual companions with autonomous behavior. Launch from desktop.';
        break;
      case 'waitress-jobs':
        output = 'Waitress Jobs Portal: 500+ remote positions | $18-35/hr | AI Apply integration available.';
        break;
      case 'clear':
        setCommandHistory(['Welcome to ThriveRemoteOS Quantum Terminal v5.0']);
        return;
      case 'version':
        output = 'ThriveRemoteOS v5.0 - Enhanced Desktop Edition | MySQL Backend | 3 Pet Systems';
        break;
      case 'ls':
        output = 'Database/  Content/  VirtualPets/  DesktopPets/  WaitressJobs/  Jobs/  Settings/  Terminal/';
        break;
      case 'pwd':
        output = '/home/thrive/quantum-workspace/enhanced-v5';
        break;
      default:
        output = `Command not found: ${command}. Type "help" for available commands.`;
    }

    setCommandHistory([...commandHistory, `$ ${cmd}`, output]);
    setCurrentCommand('');
  };

  return (
    <div className="terminal">
      <div className="terminal-header">
        <span>💻 Quantum Terminal - ThriveRemoteOS v5.0 Enhanced</span>
      </div>
      <div className="terminal-content">
        {commandHistory.map((line, index) => (
          <div key={index} className={line.startsWith('$') ? 'command-line' : 'output-line'}>
            {line}
          </div>
        ))}
        <div className="input-line">
          <span className="prompt">$ </span>
          <input
            type="text"
            value={currentCommand}
            onChange={(e) => setCurrentCommand(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                executeCommand(currentCommand);
              }
            }}
            autoFocus
            className="terminal-input"
          />
        </div>
      </div>
    </div>
  );
};

// Virtual Pets Redirect Component
const VirtualPetsRedirect = () => {
  useEffect(() => {
    // Create a new window/tab for the pet game
    const petWindow = window.open('/virtual-pets-tool/', '_blank');
    if (petWindow) {
      // Close the current tab if the pet game opens successfully
      window.close();
    } else {
      // Fallback: redirect in same window if popup blocked
      window.location.href = '/virtual-pets-tool/';
    }
  }, []);

  return (
    <div className="redirect-loading">
      <h2>🥚 Loading Cosmic Pets...</h2>
      <p>Opening pet hatching game in new window...</p>
      <p><a href="/virtual-pets-tool/" target="_blank" rel="noopener noreferrer">Click here if game doesn't open</a></p>
    </div>
  );
};

// Virtual Sheep Redirect Component
const VirtualSheepRedirect = () => {
  useEffect(() => {
    // Create a new window/tab for the sheep game
    const sheepWindow = window.open('/virtual-sheep-pet/', '_blank');
    if (sheepWindow) {
      // Close the current tab if the sheep game opens successfully
      window.close();
    } else {
      // Fallback: redirect in same window if popup blocked
      window.location.href = '/virtual-sheep-pet/';
    }
  }, []);

  return (
    <div className="redirect-loading">
      <h2>🐑 Loading Cosmic Sheep...</h2>
      <p>Opening sheep feeding game in new window...</p>
      <p><a href="/virtual-sheep-pet/" target="_blank" rel="noopener noreferrer">Click here if game doesn't open</a></p>
    </div>
  );
};

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<ThriveRemoteDesktop />} />
          <Route path="/waitress-job-portal" element={<WaitressJobPortal />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;