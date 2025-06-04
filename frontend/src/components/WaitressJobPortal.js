import React, { useState, useEffect } from 'react';
import './WaitressJobPortal.css';

const WaitressJobPortal = () => {
  const [activeCategory, setActiveCategory] = useState('remote-jobs');
  const [jobStats, setJobStats] = useState({
    totalJobs: 847,
    todayApplied: 23,
    responseRate: 78,
    avgSalary: 28
  });

  // Awesome Links with KDE-style categories and Google Material Icons
  const awesomeLinks = {
    'remote-jobs': {
      title: 'Remote Job Boards',
      icon: 'work',
      color: '#2196F3',
      links: [
        {
          name: 'Remote.co',
          url: 'https://remote.co/',
          description: 'Curated remote job listings from top companies',
          icon: 'business_center',
          rating: 4.8,
          category: 'Premium'
        },
        {
          name: 'We Work Remotely',
          url: 'https://weworkremotely.com/',
          description: 'Largest remote work community with job listings',
          icon: 'groups',
          rating: 4.6,
          category: 'Community'
        },
        {
          name: 'FlexJobs',
          url: 'https://flexjobs.com/',
          description: 'Hand-screened remote and flexible jobs',
          icon: 'verified',
          rating: 4.7,
          category: 'Premium'
        },
        {
          name: 'AngelList Talent',
          url: 'https://angel.co/jobs',
          description: 'Startup jobs and remote opportunities',
          icon: 'rocket_launch',
          rating: 4.5,
          category: 'Startups'
        },
        {
          name: 'Working Nomads',
          url: 'https://workingnomads.co/',
          description: 'Remote jobs for digital nomads',
          icon: 'travel_explore',
          rating: 4.4,
          category: 'Nomad'
        },
        {
          name: 'NoDesk',
          url: 'https://nodesk.co/',
          description: 'Remote work resources and job board',
          icon: 'laptop_mac',
          rating: 4.3,
          category: 'Resources'
        }
      ]
    },
    'ai-tools': {
      title: 'AI Job Application Tools',
      icon: 'smart_toy',
      color: '#FF5722',
      links: [
        {
          name: 'AI Apply',
          url: 'https://aiapply.co/',
          description: 'AI-powered job application automation',
          icon: 'auto_fix_high',
          rating: 4.9,
          category: 'Automation'
        },
        {
          name: 'Resume Worded',
          url: 'https://resumeworded.com/',
          description: 'AI resume optimization and feedback',
          icon: 'description',
          rating: 4.6,
          category: 'Resume'
        },
        {
          name: 'Jobscan',
          url: 'https://jobscan.co/',
          description: 'ATS resume optimization tool',
          icon: 'scanner',
          rating: 4.5,
          category: 'ATS'
        },
        {
          name: 'Cover Letter AI',
          url: 'https://coverletterai.app/',
          description: 'AI-generated cover letters',
          icon: 'edit_document',
          rating: 4.4,
          category: 'Cover Letter'
        },
        {
          name: 'Interview Warmup',
          url: 'https://grow.google/certificates/interview-warmup/',
          description: 'AI-powered interview practice by Google',
          icon: 'mic',
          rating: 4.7,
          category: 'Interview'
        }
      ]
    },
    'freelance': {
      title: 'Freelance Platforms',
      icon: 'person_search',
      color: '#4CAF50',
      links: [
        {
          name: 'Upwork',
          url: 'https://upwork.com/',
          description: 'Global freelancing platform',
          icon: 'language',
          rating: 4.2,
          category: 'Global'
        },
        {
          name: 'Fiverr',
          url: 'https://fiverr.com/',
          description: 'Marketplace for digital services',
          icon: 'store',
          rating: 4.3,
          category: 'Services'
        },
        {
          name: 'Toptal',
          url: 'https://toptal.com/',
          description: 'Top 3% of freelance talent',
          icon: 'military_tech',
          rating: 4.8,
          category: 'Elite'
        },
        {
          name: 'Guru',
          url: 'https://guru.com/',
          description: 'Freelance work marketplace',
          icon: 'school',
          rating: 4.1,
          category: 'Marketplace'
        },
        {
          name: 'PeoplePerHour',
          url: 'https://peopleperhour.com/',
          description: 'Hourly freelance services',
          icon: 'schedule',
          rating: 4.0,
          category: 'Hourly'
        }
      ]
    },
    'hospitality': {
      title: 'Hospitality & Service Jobs',
      icon: 'restaurant',
      color: '#9C27B0',
      links: [
        {
          name: 'Indeed Hospitality',
          url: 'https://indeed.com/jobs?q=hospitality+remote',
          description: 'Remote hospitality job listings',
          icon: 'search',
          rating: 4.5,
          category: 'Search'
        },
        {
          name: 'ZipRecruiter',
          url: 'https://ziprecruiter.com/',
          description: 'AI-powered job matching',
          icon: 'psychology',
          rating: 4.4,
          category: 'AI Matching'
        },
        {
          name: 'Glassdoor',
          url: 'https://glassdoor.com/',
          description: 'Jobs with company reviews',
          icon: 'reviews',
          rating: 4.6,
          category: 'Reviews'
        },
        {
          name: 'LinkedIn Jobs',
          url: 'https://linkedin.com/jobs/',
          description: 'Professional networking jobs',
          icon: 'business',
          rating: 4.7,
          category: 'Professional'
        },
        {
          name: 'SimplyHired',
          url: 'https://simplyhired.com/',
          description: 'Simple job search engine',
          icon: 'manage_search',
          rating: 4.2,
          category: 'Simple'
        }
      ]
    },
    'journey': {
      title: 'Journey & Relocation Planning',
      icon: 'map',
      color: '#FF9800',
      links: [
        {
          name: 'Make My Drive Fun',
          url: 'https://makemydrivefun.com/',
          description: 'Plan exciting stops for your road trip',
          icon: 'route',
          rating: 4.8,
          category: 'Road Trip'
        },
        {
          name: 'Rome2Rio',
          url: 'https://rome2rio.com/',
          description: 'Global trip planning',
          icon: 'flight',
          rating: 4.5,
          category: 'Global'
        },
        {
          name: 'Expatica',
          url: 'https://expatica.com/',
          description: 'Expat living guides',
          icon: 'public',
          rating: 4.3,
          category: 'Expat'
        },
        {
          name: 'Numbeo',
          url: 'https://numbeo.com/',
          description: 'Cost of living database',
          icon: 'attach_money',
          rating: 4.4,
          category: 'Cost Analysis'
        },
        {
          name: 'InterNations',
          url: 'https://internations.org/',
          description: 'Global expat community',
          icon: 'diversity_1',
          rating: 4.6,
          category: 'Community'
        }
      ]
    },
    'resources': {
      title: 'Career Resources & Tools',
      icon: 'school',
      color: '#607D8B',
      links: [
        {
          name: 'Coursera',
          url: 'https://coursera.org/',
          description: 'Online courses from top universities',
          icon: 'menu_book',
          rating: 4.7,
          category: 'Education'
        },
        {
          name: 'Udemy',
          url: 'https://udemy.com/',
          description: 'Skill development courses',
          icon: 'cast_for_education',
          rating: 4.5,
          category: 'Skills'
        },
        {
          name: 'Khan Academy',
          url: 'https://khanacademy.org/',
          description: 'Free online education',
          icon: 'quiz',
          rating: 4.8,
          category: 'Free'
        },
        {
          name: 'Canva',
          url: 'https://canva.com/',
          description: 'Design tool for resumes and portfolios',
          icon: 'palette',
          rating: 4.9,
          category: 'Design'
        },
        {
          name: 'Grammarly',
          url: 'https://grammarly.com/',
          description: 'Writing assistant and proofreader',
          icon: 'spellcheck',
          rating: 4.6,
          category: 'Writing'
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
      {/* Header with Arch-inspired background */}
      <div className="portal-header">
        <div className="header-content">
          <div className="header-icon">
            <span className="material-icons">restaurant_menu</span>
          </div>
          <div className="header-text">
            <h1>Awesome Hospitality Job Portal</h1>
            <p>Curated links and resources for remote hospitality careers</p>
          </div>
          <div className="header-stats">
            <div className="stat-item">
              <span className="material-icons">work</span>
              <div>
                <span className="stat-number">{jobStats.totalJobs}</span>
                <span className="stat-label">Active Jobs</span>
              </div>
            </div>
            <div className="stat-item">
              <span className="material-icons">send</span>
              <div>
                <span className="stat-number">{jobStats.todayApplied}</span>
                <span className="stat-label">Applied Today</span>
              </div>
            </div>
            <div className="stat-item">
              <span className="material-icons">trending_up</span>
              <div>
                <span className="stat-number">{jobStats.responseRate}%</span>
                <span className="stat-label">Response Rate</span>
              </div>
            </div>
            <div className="stat-item">
              <span className="material-icons">payments</span>
              <div>
                <span className="stat-number">${jobStats.avgSalary}K</span>
                <span className="stat-label">Avg Salary</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Category Navigation */}
      <div className="category-nav">
        {Object.entries(awesomeLinks).map(([key, category]) => (
          <button
            key={key}
            className={`category-tab ${activeCategory === key ? 'active' : ''}`}
            onClick={() => setActiveCategory(key)}
            style={{ '--category-color': category.color }}
          >
            <span className="material-icons">{category.icon}</span>
            <span>{category.title}</span>
          </button>
        ))}
      </div>

      {/* Links Grid */}
      <div className="links-container">
        <div className="category-header">
          <span 
            className="material-icons category-icon"
            style={{ color: awesomeLinks[activeCategory].color }}
          >
            {awesomeLinks[activeCategory].icon}
          </span>
          <h2>{awesomeLinks[activeCategory].title}</h2>
          <span className="link-count">
            {awesomeLinks[activeCategory].links.length} resources
          </span>
        </div>

        <div className="links-grid">
          {awesomeLinks[activeCategory].links.map((link, index) => (
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

      {/* Quick Actions */}
      <div className="quick-actions">
        <h3>
          <span className="material-icons">flash_on</span>
          Quick Actions
        </h3>
        <div className="action-buttons">
          <button className="action-btn primary">
            <span className="material-icons">auto_fix_high</span>
            AI Apply to All
          </button>
          <button className="action-btn secondary">
            <span className="material-icons">bookmark_add</span>
            Save Favorites
          </button>
          <button className="action-btn secondary">
            <span className="material-icons">share</span>
            Export Links
          </button>
          <button className="action-btn secondary">
            <span className="material-icons">analytics</span>
            View Analytics
          </button>
        </div>
      </div>
    </div>
  );
};

export default WaitressJobPortal;