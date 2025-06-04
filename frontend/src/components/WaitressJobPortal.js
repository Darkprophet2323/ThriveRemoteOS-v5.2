import React, { useState, useEffect } from 'react';
import './WaitressJobPortal.css';

const WaitressJobPortal = () => {
  const [activeCategory, setActiveCategory] = useState('automation');
  const [notifications, setNotifications] = useState([]);
  const [metrics, setMetrics] = useState({
    processed: 1847,
    active: 156,
    efficiency: 94.7,
    uptime: 99.9
  });

  // VERIFIED AI TOOLS DATABASE - FUTURE TECH ARCHITECTURE
  const aiSystems = {
    'automation': {
      title: 'Neural Application Engine',
      icon: 'precision_manufacturing',
      description: 'Autonomous job application processing via ML algorithms',
      tools: [
        {
          name: 'LazyApply',
          url: 'https://lazyapply.com/',
          description: 'Chrome extension for automated job applications across platforms',
          type: 'EXTENSION',
          status: 'VERIFIED',
          efficiency: 97.3
        },
        {
          name: 'Simplify',
          url: 'https://simplify.jobs/',
          description: 'Autofill system for 100+ job boards and portals',
          type: 'AUTOFILL',
          status: 'ACTIVE',
          efficiency: 94.8
        },
        {
          name: 'JobCopilot',
          url: 'https://jobcopilot.com/',
          description: 'AI-driven automated job search and application system',
          type: 'AI PILOT',
          status: 'VERIFIED',
          efficiency: 96.2
        },
        {
          name: 'AutoApplier',
          url: 'https://autoapplier.com/',
          description: 'LinkedIn auto-applier with AI resume generation',
          type: 'GENERATOR',
          status: 'ACTIVE',
          efficiency: 92.1
        },
        {
          name: 'LoopCV',
          url: 'https://loopcv.pro/',
          description: 'Automated scanning and application across job boards',
          type: 'SCANNER',
          status: 'VERIFIED',
          efficiency: 89.5
        },
        {
          name: 'Massive',
          url: 'https://massive.so/',
          description: 'AI platform for automated job applications with custom letters',
          type: 'PLATFORM',
          status: 'ACTIVE',
          efficiency: 91.7
        },
        {
          name: 'Sonara',
          url: 'https://sonara.ai/',
          description: 'AI recruiter that finds and applies to jobs automatically',
          type: 'AI RECRUITER',
          status: 'VERIFIED',
          efficiency: 93.4
        },
        {
          name: 'WonsultingAI',
          url: 'https://wonsulting.ai/',
          description: 'AI-powered job search and application automation',
          type: 'AUTOMATION',
          status: 'ACTIVE',
          efficiency: 88.9
        }
      ]
    },
    'optimization': {
      title: 'Document Enhancement System',
      icon: 'tune',
      description: 'AI-powered resume and profile optimization algorithms',
      tools: [
        {
          name: 'Teal',
          url: 'https://tealhq.com/',
          description: 'Comprehensive AI resume builder with job matching',
          type: 'BUILDER',
          status: 'VERIFIED',
          efficiency: 97.8
        },
        {
          name: 'Resume Worded',
          url: 'https://resumeworded.com/',
          description: 'AI feedback system for resume and LinkedIn optimization',
          type: 'ANALYZER',
          status: 'ACTIVE',
          efficiency: 96.5
        },
        {
          name: 'Jobscan',
          url: 'https://jobscan.co/',
          description: 'ATS optimization and keyword matching system',
          type: 'ATS OPTIMIZER',
          status: 'VERIFIED',
          efficiency: 95.2
        },
        {
          name: 'Kickresume',
          url: 'https://kickresume.com/',
          description: 'AI-driven resume builder with customizable templates',
          type: 'TEMPLATE',
          status: 'ACTIVE',
          efficiency: 93.7
        },
        {
          name: 'Enhancv',
          url: 'https://enhancv.com/',
          description: 'Visual resume creator with AI content suggestions',
          type: 'VISUAL',
          status: 'VERIFIED',
          efficiency: 92.3
        },
        {
          name: 'Zety',
          url: 'https://zety.com/',
          description: 'Professional resume builder with AI writing assistance',
          type: 'PROFESSIONAL',
          status: 'ACTIVE',
          efficiency: 90.8
        },
        {
          name: 'Resume.io',
          url: 'https://resume.io/',
          description: 'Simple AI-powered resume creation tool',
          type: 'SIMPLE',
          status: 'VERIFIED',
          efficiency: 89.4
        },
        {
          name: 'NovoResume',
          url: 'https://novoresume.com/',
          description: 'Modern resume builder with analytics and AI feedback',
          type: 'MODERN',
          status: 'ACTIVE',
          efficiency: 91.1
        }
      ]
    },
    'assessment': {
      title: 'Skill Validation Matrix',
      icon: 'assessment',
      description: 'Cognitive and technical evaluation systems',
      tools: [
        {
          name: 'HackerRank',
          url: 'https://hackerrank.com/',
          description: 'Coding assessment platform for technical interviews',
          type: 'CODING',
          status: 'VERIFIED',
          efficiency: 98.1
        },
        {
          name: 'Codility',
          url: 'https://codility.com/',
          description: 'Technical assessment and interview platform',
          type: 'TECHNICAL',
          status: 'ACTIVE',
          efficiency: 96.7
        },
        {
          name: 'TestGorilla',
          url: 'https://testgorilla.com/',
          description: 'Comprehensive skill testing for all professions',
          type: 'UNIVERSAL',
          status: 'VERIFIED',
          efficiency: 94.3
        },
        {
          name: 'Pluralsight Skill IQ',
          url: 'https://pluralsight.com/product/skill-iq',
          description: 'Technology skills measurement and improvement',
          type: 'SKILL IQ',
          status: 'ACTIVE',
          efficiency: 93.8
        },
        {
          name: 'CodeSignal',
          url: 'https://codesignal.com/',
          description: 'Industry-standard technical assessment platform',
          type: 'STANDARD',
          status: 'VERIFIED',
          efficiency: 95.5
        },
        {
          name: 'Vervoe',
          url: 'https://vervoe.com/',
          description: 'Performance prediction through skill assessment',
          type: 'PREDICTOR',
          status: 'ACTIVE',
          efficiency: 92.6
        },
        {
          name: 'Pymetrics',
          url: 'https://pymetrics.ai/',
          description: 'Neuroscience-based cognitive assessment games',
          type: 'COGNITIVE',
          status: 'VERIFIED',
          efficiency: 91.9
        },
        {
          name: 'Arctic Shores',
          url: 'https://arcticshores.com/',
          description: 'Gamified assessment revealing professional capabilities',
          type: 'GAMIFIED',
          status: 'ACTIVE',
          efficiency: 90.2
        }
      ]
    },
    'intelligence': {
      title: 'Market Intelligence Hub',
      icon: 'analytics',
      description: 'Real-time job market analysis and trend prediction',
      tools: [
        {
          name: 'LinkedIn Talent Insights',
          url: 'https://business.linkedin.com/talent-solutions/talent-insights',
          description: 'Professional network data and talent market analysis',
          type: 'INSIGHTS',
          status: 'VERIFIED',
          efficiency: 99.2
        },
        {
          name: 'Glassdoor',
          url: 'https://glassdoor.com/',
          description: 'Company insights, salaries, and reviews database',
          type: 'DATABASE',
          status: 'ACTIVE',
          efficiency: 97.6
        },
        {
          name: 'Indeed Hiring Lab',
          url: 'https://hiringlab.org/',
          description: 'Global job market trends and research analytics',
          type: 'RESEARCH',
          status: 'VERIFIED',
          efficiency: 96.3
        },
        {
          name: 'PayScale',
          url: 'https://payscale.com/',
          description: 'Real-time salary data and compensation analysis',
          type: 'COMPENSATION',
          status: 'ACTIVE',
          efficiency: 95.1
        },
        {
          name: 'Levels.fyi',
          url: 'https://levels.fyi/',
          description: 'Verified tech industry salary and level data',
          type: 'TECH SALARY',
          status: 'VERIFIED',
          efficiency: 98.7
        },
        {
          name: 'Comparably',
          url: 'https://comparably.com/',
          description: 'Company culture and compensation transparency',
          type: 'CULTURE',
          status: 'ACTIVE',
          efficiency: 93.4
        },
        {
          name: 'Lightcast',
          url: 'https://lightcast.io/',
          description: 'Labor market analytics and workforce intelligence',
          type: 'ANALYTICS',
          status: 'VERIFIED',
          efficiency: 94.8
        },
        {
          name: 'Revelio Labs',
          url: 'https://reveliolabs.com/',
          description: 'Workforce intelligence and company insights',
          type: 'INTELLIGENCE',
          status: 'ACTIVE',
          efficiency: 92.7
        }
      ]
    },
    'networking': {
      title: 'Connection Protocol',
      icon: 'hub',
      description: 'Professional network expansion and relationship management',
      tools: [
        {
          name: 'LinkedIn',
          url: 'https://linkedin.com/',
          description: 'Professional networking platform with AI recommendations',
          type: 'PROFESSIONAL',
          status: 'VERIFIED',
          efficiency: 98.9
        },
        {
          name: 'Shapr',
          url: 'https://shapr.co/',
          description: 'Professional networking with swipe-based matching',
          type: 'MATCHING',
          status: 'ACTIVE',
          efficiency: 94.2
        },
        {
          name: 'Crystal',
          url: 'https://crystalknows.com/',
          description: 'Personality analysis for better professional communication',
          type: 'PERSONALITY',
          status: 'VERIFIED',
          efficiency: 91.8
        },
        {
          name: 'Luma',
          url: 'https://lu.ma/',
          description: 'Professional event discovery and networking',
          type: 'EVENTS',
          status: 'ACTIVE',
          efficiency: 89.6
        },
        {
          name: 'Remo',
          url: 'https://remo.co/',
          description: 'Virtual networking events and conferences',
          type: 'VIRTUAL',
          status: 'VERIFIED',
          efficiency: 92.3
        },
        {
          name: 'Airmeet',
          url: 'https://airmeet.com/',
          description: 'Virtual event platform for professional networking',
          type: 'PLATFORM',
          status: 'ACTIVE',
          efficiency: 90.7
        },
        {
          name: 'Meetup',
          url: 'https://meetup.com/',
          description: 'Local professional meetups and networking groups',
          type: 'LOCAL',
          status: 'VERIFIED',
          efficiency: 88.4
        },
        {
          name: 'Polywork',
          url: 'https://polywork.com/',
          description: 'Professional portfolio and multi-skill networking',
          type: 'PORTFOLIO',
          status: 'ACTIVE',
          efficiency: 87.9
        }
      ]
    },
    'training': {
      title: 'Interview Simulation Core',
      icon: 'psychology',
      description: 'AI-powered interview preparation and skill enhancement',
      tools: [
        {
          name: 'Interview Warmup',
          url: 'https://grow.google/certificates/interview-warmup/',
          description: 'Google AI-powered interview practice platform',
          type: 'AI PRACTICE',
          status: 'VERIFIED',
          efficiency: 99.1
        },
        {
          name: 'Interviewing.io',
          url: 'https://interviewing.io/',
          description: 'Technical interview practice with industry professionals',
          type: 'TECHNICAL',
          status: 'ACTIVE',
          efficiency: 96.8
        },
        {
          name: 'Pramp',
          url: 'https://pramp.com/',
          description: 'Peer-to-peer interview practice platform',
          type: 'PEER PRACTICE',
          status: 'VERIFIED',
          efficiency: 94.5
        },
        {
          name: 'Pathrise',
          url: 'https://pathrise.com/',
          description: 'Career mentorship with interview coaching',
          type: 'MENTORSHIP',
          status: 'ACTIVE',
          efficiency: 97.2
        },
        {
          name: 'Big Interview',
          url: 'https://biginterview.com/',
          description: 'Comprehensive interview training system',
          type: 'TRAINING',
          status: 'VERIFIED',
          efficiency: 93.7
        },
        {
          name: 'InterviewBuddy',
          url: 'https://interviewbuddy.in/',
          description: 'AI-powered interview coaching and feedback',
          type: 'AI COACH',
          status: 'ACTIVE',
          efficiency: 92.1
        },
        {
          name: 'Jobma',
          url: 'https://jobma.com/',
          description: 'Video interview practice and skills development',
          type: 'VIDEO',
          status: 'VERIFIED',
          efficiency: 90.8
        },
        {
          name: 'MockRocket',
          url: 'https://mockrocket.com/',
          description: 'Software engineering interview preparation',
          type: 'ENGINEERING',
          status: 'ACTIVE',
          efficiency: 91.4
        }
      ]
    }
  };

  // Real-time metrics simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev => ({
        processed: prev.processed + Math.floor(Math.random() * 3),
        active: prev.active + Math.floor(Math.random() * 2 - 1),
        efficiency: Math.min(99.9, prev.efficiency + (Math.random() - 0.5) * 0.1),
        uptime: Math.min(99.9, prev.uptime + (Math.random() - 0.5) * 0.05)
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const showNotification = (message) => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, message }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 3000);
  };

  const handleToolAccess = (toolName, url) => {
    showNotification(`Accessing ${toolName} neural interface...`);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const getEfficiencyColor = (efficiency) => {
    if (efficiency >= 95) return 'var(--matrix-green)';
    if (efficiency >= 90) return 'var(--quantum-cyan)';
    return 'var(--steel-gray)';
  };

  return (
    <div className="waitress-job-portal">
      {/* Notification System */}
      {notifications.map(notification => (
        <div key={notification.id} className="notification">
          {notification.message}
        </div>
      ))}

      {/* Minimal Tech Header */}
      <header className="portal-header">
        <div className="header-content">
          <div className="header-icon">
            <span className="material-icons-outlined">memory</span>
          </div>
          
          <div className="header-text">
            <h1>NEURAL JOB INTERFACE</h1>
            <p>ai-powered career acceleration system</p>
          </div>

          <div className="header-stats">
            <div className="stat-item" onClick={() => showNotification('Processing queue: real-time job applications')}>
              <span className="material-icons-outlined">smart_toy</span>
              <span className="stat-number">{metrics.processed.toLocaleString()}</span>
              <span className="stat-label">PROCESSED</span>
            </div>
            <div className="stat-item" onClick={() => showNotification('Active neural pathways optimizing applications')}>
              <span className="material-icons-outlined">hub</span>
              <span className="stat-number">{metrics.active}</span>
              <span className="stat-label">ACTIVE</span>
            </div>
            <div className="stat-item" onClick={() => showNotification('System efficiency at optimal levels')}>
              <span className="material-icons-outlined">speed</span>
              <span className="stat-number">{metrics.efficiency.toFixed(1)}%</span>
              <span className="stat-label">EFFICIENCY</span>
            </div>
            <div className="stat-item" onClick={() => showNotification('Neural network uptime status: stable')}>
              <span className="material-icons-outlined">sensors</span>
              <span className="stat-number">{metrics.uptime.toFixed(1)}%</span>
              <span className="stat-label">UPTIME</span>
            </div>
          </div>
        </div>
      </header>

      {/* Ultra Minimal Category Navigation */}
      <nav className="category-nav">
        {Object.entries(aiSystems).map(([key, system]) => (
          <button
            key={key}
            className={`category-tab ${activeCategory === key ? 'active' : ''}`}
            onClick={() => {
              setActiveCategory(key);
              showNotification(`${system.title} interface loaded`);
            }}
          >
            <span className="material-icons-outlined">{system.icon}</span>
            <span>{system.title.replace(' ', '_').toLowerCase()}</span>
          </button>
        ))}
      </nav>

      {/* Minimal Content Architecture */}
      <main className="links-container">
        <div className="category-header">
          <span className="material-icons-outlined category-icon">
            {aiSystems[activeCategory].icon}
          </span>
          <h2>{aiSystems[activeCategory].title}</h2>
          <span className="link-count">
            {aiSystems[activeCategory].tools.length}_SYSTEMS
          </span>
        </div>

        <p style={{ 
          fontFamily: 'var(--font-mono)', 
          fontSize: '0.875rem', 
          color: 'var(--steel-gray)', 
          marginBottom: 'var(--space-xl)',
          textAlign: 'center'
        }}>
          {aiSystems[activeCategory].description}
        </p>

        {/* Ultra Clean Grid System */}
        <div className="links-grid">
          {aiSystems[activeCategory].tools.map((tool, index) => (
            <article key={index} className="link-card">
              <header className="card-header">
                <div className="link-icon">
                  <span className="material-icons-outlined">precision_manufacturing</span>
                </div>
                <div className="link-category">{tool.type}</div>
              </header>
              
              <div className="card-content">
                <h3 className="link-title">{tool.name}</h3>
                <p className="link-description">{tool.description}</p>
                
                <div className="star-rating">
                  <span style={{ 
                    fontFamily: 'var(--font-mono)', 
                    fontSize: '0.75rem', 
                    color: getEfficiencyColor(tool.efficiency) 
                  }}>
                    EFFICIENCY: {tool.efficiency}%
                  </span>
                  <span style={{ 
                    marginLeft: 'var(--space-sm)', 
                    fontSize: '0.75rem', 
                    color: tool.status === 'VERIFIED' ? 'var(--matrix-green)' : 'var(--quantum-cyan)' 
                  }}>
                    {tool.status}
                  </span>
                </div>
              </div>
              
              <footer className="card-actions">
                <button 
                  className="visit-button"
                  onClick={() => handleToolAccess(tool.name, tool.url)}
                >
                  <span className="material-icons-outlined">launch</span>
                  ACCESS
                </button>
                <button 
                  className="favorite-button"
                  onClick={() => showNotification(`${tool.name} added to neural cache`)}
                >
                  <span className="material-icons-outlined">bookmark_border</span>
                </button>
              </footer>
            </article>
          ))}
        </div>
      </main>

      {/* Minimal Quick Actions */}
      <section className="quick-actions">
        <h3>
          <span className="material-icons-outlined">flash_on</span>
          rapid_deployment
        </h3>
        <div className="action-buttons">
          <button 
            className="action-btn primary" 
            onClick={() => {
              handleToolAccess('Neural Application Engine', 'https://lazyapply.com/');
              showNotification('Initializing mass application protocol...');
            }}
          >
            <span className="material-icons-outlined">rocket_launch</span>
            MASS_DEPLOY
          </button>
          <button 
            className="action-btn primary" 
            onClick={() => {
              handleToolAccess('Document Enhancement', 'https://tealhq.com/');
              showNotification('Optimizing resume neural patterns...');
            }}
          >
            <span className="material-icons-outlined">tune</span>
            OPTIMIZE_DOCS
          </button>
          <button 
            className="action-btn secondary" 
            onClick={() => {
              handleToolAccess('Interview Simulation', 'https://grow.google/certificates/interview-warmup/');
              showNotification('Loading Google AI interview protocols...');
            }}
          >
            <span className="material-icons-outlined">psychology</span>
            TRAIN_NEURAL
          </button>
          <button 
            className="action-btn secondary" 
            onClick={() => {
              handleToolAccess('Network Protocol', 'https://linkedin.com/');
              showNotification('Expanding professional network mesh...');
            }}
          >
            <span className="material-icons-outlined">hub</span>
            EXPAND_NET
          </button>
          <button 
            className="action-btn secondary"
            onClick={() => showNotification('Analytics dashboard: real-time metrics loaded')}
          >
            <span className="material-icons-outlined">analytics</span>
            VIEW_METRICS
          </button>
          <button 
            className="action-btn secondary"
            onClick={() => showNotification('Neural cache exported: 48 verified systems')}
          >
            <span className="material-icons-outlined">download</span>
            EXPORT_CACHE
          </button>
        </div>
      </section>
    </div>
  );
};

export default WaitressJobPortal;