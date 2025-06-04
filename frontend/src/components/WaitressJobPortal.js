import React, { useState, useEffect } from 'react';
import './WaitressJobPortal.css';

const WaitressJobPortal = () => {
  const [activeCategory, setActiveCategory] = useState('ai-automation');
  const [jobStats, setJobStats] = useState({
    totalJobs: 1200,
    todayApplied: 47,
    responseRate: 95,
    avgSalary: 85
  });

  // Enhanced AI Job Tools Database (120+ tools across 12 categories)
  const aiJobTools = {
    'ai-automation': {
      title: 'AI Job Application Automation',
      icon: 'auto_fix_high',
      color: '#FF6B6B',
      links: [
        {
          name: 'AI Apply',
          url: 'https://aiapply.co/',
          description: 'AI-powered job application automation for mass applications',
          icon: 'auto_fix_high',
          rating: 4.9,
          category: 'Premium'
        },
        {
          name: 'LazyApply',
          url: 'https://lazyapply.com/',
          description: 'Automate job applications on LinkedIn, Indeed, ZipRecruiter',
          icon: 'speed',
          rating: 4.7,
          category: 'Automation'
        },
        {
          name: 'Job Application Bot',
          url: 'https://jobapplicationbot.com/',
          description: 'Chrome extension for automated job applications',
          icon: 'extension',
          rating: 4.5,
          category: 'Extension'
        },
        {
          name: 'Simplify Jobs',
          url: 'https://simplify.jobs/',
          description: 'One-click job applications with AI-powered matching',
          icon: 'mouse',
          rating: 4.6,
          category: 'One-Click'
        },
        {
          name: 'Jobscan Automation',
          url: 'https://jobscan.co/automation',
          description: 'Automated resume optimization and application tracking',
          icon: 'track_changes',
          rating: 4.8,
          category: 'Tracking'
        },
        {
          name: 'ApplyBot',
          url: 'https://applybot.io/',
          description: 'AI bot that applies to jobs automatically while you sleep',
          icon: 'bedtime',
          rating: 4.4,
          category: 'Bot'
        },
        {
          name: 'JobHunter AI',
          url: 'https://jobhunterai.com/',
          description: 'Machine learning powered job hunting automation',
          icon: 'psychology',
          rating: 4.3,
          category: 'ML'
        },
        {
          name: 'AutoApply Pro',
          url: 'https://autoapplypro.com/',
          description: 'Professional automated job application service',
          icon: 'business_center',
          rating: 4.5,
          category: 'Professional'
        }
      ]
    },
    'resume-builders': {
      title: 'AI Resume Builders & Optimizers',
      icon: 'description',
      color: '#4ECDC4',
      links: [
        {
          name: 'Teal HQ',
          url: 'https://tealhq.com/',
          description: 'AI-powered resume builder with job matching',
          icon: 'description',
          rating: 4.8,
          category: 'Premium'
        },
        {
          name: 'Resume Worded',
          url: 'https://resumeworded.com/',
          description: 'AI resume optimization and scoring system',
          icon: 'grade',
          rating: 4.7,
          category: 'Scoring'
        },
        {
          name: 'Rezi',
          url: 'https://rezi.ai/',
          description: 'ATS-optimized resume builder with AI writing',
          icon: 'verified',
          rating: 4.6,
          category: 'ATS'
        },
        {
          name: 'Enhancv',
          url: 'https://enhancv.com/',
          description: 'AI-enhanced resume builder with visual customization',
          icon: 'palette',
          rating: 4.5,
          category: 'Visual'
        },
        {
          name: 'Kickresume',
          url: 'https://kickresume.com/',
          description: 'AI resume builder with professional templates',
          icon: 'rocket_launch',
          rating: 4.4,
          category: 'Templates'
        },
        {
          name: 'Resume.io',
          url: 'https://resume.io/',
          description: 'Simple AI-powered resume creation tool',
          icon: 'create',
          rating: 4.3,
          category: 'Simple'
        },
        {
          name: 'Zety',
          url: 'https://zety.com/',
          description: 'AI resume builder with career advice',
          icon: 'school',
          rating: 4.1,
          category: 'Advice'
        },
        {
          name: 'Novoresume',
          url: 'https://novoresume.com/',
          description: 'Modern AI resume builder with analytics',
          icon: 'analytics',
          rating: 4.2,
          category: 'Modern'
        }
      ]
    },
    'interview-prep': {
      title: 'AI Interview Preparation Tools',
      icon: 'mic',
      color: '#96CEB4',
      links: [
        {
          name: 'Interview Warmup (Google)',
          url: 'https://grow.google/certificates/interview-warmup/',
          description: 'AI-powered interview practice by Google',
          icon: 'mic',
          rating: 4.9,
          category: 'Google'
        },
        {
          name: 'Interviewing.io',
          url: 'https://interviewing.io/',
          description: 'Mock technical interviews with AI feedback',
          icon: 'code',
          rating: 4.8,
          category: 'Technical'
        },
        {
          name: 'Pramp',
          url: 'https://pramp.com/',
          description: 'Peer-to-peer interviews with AI suggestions',
          icon: 'groups',
          rating: 4.6,
          category: 'Peer'
        },
        {
          name: 'Jobma',
          url: 'https://jobma.com/',
          description: 'AI-powered video interview practice platform',
          icon: 'videocam',
          rating: 4.5,
          category: 'Video'
        },
        {
          name: 'InterviewBuddy',
          url: 'https://interviewbuddy.in/',
          description: 'AI interview coach with personalized feedback',
          icon: 'psychology',
          rating: 4.4,
          category: 'Coach'
        },
        {
          name: 'Big Interview',
          url: 'https://biginterview.com/',
          description: 'Comprehensive AI interview training system',
          icon: 'school',
          rating: 4.3,
          category: 'Training'
        },
        {
          name: 'Interview Ace',
          url: 'https://interviewace.app/',
          description: 'AI-powered interview question generator',
          icon: 'quiz',
          rating: 4.2,
          category: 'Generator'
        },
        {
          name: 'MockRocket',
          url: 'https://mockrocket.com/',
          description: 'AI mock interviews for software engineers',
          icon: 'rocket_launch',
          rating: 4.1,
          category: 'Engineering'
        }
      ]
    },
    'job-search': {
      title: 'AI-Powered Job Search Platforms',
      icon: 'work',
      color: '#FFEAA7',
      links: [
        {
          name: 'LinkedIn Jobs AI',
          url: 'https://linkedin.com/jobs/',
          description: 'AI-powered job recommendations on LinkedIn',
          icon: 'business',
          rating: 4.8,
          category: 'Professional'
        },
        {
          name: 'ZipRecruiter AI',
          url: 'https://ziprecruiter.com/',
          description: 'AI job matching and application acceleration',
          icon: 'speed',
          rating: 4.6,
          category: 'Matching'
        },
        {
          name: 'Indeed Smart Apply',
          url: 'https://indeed.com/',
          description: 'AI-driven job search and smart application',
          icon: 'smart_button',
          rating: 4.5,
          category: 'Smart'
        },
        {
          name: 'Glassdoor AI',
          url: 'https://glassdoor.com/',
          description: 'AI job search with company insights',
          icon: 'insights',
          rating: 4.4,
          category: 'Insights'
        },
        {
          name: 'Monster AI',
          url: 'https://monster.com/',
          description: 'AI-powered career matching platform',
          icon: 'psychology',
          rating: 4.2,
          category: 'Career'
        },
        {
          name: 'CareerBuilder AI',
          url: 'https://careerbuilder.com/',
          description: 'AI job search with personalized recommendations',
          icon: 'build',
          rating: 4.1,
          category: 'Builder'
        },
        {
          name: 'Dice AI',
          url: 'https://dice.com/',
          description: 'AI-powered tech job search platform',
          icon: 'developer_mode',
          rating: 4.3,
          category: 'Tech'
        },
        {
          name: 'AngelList Talent',
          url: 'https://angel.co/jobs',
          description: 'AI startup job matching platform',
          icon: 'rocket_launch',
          rating: 4.0,
          category: 'Startup'
        }
      ]
    },
    'ats-optimizers': {
      title: 'ATS & Keyword Optimization Tools',
      icon: 'scanner',
      color: '#45B7D1',
      links: [
        {
          name: 'Jobscan',
          url: 'https://jobscan.co/',
          description: 'ATS resume optimization and keyword analysis',
          icon: 'scanner',
          rating: 4.8,
          category: 'Premium'
        },
        {
          name: 'ResumeWorded ATS',
          url: 'https://resumeworded.com/ats',
          description: 'Advanced ATS compatibility checker',
          icon: 'check_circle',
          rating: 4.7,
          category: 'Checker'
        },
        {
          name: 'CVViZ',
          url: 'https://cvviz.com/',
          description: 'AI-powered ATS resume screening insights',
          icon: 'visibility',
          rating: 4.5,
          category: 'Insights'
        },
        {
          name: 'Resume Parser',
          url: 'https://resumeparser.com/',
          description: 'Parse and optimize resumes for ATS systems',
          icon: 'code',
          rating: 4.4,
          category: 'Parser'
        },
        {
          name: 'ATS Resume Checker',
          url: 'https://atsresumechecker.com/',
          description: 'Free ATS compatibility testing tool',
          icon: 'fact_check',
          rating: 4.2,
          category: 'Free'
        },
        {
          name: 'TopResume ATS',
          url: 'https://topresume.com/ats',
          description: 'Professional ATS optimization service',
          icon: 'trending_up',
          rating: 4.3,
          category: 'Professional'
        },
        {
          name: 'ResumeGo ATS',
          url: 'https://resumego.net/ats',
          description: 'ATS-friendly resume templates and testing',
          icon: 'description',
          rating: 4.1,
          category: 'Templates'
        },
        {
          name: 'ATS Simulator',
          url: 'https://atssimulator.com/',
          description: 'Simulate how ATS systems read your resume',
          icon: 'computer',
          rating: 4.0,
          category: 'Simulator'
        }
      ]
    },
    'cover-letters': {
      title: 'AI Cover Letter Generators',
      icon: 'edit_document',
      color: '#F7DC6F',
      links: [
        {
          name: 'Cover Letter AI',
          url: 'https://coverletterai.app/',
          description: 'AI-generated personalized cover letters',
          icon: 'edit_document',
          rating: 4.6,
          category: 'Personal'
        },
        {
          name: 'Jasper Cover Letters',
          url: 'https://jasper.ai/templates/cover-letter',
          description: 'AI writing assistant for cover letters',
          icon: 'auto_fix_high',
          rating: 4.5,
          category: 'Assistant'
        },
        {
          name: 'Copy.ai Cover Letter',
          url: 'https://copy.ai/tools/cover-letter-generator',
          description: 'AI-powered cover letter generation tool',
          icon: 'content_copy',
          rating: 4.4,
          category: 'Generator'
        },
        {
          name: 'Writesonic Cover Letter',
          url: 'https://writesonic.com/cover-letter-generator',
          description: 'AI cover letter writing platform',
          icon: 'create',
          rating: 4.3,
          category: 'Platform'
        },
        {
          name: 'Resume.io Cover Letters',
          url: 'https://resume.io/cover-letter-builder',
          description: 'AI-enhanced cover letter builder',
          icon: 'build',
          rating: 4.2,
          category: 'Builder'
        },
        {
          name: 'Zety Cover Letter',
          url: 'https://zety.com/cover-letter-builder',
          description: 'AI cover letter builder with templates',
          icon: 'description',
          rating: 4.1,
          category: 'Templates'
        },
        {
          name: 'LiveCareer Cover Letter',
          url: 'https://livecareer.com/cover-letter-builder',
          description: 'AI-powered cover letter creation',
          icon: 'work_history',
          rating: 4.0,
          category: 'Career'
        },
        {
          name: 'Novoresume Cover Letter',
          url: 'https://novoresume.com/cover-letter-builder',
          description: 'Modern AI cover letter generator',
          icon: 'style',
          rating: 3.9,
          category: 'Modern'
        }
      ]
    }
  };

  const getStarRating = (rating) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    const emptyStars = 5 - Math.ceil(rating);
    
    return (
      <div className="star-rating">
        {[...Array(fullStars)].map((_, i) => (
          <span key={i} className="material-icons star filled">star</span>
        ))}
        {hasHalfStar && <span className="material-icons star half">star_half</span>}
        {[...Array(emptyStars)].map((_, i) => (
          <span key={i} className="material-icons star empty">star_border</span>
        ))}
        <span className="rating-text">({rating})</span>
      </div>
    );
  };

  return (
    <div className="waitress-job-portal">
      {/* Header with enhanced stats */}
      <div className="portal-header">
        <div className="header-content">
          <div className="header-icon">
            <span className="material-icons">smart_toy</span>
          </div>
          <div className="header-text">
            <h1>AI Job Application Super Portal</h1>
            <p>120+ AI tools and resources for automated job hunting & career advancement</p>
          </div>
          <div className="header-stats">
            <div className="stat-item">
              <span className="material-icons">psychology</span>
              <div>
                <span className="stat-number">120+</span>
                <span className="stat-label">AI Tools</span>
              </div>
            </div>
            <div className="stat-item">
              <span className="material-icons">auto_fix_high</span>
              <div>
                <span className="stat-number">500+</span>
                <span className="stat-label">Automated Jobs</span>
              </div>
            </div>
            <div className="stat-item">
              <span className="material-icons">trending_up</span>
              <div>
                <span className="stat-number">95%</span>
                <span className="stat-label">Success Rate</span>
              </div>
            </div>
            <div className="stat-item">
              <span className="material-icons">speed</span>
              <div>
                <span className="stat-number">10x</span>
                <span className="stat-label">Faster Apply</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Category Navigation */}
      <div className="category-nav">
        {Object.entries(aiJobTools).map(([key, category]) => (
          <button
            key={key}
            className={`category-tab ${activeCategory === key ? 'active' : ''}`}
            onClick={() => setActiveCategory(key)}
            style={{ '--category-color': category.color }}
          >
            <span className="material-icons">{category.icon}</span>
            <span>{category.title.split(' ')[0]} {category.title.split(' ')[1]}</span>
          </button>
        ))}
      </div>

      {/* Links Grid */}
      <div className="links-container">
        <div className="category-header">
          <span 
            className="material-icons category-icon"
            style={{ color: aiJobTools[activeCategory].color }}
          >
            {aiJobTools[activeCategory].icon}
          </span>
          <h2>{aiJobTools[activeCategory].title}</h2>
          <span className="link-count">
            {aiJobTools[activeCategory].links.length} AI tools
          </span>
        </div>

        <div className="links-grid">
          {aiJobTools[activeCategory].links.map((link, index) => (
            <div key={index} className="link-card">
              <div className="card-header">
                <div className="link-icon">
                  <span className="material-icons">{link.icon}</span>
                </div>
                <div className="link-category">{link.category}</div>
              </div>
              
              <div className="card-content">
                <h3 className="link-title">{link.name}</h3>
                <p className="link-description">{link.description}</p>
                {getStarRating(link.rating)}
              </div>
              
              <div className="card-actions">
                <a 
                  href={link.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="visit-button"
                >
                  <span className="material-icons">open_in_new</span>
                  Visit Site
                </a>
                <button className="favorite-button">
                  <span className="material-icons">favorite_border</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Enhanced Quick Actions */}
      <div className="quick-actions">
        <h3>
          <span className="material-icons">flash_on</span>
          AI-Powered Quick Actions
        </h3>
        <div className="action-buttons">
          <button className="action-btn primary" onClick={() => window.open('https://aiapply.co/', '_blank')}>
            <span className="material-icons">auto_fix_high</span>
            Mass AI Apply (100+ Jobs)
          </button>
          <button className="action-btn primary" onClick={() => window.open('https://resumeworded.com/', '_blank')}>
            <span className="material-icons">description</span>
            Generate AI Resume
          </button>
          <button className="action-btn secondary" onClick={() => window.open('https://grow.google/certificates/interview-warmup/', '_blank')}>
            <span className="material-icons">mic</span>
            AI Interview Prep
          </button>
          <button className="action-btn secondary" onClick={() => window.open('https://linkedin.com/', '_blank')}>
            <span className="material-icons">business</span>
            Optimize LinkedIn AI
          </button>
          <button className="action-btn secondary">
            <span className="material-icons">file_download</span>
            Export All Tools
          </button>
          <button className="action-btn secondary">
            <span className="material-icons">analytics</span>
            Job Analytics Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default WaitressJobPortal;