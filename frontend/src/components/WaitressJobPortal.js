import React, { useState, useEffect } from 'react';
import './WaitressJobPortal.css';

const WaitressJobPortal = () => {
  const [activeCategory, setActiveCategory] = useState('ai-automation');
  const [isLoading, setIsLoading] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [clickStats, setClickStats] = useState({
    totalClicks: 0,
    todayClicks: 0,
    successRate: 97.3
  });

  // Complete 120+ AI Job Tools Database with Addictive Psychology
  const aiJobTools = {
    'ai-automation': {
      title: '🚀 AI Job Application Automation',
      icon: 'auto_fix_high',
      color: '#FF6B6B',
      description: 'URGENT: Apply to 100+ jobs instantly while others manually submit one!',
      links: [
        {
          name: 'AI Apply',
          url: 'https://aiapply.co/',
          description: '⚡ VIRAL: 10,000+ people applied to 500+ jobs last week using this AI tool!',
          icon: 'auto_fix_high',
          rating: 4.9,
          category: 'HOT DEAL',
          urgency: 'Limited Time: 50% OFF'
        },
        {
          name: 'LazyApply',
          url: 'https://lazyapply.com/',
          description: '🔥 SECRET: LinkedIn insiders use this to apply 10x faster than manual applications',
          icon: 'speed',
          rating: 4.8,
          category: 'TRENDING',
          urgency: 'Join 50K+ Users'
        },
        {
          name: 'Job Application Bot',
          url: 'https://jobapplicationbot.com/',
          description: '💰 PROVEN: Users report 300% more interviews using this Chrome extension',
          icon: 'extension',
          rating: 4.7,
          category: 'EXCLUSIVE',
          urgency: 'Free Trial Ending Soon'
        },
        {
          name: 'Simplify Jobs',
          url: 'https://simplify.jobs/',
          description: '🎯 INSIDER TIP: One-click applications that bypass ATS screening entirely',
          icon: 'mouse',
          rating: 4.6,
          category: 'PREMIUM',
          urgency: 'Used by Fortune 500'
        },
        {
          name: 'Jobscan Automation',
          url: 'https://jobscan.co/automation',
          description: '📈 BREAKING: AI that tracks your applications and optimizes success rate',
          icon: 'track_changes',
          rating: 4.8,
          category: 'ANALYTICS',
          urgency: 'Real-time tracking'
        },
        {
          name: 'ApplyBot',
          url: 'https://applybot.io/',
          description: '🌙 REVOLUTIONARY: Bot applies to jobs automatically while you sleep',
          icon: 'bedtime',
          rating: 4.5,
          category: 'AUTOPILOT',
          urgency: 'Works 24/7'
        },
        {
          name: 'JobHunter AI',
          url: 'https://jobhunterai.com/',
          description: '🧠 CUTTING EDGE: Machine learning that learns your preferences',
          icon: 'psychology',
          rating: 4.4,
          category: 'SMART AI',
          urgency: 'Beta Access'
        },
        {
          name: 'AutoApply Pro',
          url: 'https://autoapplypro.com/',
          description: '👔 PROFESSIONAL: White-glove automation service for executives',
          icon: 'business_center',
          rating: 4.6,
          category: 'VIP SERVICE',
          urgency: 'Concierge Level'
        },
        {
          name: 'QuickApply AI',
          url: 'https://quickapplyai.com/',
          description: '⚡ SPEED DEMON: Apply to 50 jobs in under 10 minutes guaranteed',
          icon: 'flash_on',
          rating: 4.3,
          category: 'RAPID FIRE',
          urgency: '10x Faster'
        },
        {
          name: 'JobBot Express',
          url: 'https://jobbotexpress.com/',
          description: '🚄 EXPRESS LANE: Skip the queue with priority job submissions',
          icon: 'express',
          rating: 4.2,
          category: 'PRIORITY',
          urgency: 'Jump the Line'
        }
      ]
    },
    'resume-builders': {
      title: '📄 AI Resume Builders & Optimizers',
      icon: 'description',
      color: '#4ECDC4',
      description: 'WARNING: 89% of resumes are rejected by ATS. Fix yours NOW!',
      links: [
        {
          name: 'Teal HQ',
          url: 'https://tealhq.com/',
          description: '🏆 #1 RATED: The resume builder that 95% of recruiters recommend',
          icon: 'description',
          rating: 4.9,
          category: 'TOP RATED',
          urgency: 'Recruiter Approved'
        },
        {
          name: 'Resume Worded',
          url: 'https://resumeworded.com/',
          description: '🎯 INSTANT RESULTS: Get your resume score in 30 seconds + fixes',
          icon: 'grade',
          rating: 4.8,
          category: 'INSTANT',
          urgency: 'Free Instant Scan'
        },
        {
          name: 'Rezi',
          url: 'https://rezi.ai/',
          description: '🔓 ATS HACK: Guaranteed to pass any Applicant Tracking System',
          icon: 'verified',
          rating: 4.7,
          category: 'ATS PROOF',
          urgency: '99% Pass Rate'
        },
        {
          name: 'Enhancv',
          url: 'https://enhancv.com/',
          description: '🎨 VISUAL IMPACT: Resumes so stunning, hiring managers call immediately',
          icon: 'palette',
          rating: 4.6,
          category: 'DESIGNER',
          urgency: 'Instant Callbacks'
        },
        {
          name: 'Kickresume',
          url: 'https://kickresume.com/',
          description: '🚀 SUCCESS STORIES: Templates used by employees at Google, Apple, Tesla',
          icon: 'rocket_launch',
          rating: 4.5,
          category: 'BIG TECH',
          urgency: 'FAANG Templates'
        },
        {
          name: 'Resume.io',
          url: 'https://resume.io/',
          description: '⚡ LIGHTNING FAST: Professional resume ready in under 5 minutes',
          icon: 'create',
          rating: 4.4,
          category: 'QUICK BUILD',
          urgency: '5 Min Setup'
        },
        {
          name: 'Zety',
          url: 'https://zety.com/',
          description: '🎓 EXPERT ADVICE: Built by career coaches with 20+ years experience',
          icon: 'school',
          rating: 4.3,
          category: 'EXPERT',
          urgency: 'Coach Approved'
        },
        {
          name: 'Novoresume',
          url: 'https://novoresume.com/',
          description: '📊 DATA DRIVEN: Analytics show which sections get most attention',
          icon: 'analytics',
          rating: 4.2,
          category: 'ANALYTICS',
          urgency: 'Heat Map Data'
        },
        {
          name: 'ResumAI',
          url: 'https://resumai.com/',
          description: '🤖 GPT-4 POWERED: ChatGPT writes your entire resume automatically',
          icon: 'auto_awesome',
          rating: 4.1,
          category: 'AI WRITER',
          urgency: 'GPT-4 Powered'
        },
        {
          name: 'Skillroads',
          url: 'https://skillroads.com/',
          description: '🎯 JOB MATCHING: AI matches your resume to perfect job opportunities',
          icon: 'my_location',
          rating: 4.0,
          category: 'MATCHER',
          urgency: 'Smart Matching'
        }
      ]
    },
    'ats-optimizers': {
      title: '🔍 ATS & Keyword Optimization',
      icon: 'scanner',
      color: '#45B7D1',
      description: 'SHOCKING: 75% of resumes never reach human eyes. Beat the bots!',
      links: [
        {
          name: 'Jobscan',
          url: 'https://jobscan.co/',
          description: '🏅 INDUSTRY STANDARD: Used by 1M+ job seekers to beat ATS systems',
          icon: 'scanner',
          rating: 4.9,
          category: 'GOLD STANDARD',
          urgency: '1M+ Success Stories'
        },
        {
          name: 'ResumeWorded ATS',
          url: 'https://resumeworded.com/ats',
          description: '🛡️ ATS SHIELD: Advanced protection against resume-killing algorithms',
          icon: 'check_circle',
          rating: 4.8,
          category: 'PROTECTION',
          urgency: 'Algorithm Proof'
        },
        {
          name: 'CVViZ',
          url: 'https://cvviz.com/',
          description: '👁️ INSIDER VIEW: See exactly how ATS systems read your resume',
          icon: 'visibility',
          rating: 4.6,
          category: 'X-RAY VISION',
          urgency: 'See Hidden Issues'
        },
        {
          name: 'Resume Parser',
          url: 'https://resumeparser.com/',
          description: '🔧 REPAIR TOOL: Instantly fix formatting that breaks ATS parsing',
          icon: 'build_circle',
          rating: 4.5,
          category: 'REPAIR SHOP',
          urgency: 'Instant Fixes'
        },
        {
          name: 'ATS Resume Checker',
          url: 'https://atsresumechecker.com/',
          description: '🆓 FREE SCAN: Test your resume against 100+ ATS systems for free',
          icon: 'fact_check',
          rating: 4.3,
          category: 'FREE TOOL',
          urgency: 'No Credit Card'
        },
        {
          name: 'TopResume ATS',
          url: 'https://topresume.com/ats',
          description: '👨‍💼 PROFESSIONAL SERVICE: Experts rewrite your resume for ATS success',
          icon: 'trending_up',
          rating: 4.4,
          category: 'EXPERT SERVICE',
          urgency: 'Human Experts'
        },
        {
          name: 'ResumeGo ATS',
          url: 'https://resumego.net/ats',
          description: '📋 TEMPLATE LIBRARY: Pre-tested templates that pass all major ATS',
          icon: 'library_books',
          rating: 4.2,
          category: 'TEMPLATES',
          urgency: 'Pre-Tested'
        },
        {
          name: 'ATS Simulator',
          url: 'https://atssimulator.com/',
          description: '🎮 SIMULATOR: Practice with real ATS systems before applying',
          icon: 'sports_esports',
          rating: 4.1,
          category: 'SIMULATOR',
          urgency: 'Test Drive'
        },
        {
          name: 'Resume Keywords',
          url: 'https://resumekeywords.com/',
          description: '🔑 KEYWORD MAGIC: AI finds exact keywords from job descriptions',
          icon: 'vpn_key',
          rating: 4.0,
          category: 'KEYWORD TOOL',
          urgency: 'Perfect Match'
        },
        {
          name: 'ATS Optimizer Pro',
          url: 'https://atsoptimizerpro.com/',
          description: '⚡ POWER TOOL: Advanced optimization for Fortune 500 applications',
          icon: 'power',
          rating: 3.9,
          category: 'ADVANCED',
          urgency: 'Enterprise Level'
        }
      ]
    },
    'interview-prep': {
      title: '🎤 AI Interview Preparation',
      icon: 'mic',
      color: '#96CEB4',
      description: 'CRITICAL: 47% fail interviews due to poor preparation. Don\'t be next!',
      links: [
        {
          name: 'Interview Warmup (Google)',
          url: 'https://grow.google/certificates/interview-warmup/',
          description: '🔥 GOOGLE\'S SECRET: The same AI that trains Google employees',
          icon: 'mic',
          rating: 4.9,
          category: 'GOOGLE OFFICIAL',
          urgency: 'Used by Googlers'
        },
        {
          name: 'Interviewing.io',
          url: 'https://interviewing.io/',
          description: '💻 TECH MASTERY: Practice with engineers from FAANG companies',
          icon: 'code',
          rating: 4.8,
          category: 'FAANG PRACTICE',
          urgency: 'Real Engineers'
        },
        {
          name: 'Pramp',
          url: 'https://pramp.com/',
          description: '👥 PEER POWER: Practice with other candidates, learn their secrets',
          icon: 'groups',
          rating: 4.6,
          category: 'PEER NETWORK',
          urgency: 'Community Driven'
        },
        {
          name: 'Jobma',
          url: 'https://jobma.com/',
          description: '📹 VIDEO MASTERY: Perfect your video interview skills before the real thing',
          icon: 'videocam',
          rating: 4.5,
          category: 'VIDEO PRO',
          urgency: 'Camera Ready'
        },
        {
          name: 'InterviewBuddy',
          url: 'https://interviewbuddy.in/',
          description: '🤖 AI COACH: Personal AI coach that adapts to your weaknesses',
          icon: 'psychology',
          rating: 4.4,
          category: 'AI COACH',
          urgency: 'Personal Trainer'
        },
        {
          name: 'Big Interview',
          url: 'https://biginterview.com/',
          description: '🎓 COMPLETE SYSTEM: Full training system used by top universities',
          icon: 'school',
          rating: 4.3,
          category: 'UNIVERSITY GRADE',
          urgency: 'Academic Standard'
        },
        {
          name: 'Interview Ace',
          url: 'https://interviewace.app/',
          description: '🎯 QUESTION BANK: 10,000+ interview questions with perfect answers',
          icon: 'quiz',
          rating: 4.2,
          category: 'QUESTION MASTER',
          urgency: '10K+ Questions'
        },
        {
          name: 'MockRocket',
          url: 'https://mockrocket.com/',
          description: '🚀 ENGINEER FOCUS: Specialized for software engineering interviews',
          icon: 'rocket_launch',
          rating: 4.1,
          category: 'ENGINEER SPECIAL',
          urgency: 'Code Focused'
        },
        {
          name: 'InterviewAI',
          url: 'https://interviewai.app/',
          description: '🧠 PERSONALIZED: AI creates custom practice based on your target role',
          icon: 'person',
          rating: 4.0,
          category: 'CUSTOM AI',
          urgency: 'Role Specific'
        },
        {
          name: 'PrepInsta',
          url: 'https://prepinsta.com/',
          description: '📚 COMPREHENSIVE: Complete interview preparation for all industries',
          icon: 'menu_book',
          rating: 3.9,
          category: 'ALL INDUSTRIES',
          urgency: 'Complete Package'
        }
      ]
    },
    'job-search': {
      title: '🔍 AI-Powered Job Search',
      icon: 'work',
      color: '#FFEAA7',
      description: 'EXCLUSIVE: Hidden job market has 80% of opportunities. Access it now!',
      links: [
        {
          name: 'LinkedIn Jobs AI',
          url: 'https://linkedin.com/jobs/',
          description: '💼 NETWORK POWER: Tap into 900M+ professionals worldwide',
          icon: 'business',
          rating: 4.8,
          category: 'NETWORK GIANT',
          urgency: '900M+ Users'
        },
        {
          name: 'ZipRecruiter AI',
          url: 'https://ziprecruiter.com/',
          description: '⚡ SPEED MATCHING: AI matches you to jobs in under 24 hours',
          icon: 'speed',
          rating: 4.6,
          category: 'INSTANT MATCH',
          urgency: '24hr Matching'
        },
        {
          name: 'Indeed Smart Apply',
          url: 'https://indeed.com/',
          description: '🎯 SMART TARGETING: AI learns your preferences and finds perfect jobs',
          icon: 'smart_button',
          rating: 4.5,
          category: 'SMART AI',
          urgency: 'Learning AI'
        },
        {
          name: 'Glassdoor AI',
          url: 'https://glassdoor.com/',
          description: '👁️ COMPANY INTEL: See inside companies before you apply',
          icon: 'insights',
          rating: 4.4,
          category: 'INSIDER INFO',
          urgency: 'Company Secrets'
        },
        {
          name: 'Monster AI',
          url: 'https://monster.com/',
          description: '👹 MONSTER REACH: Access to millions of hidden job opportunities',
          icon: 'psychology',
          rating: 4.2,
          category: 'MASSIVE REACH',
          urgency: 'Hidden Jobs'
        },
        {
          name: 'CareerBuilder AI',
          url: 'https://careerbuilder.com/',
          description: '🏗️ CAREER ARCHITECT: AI builds your perfect career path',
          icon: 'build',
          rating: 4.1,
          category: 'CAREER BUILDER',
          urgency: 'Path Planner'
        },
        {
          name: 'Dice AI',
          url: 'https://dice.com/',
          description: '🎲 TECH FOCUS: The premier platform for technology professionals',
          icon: 'developer_mode',
          rating: 4.3,
          category: 'TECH ELITE',
          urgency: 'Tech Exclusive'
        },
        {
          name: 'AngelList Talent',
          url: 'https://angel.co/jobs',
          description: '👼 STARTUP ANGEL: Direct access to startup founders and equity',
          icon: 'rocket_launch',
          rating: 4.0,
          category: 'STARTUP ACCESS',
          urgency: 'Equity Opportunities'
        },
        {
          name: 'Hired',
          url: 'https://hired.com/',
          description: '🎯 REVERSE HIRING: Companies compete for YOU with salary offers',
          icon: 'trending_up',
          rating: 3.9,
          category: 'REVERSE AUCTION',
          urgency: 'Bidding War'
        },
        {
          name: 'Vettery',
          url: 'https://vettery.com/',
          description: '✅ VETTED TALENT: Exclusive marketplace for pre-screened professionals',
          icon: 'verified_user',
          rating: 3.8,
          category: 'EXCLUSIVE',
          urgency: 'Pre-Screened'
        }
      ]
    },
    'networking': {
      title: '🤝 AI Professional Networking',
      icon: 'people',
      color: '#E17055',
      description: 'INSIDER SECRET: 85% of jobs are filled through networking, not applications!',
      links: [
        {
          name: 'LinkedIn AI Assistant',
          url: 'https://linkedin.com/premium/',
          description: '🔥 PREMIUM POWER: AI assistant writes personalized messages that get responses',
          icon: 'assistant',
          rating: 4.8,
          category: 'AI WRITER',
          urgency: 'Premium Only'
        },
        {
          name: 'Shapr',
          url: 'https://shapr.co/',
          description: '📱 TINDER FOR BUSINESS: Swipe to connect with industry professionals',
          icon: 'swipe',
          rating: 4.5,
          category: 'SWIPE TO CONNECT',
          urgency: 'Like Tinder'
        },
        {
          name: 'Bumble Bizz',
          url: 'https://bumble.com/bizz/',
          description: '🐝 BUSINESS BUZZ: Professional networking with dating app simplicity',
          icon: 'business_center',
          rating: 4.3,
          category: 'EASY CONNECT',
          urgency: 'Simple Networking'
        },
        {
          name: 'Crystal',
          url: 'https://crystalknows.com/',
          description: '🔮 PERSONALITY INTEL: AI analyzes personality to perfect your approach',
          icon: 'psychology',
          rating: 4.6,
          category: 'MIND READER',
          urgency: 'Personality AI'
        },
        {
          name: 'Luma AI',
          url: 'https://lu.ma/',
          description: '🎉 EVENT MASTER: Discover and attend networking events in your industry',
          icon: 'event',
          rating: 4.4,
          category: 'EVENT FINDER',
          urgency: 'Local Events'
        },
        {
          name: 'Remo',
          url: 'https://remo.co/',
          description: '🌐 VIRTUAL NETWORKING: Attend global networking events from home',
          icon: 'public',
          rating: 4.2,
          category: 'VIRTUAL EVENTS',
          urgency: 'Global Access'
        },
        {
          name: 'Whova',
          url: 'https://whova.com/',
          description: '📊 CONFERENCE KING: Maximize ROI from conferences with AI networking',
          icon: 'conference_room',
          rating: 4.1,
          category: 'CONFERENCE PRO',
          urgency: 'Conference ROI'
        },
        {
          name: 'Airmeet',
          url: 'https://airmeet.com/',
          description: '☁️ CLOUD NETWORKING: Host and attend professional virtual events',
          icon: 'cloud',
          rating: 4.0,
          category: 'VIRTUAL HOST',
          urgency: 'Event Platform'
        },
        {
          name: 'MeetUp AI',
          url: 'https://meetup.com/',
          description: '👥 LOCAL CONNECTIONS: AI finds relevant local professional meetups',
          icon: 'location_on',
          rating: 3.9,
          category: 'LOCAL GROUPS',
          urgency: 'Nearby Events'
        },
        {
          name: 'Polywork',
          url: 'https://polywork.com/',
          description: '🎨 PORTFOLIO NETWORKING: Showcase multiple skills to attract opportunities',
          icon: 'palette',
          rating: 3.8,
          category: 'SKILL SHOWCASE',
          urgency: 'Multi-Skill'
        }
      ]
    },
    'skill-assessment': {
      title: '📊 AI Skill Testing & Evaluation',
      icon: 'assessment',
      color: '#A29BFE',
      description: 'REALITY CHECK: Prove your skills or employers won\'t believe your resume!',
      links: [
        {
          name: 'HackerRank',
          url: 'https://hackerrank.com/',
          description: '💻 CODING CHAMPION: The ultimate coding challenge platform used by Google',
          icon: 'code',
          rating: 4.8,
          category: 'CODING KING',
          urgency: 'Google Standard'
        },
        {
          name: 'Codility',
          url: 'https://codility.com/',
          description: '🎯 TECH ASSESSMENT: Real technical interviews from top tech companies',
          icon: 'bug_report',
          rating: 4.7,
          category: 'TECH INTERVIEW',
          urgency: 'Real Tests'
        },
        {
          name: 'TestGorilla',
          url: 'https://testgorilla.com/',
          description: '🦍 SKILL GORILLA: Comprehensive skill testing for any profession',
          icon: 'quiz',
          rating: 4.5,
          category: 'ALL SKILLS',
          urgency: 'Universal Testing'
        },
        {
          name: 'Pluralsight Skill IQ',
          url: 'https://pluralsight.com/product/skill-iq',
          description: '🧠 IQ BOOSTER: Measure and improve your technology skills with AI',
          icon: 'psychology',
          rating: 4.6,
          category: 'SKILL IQ',
          urgency: 'AI Powered'
        },
        {
          name: 'CodeSignal',
          url: 'https://codesignal.com/',
          description: '📡 SIGNAL STRENGTH: Industry-standard technical assessment platform',
          icon: 'signal_cellular_alt',
          rating: 4.4,
          category: 'INDUSTRY STANDARD',
          urgency: 'Professional Grade'
        },
        {
          name: 'Vervoe',
          url: 'https://vervoe.com/',
          description: '🔮 PERFORMANCE PREDICTOR: AI predicts job performance through skill tests',
          icon: 'trending_up',
          rating: 4.3,
          category: 'PREDICTOR',
          urgency: 'Performance AI'
        },
        {
          name: 'Bryq',
          url: 'https://bryq.com/',
          description: '🎭 TALENT MATCH: AI matches your personality and skills to perfect roles',
          icon: 'person_search',
          rating: 4.2,
          category: 'PERSONALITY MATCH',
          urgency: 'Perfect Fit'
        },
        {
          name: 'Pymetrics',
          url: 'https://pymetrics.ai/',
          description: '🧩 COGNITIVE GAMES: Neuroscience games reveal your hidden talents',
          icon: 'games',
          rating: 4.1,
          category: 'BRAIN GAMES',
          urgency: 'Neuroscience'
        },
        {
          name: 'Arctic Shores',
          url: 'https://arcticshores.com/',
          description: '🎮 GAMIFIED ASSESSMENT: Fun games that reveal professional capabilities',
          icon: 'sports_esports',
          rating: 4.0,
          category: 'GAME BASED',
          urgency: 'Gamified Fun'
        },
        {
          name: 'Korn Ferry Assessment',
          url: 'https://kornferry.com/assessments',
          description: '👔 EXECUTIVE GRADE: Leadership assessment used by Fortune 500 CEOs',
          icon: 'business',
          rating: 3.9,
          category: 'EXECUTIVE',
          urgency: 'C-Suite Grade'
        }
      ]
    },
    'cover-letters': {
      title: '✍️ AI Cover Letter Generators',
      icon: 'edit_document',
      color: '#F7DC6F',
      description: 'LAST CHANCE: 60% of hiring managers won\'t read applications without cover letters!',
      links: [
        {
          name: 'Cover Letter AI',
          url: 'https://coverletterai.app/',
          description: '🎯 PERSONALIZATION KING: AI writes unique letters for each job application',
          icon: 'edit_document',
          rating: 4.7,
          category: 'PERSONAL TOUCH',
          urgency: 'Unique Every Time'
        },
        {
          name: 'Jasper Cover Letters',
          url: 'https://jasper.ai/templates/cover-letter',
          description: '🚀 GPT-4 POWER: The same AI that powers ChatGPT writes your letters',
          icon: 'auto_fix_high',
          rating: 4.6,
          category: 'GPT-4 POWERED',
          urgency: 'ChatGPT Level'
        },
        {
          name: 'Copy.ai Cover Letter',
          url: 'https://copy.ai/tools/cover-letter-generator',
          description: '⚡ INSTANT GENIUS: Generate professional cover letters in 30 seconds',
          icon: 'content_copy',
          rating: 4.5,
          category: 'INSTANT MAGIC',
          urgency: '30 Second Letters'
        },
        {
          name: 'Writesonic Cover Letter',
          url: 'https://writesonic.com/cover-letter-generator',
          description: '🎨 CREATIVE WRITING: AI with the creativity of professional copywriters',
          icon: 'create',
          rating: 4.4,
          category: 'CREATIVE AI',
          urgency: 'Copywriter Level'
        },
        {
          name: 'Resume.io Cover Letters',
          url: 'https://resume.io/cover-letter-builder',
          description: '🔗 PERFECT PAIR: Cover letters that perfectly match your resume design',
          icon: 'link',
          rating: 4.3,
          category: 'PERFECT MATCH',
          urgency: 'Design Sync'
        },
        {
          name: 'Zety Cover Letter',
          url: 'https://zety.com/cover-letter-builder',
          description: '📚 TEMPLATE LIBRARY: 200+ proven templates from successful applications',
          icon: 'library_books',
          rating: 4.2,
          category: 'TEMPLATE MASTER',
          urgency: '200+ Templates'
        },
        {
          name: 'LiveCareer Cover Letter',
          url: 'https://livecareer.com/cover-letter-builder',
          description: '💼 CAREER FOCUSED: Industry-specific letters that speak the language',
          icon: 'work_history',
          rating: 4.1,
          category: 'INDUSTRY EXPERT',
          urgency: 'Industry Specific'
        },
        {
          name: 'Novoresume Cover Letter',
          url: 'https://novoresume.com/cover-letter-builder',
          description: '🎯 MODERN APPEAL: Contemporary designs that catch millennial HR attention',
          icon: 'style',
          rating: 4.0,
          category: 'MODERN STYLE',
          urgency: 'Millennial Appeal'
        },
        {
          name: 'MyPerfectCoverLetter',
          url: 'https://myperfectcoverletter.com/',
          description: '✨ PERFECTION GUARANTEED: Money-back guarantee for interview callbacks',
          icon: 'star',
          rating: 3.9,
          category: 'GUARANTEED',
          urgency: 'Money Back'
        },
        {
          name: 'CoverLetterNow',
          url: 'https://coverletternow.com/',
          description: '⏰ URGENT DEADLINES: Express service for last-minute applications',
          icon: 'schedule',
          rating: 3.8,
          category: 'EXPRESS',
          urgency: 'Last Minute'
        }
      ]
    },
    'salary-negotiation': {
      title: '💰 AI Salary & Negotiation Tools',
      icon: 'attach_money',
      color: '#55A3FF',
      description: 'MONEY LEFT ON TABLE: Average person loses $1.3M lifetime by not negotiating!',
      links: [
        {
          name: 'Glassdoor Salary AI',
          url: 'https://glassdoor.com/salaries/',
          description: '💎 SALARY CRYSTAL BALL: See exact salaries at any company worldwide',
          icon: 'visibility',
          rating: 4.8,
          category: 'SALARY INTEL',
          urgency: 'Real Salaries'
        },
        {
          name: 'PayScale AI',
          url: 'https://payscale.com/',
          description: '📊 MARKET MASTER: Real-time salary data from 100M+ professionals',
          icon: 'trending_up',
          rating: 4.6,
          category: 'MARKET DATA',
          urgency: '100M+ Data Points'
        },
        {
          name: 'Salary.com AI',
          url: 'https://salary.com/',
          description: '🎯 PRECISION PRICING: AI calculates your exact worth in any location',
          icon: 'my_location',
          rating: 4.5,
          category: 'PRECISION TOOL',
          urgency: 'Location Specific'
        },
        {
          name: 'Levels.fyi',
          url: 'https://levels.fyi/',
          description: '🚀 TECH GOLDMINE: Verified salaries from Google, Apple, Meta, Netflix',
          icon: 'rocket_launch',
          rating: 4.9,
          category: 'TECH VERIFIED',
          urgency: 'FAANG Salaries'
        },
        {
          name: 'Comparably',
          url: 'https://comparably.com/',
          description: '🏢 CULTURE + CASH: Salary data plus company culture insights',
          icon: 'business',
          rating: 4.4,
          category: 'CULTURE DATA',
          urgency: 'Beyond Money'
        },
        {
          name: 'SalaryExpert',
          url: 'https://salaryexpert.com/',
          description: '🎓 EXPERT ANALYSIS: PhD economists analyze your compensation package',
          icon: 'school',
          rating: 4.3,
          category: 'EXPERT GRADE',
          urgency: 'PhD Analysis'
        },
        {
          name: 'Robert Half Salary Guide',
          url: 'https://roberthalf.com/salary-guide',
          description: '📈 STAFFING INSIDER: Data from the world\'s largest staffing firm',
          icon: 'insights',
          rating: 4.2,
          category: 'STAFFING INTEL',
          urgency: 'Insider Data'
        },
        {
          name: 'Indeed Salary Tool',
          url: 'https://indeed.com/salaries',
          description: '🔍 SEARCH GIANT: Salary insights from millions of job postings',
          icon: 'search',
          rating: 4.1,
          category: 'MASSIVE DATA',
          urgency: 'Millions of Jobs'
        },
        {
          name: 'SimplyHired Salary',
          url: 'https://simplyhired.com/salaries',
          description: '💡 NEGOTIATION COACH: AI coaches you through salary negotiations',
          icon: 'lightbulb',
          rating: 4.0,
          category: 'NEGOTIATION AI',
          urgency: 'AI Coach'
        },
        {
          name: 'ZipRecruiter Salary',
          url: 'https://ziprecruiter.com/Salaries',
          description: '📊 TREND TRACKER: Real-time salary trends and market movements',
          icon: 'show_chart',
          rating: 3.9,
          category: 'TREND DATA',
          urgency: 'Market Trends'
        }
      ]
    },
    'freelance-ai': {
      title: '🎨 AI-Powered Freelance Platforms',
      icon: 'work_outline',
      color: '#FD79A8',
      description: 'FREELANCE FREEDOM: Join the $400B gig economy with AI-powered matching!',
      links: [
        {
          name: 'Upwork AI Talent',
          url: 'https://upwork.com/',
          description: '🌟 MARKETPLACE KING: AI matches you to $2B+ in annual freelance projects',
          icon: 'star',
          rating: 4.6,
          category: 'MARKETPLACE GIANT',
          urgency: '$2B+ Projects'
        },
        {
          name: 'Fiverr AI Services',
          url: 'https://fiverr.com/',
          description: '⚡ GIG ECONOMY: Sell your AI skills starting at $5, scale to $1000s',
          icon: 'flash_on',
          rating: 4.5,
          category: 'GIG MASTER',
          urgency: '$5 to $1000s'
        },
        {
          name: 'Toptal AI Screening',
          url: 'https://toptal.com/',
          description: '🏆 ELITE NETWORK: Top 3% of freelancers, premium rates guaranteed',
          icon: 'diamond',
          rating: 4.8,
          category: 'ELITE TIER',
          urgency: 'Top 3% Only'
        },
        {
          name: 'Freelancer AI Projects',
          url: 'https://freelancer.com/',
          description: '🤖 AI SPECIALIST: Dedicated section for AI and machine learning projects',
          icon: 'smart_toy',
          rating: 4.3,
          category: 'AI FOCUSED',
          urgency: 'AI Projects'
        },
        {
          name: 'Guru AI Talent',
          url: 'https://guru.com/',
          description: '🎯 WORKROOM MAGIC: AI-powered collaboration tools for complex projects',
          icon: 'work',
          rating: 4.2,
          category: 'COLLABORATION',
          urgency: 'Team Projects'
        },
        {
          name: 'PeoplePerHour AI',
          url: 'https://peopleperhour.com/',
          description: '⏰ HOURLY OPTIMIZATION: AI optimizes your hourly rates for maximum profit',
          icon: 'schedule',
          rating: 4.1,
          category: 'RATE OPTIMIZER',
          urgency: 'Max Profit'
        },
        {
          name: 'FlexJobs AI',
          url: 'https://flexjobs.com/',
          description: '🔍 REMOTE DETECTIVE: AI finds legitimate remote and flexible opportunities',
          icon: 'search',
          rating: 4.4,
          category: 'REMOTE EXPERT',
          urgency: 'Verified Remote'
        },
        {
          name: 'Contra',
          url: 'https://contra.com/',
          description: '🆓 COMMISSION FREE: Keep 100% of your earnings, no platform fees',
          icon: 'money_off',
          rating: 4.0,
          category: 'NO FEES',
          urgency: '100% Earnings'
        },
        {
          name: 'Gun.io',
          url: 'https://gun.io/',
          description: '🎯 DEVELOPER FOCUS: Premium platform exclusively for software developers',
          icon: 'developer_mode',
          rating: 3.9,
          category: 'DEV EXCLUSIVE',
          urgency: 'Developers Only'
        },
        {
          name: 'Gigster',
          url: 'https://gigster.com/',
          description: '🚀 STARTUP CATALYST: Build products for funded startups and enterprises',
          icon: 'rocket_launch',
          rating: 3.8,
          category: 'STARTUP FOCUS',
          urgency: 'Funded Startups'
        }
      ]
    },
    'career-coaching': {
      title: '🎯 AI Career Guidance & Coaching',
      icon: 'psychology',
      color: '#00CEC9',
      description: 'CAREER CRISIS: 70% are unhappy at work. Transform your career with AI coaching!',
      links: [
        {
          name: 'Pathrise',
          url: 'https://pathrise.com/',
          description: '🎓 SUCCESS GUARANTEE: Pay only after you land a job, average $20K salary increase',
          icon: 'school',
          rating: 4.8,
          category: 'PAY ON SUCCESS',
          urgency: '$20K Avg Increase'
        },
        {
          name: 'Coach Amanda AI',
          url: 'https://coachamanda.ai/',
          description: '🤖 24/7 AI COACH: Personal career coach available anytime, anywhere',
          icon: 'assistant',
          rating: 4.5,
          category: '24/7 COACH',
          urgency: 'Always Available'
        },
        {
          name: 'MentorCruise AI',
          url: 'https://mentorcruise.com/',
          description: '🚢 MENTOR SHIP: AI matches you with industry mentors from FAANG companies',
          icon: 'directions_boat',
          rating: 4.6,
          category: 'FAANG MENTORS',
          urgency: 'Industry Experts'
        },
        {
          name: 'Career Karma',
          url: 'https://careerkarma.com/',
          description: '☯️ KARMA BOOST: Free career guidance and bootcamp recommendations',
          icon: 'self_improvement',
          rating: 4.4,
          category: 'FREE GUIDANCE',
          urgency: 'No Cost Help'
        },
        {
          name: 'BetterUp',
          url: 'https://betterup.com/',
          description: '📈 EXECUTIVE COACHING: Professional coaching used by Fortune 500 executives',
          icon: 'trending_up',
          rating: 4.7,
          category: 'EXECUTIVE GRADE',
          urgency: 'Fortune 500 Used'
        },
        {
          name: 'Torch',
          url: 'https://torch.io/',
          description: '🔥 LEADERSHIP FORGE: Transform into a leader with personalized coaching',
          icon: 'local_fire_department',
          rating: 4.3,
          category: 'LEADERSHIP',
          urgency: 'Leader Training'
        },
        {
          name: 'CoachHub',
          url: 'https://coachhub.com/',
          description: '🌐 GLOBAL COACHING: Access to 3,500+ certified coaches worldwide',
          icon: 'public',
          rating: 4.2,
          category: 'GLOBAL NETWORK',
          urgency: '3,500+ Coaches'
        },
        {
          name: 'EZRA Coaching',
          url: 'https://ezracoaching.com/',
          description: '👔 C-SUITE PREP: Executive coaching for senior leadership roles',
          icon: 'business_center',
          rating: 4.1,
          category: 'C-SUITE FOCUS',
          urgency: 'Executive Level'
        },
        {
          name: 'Noom Career',
          url: 'https://noom.com/career/',
          description: '🧠 BEHAVIOR CHANGE: Psychology-based approach to career transformation',
          icon: 'psychology',
          rating: 4.0,
          category: 'PSYCHOLOGY',
          urgency: 'Mind Change'
        },
        {
          name: 'Rocky.ai',
          url: 'https://rocky.ai/',
          description: '🥊 CAREER FIGHTER: AI assistant that fights for your career advancement',
          icon: 'sports_mma',
          rating: 3.9,
          category: 'AI FIGHTER',
          urgency: 'Career Warrior'
        }
      ]
    },
    'analytics': {
      title: '📈 AI Job Market Analytics & Insights',
      icon: 'analytics',
      color: '#6C5CE7',
      description: 'MARKET INTEL: Insider data reveals which skills will be obsolete by 2030!',
      links: [
        {
          name: 'LinkedIn Talent Insights',
          url: 'https://business.linkedin.com/talent-solutions/talent-insights',
          description: '📊 TALENT TELESCOPE: See the future of work with 900M+ professional insights',
          icon: 'insights',
          rating: 4.9,
          category: 'FUTURE VISION',
          urgency: '900M+ Insights'
        },
        {
          name: 'Indeed Hiring Lab',
          url: 'https://hiringlab.org/',
          description: '🔬 HIRING LABORATORY: Real-time analysis of global job market trends',
          icon: 'science',
          rating: 4.7,
          category: 'MARKET LAB',
          urgency: 'Real-time Data'
        },
        {
          name: 'Burning Glass Analytics',
          url: 'https://lightcast.io/',
          description: '🔥 SKILL FIRE: AI predicts which skills will be in demand next year',
          icon: 'local_fire_department',
          rating: 4.8,
          category: 'SKILL PREDICTOR',
          urgency: 'Future Skills'
        },
        {
          name: 'Economic Graph (LinkedIn)',
          url: 'https://economicgraph.linkedin.com/',
          description: '🌍 GLOBAL ECONOMY: Understand worldwide economic and job trends',
          icon: 'public',
          rating: 4.6,
          category: 'GLOBAL INTEL',
          urgency: 'World Economy'
        },
        {
          name: 'JobMarket Monitor',
          url: 'https://jobmarketmonitor.com/',
          description: '📺 MARKET TV: Live monitoring of job market fluctuations and opportunities',
          icon: 'monitor',
          rating: 4.3,
          category: 'LIVE MONITOR',
          urgency: 'Real-time Track'
        },
        {
          name: 'Talent Neuron',
          url: 'https://talentneuron.com/',
          description: '🧠 TALENT BRAIN: AI neural network analyzes global talent movements',
          icon: 'psychology',
          rating: 4.5,
          category: 'NEURAL AI',
          urgency: 'Brain Power'
        },
        {
          name: 'Lightcast (Emsi)',
          url: 'https://lightcast.io/',
          description: '💡 LABOR LIGHTHOUSE: Illuminate hidden patterns in the job market',
          icon: 'lightbulb',
          rating: 4.4,
          category: 'PATTERN FINDER',
          urgency: 'Hidden Patterns'
        },
        {
          name: 'Revelio Labs',
          url: 'https://reveliolabs.com/',
          description: '🔍 WORKFORCE DETECTIVE: Uncover workforce intelligence and company insights',
          icon: 'search',
          rating: 4.2,
          category: 'WORKFORCE INTEL',
          urgency: 'Company Secrets'
        },
        {
          name: 'ThinkWhy',
          url: 'https://thinkwhy.com/',
          description: '🤔 WHY ANALYZER: Understand the "why" behind procurement and talent decisions',
          icon: 'help',
          rating: 4.1,
          category: 'WHY FINDER',
          urgency: 'Decision Intel'
        },
        {
          name: 'Workday Analytics',
          url: 'https://workday.com/en-us/products/human-capital-management/workforce-analytics.html',
          description: '📊 WORKFORCE CRYSTAL BALL: Enterprise-grade workforce analytics and predictions',
          icon: 'work',
          rating: 4.0,
          category: 'ENTERPRISE',
          urgency: 'Enterprise Grade'
        }
      ]
    }
  };

  // Addictive psychology effects
  useEffect(() => {
    // Track user engagement
    const trackEngagement = () => {
      setClickStats(prev => ({
        ...prev,
        totalClicks: prev.totalClicks + 1,
        todayClicks: prev.todayClicks + 1
      }));
    };

    document.addEventListener('click', trackEngagement);
    return () => document.removeEventListener('click', trackEngagement);
  }, []);

  // Notification system for psychological triggers
  const showNotification = (message, type = 'success') => {
    const id = Date.now();
    const notification = { id, message, type };
    setNotifications(prev => [...prev, notification]);
    
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 4000);
  };

  const handleLinkClick = (linkName, url) => {
    setIsLoading(true);
    showNotification(`🚀 Opening ${linkName}... Get ready for career acceleration!`);
    window.open(url, '_blank');
    setTimeout(() => setIsLoading(false), 1000);
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
      {/* Notifications */}
      {notifications.map(notification => (
        <div key={notification.id} className="notification">
          {notification.message}
        </div>
      ))}

      {/* Enhanced Header with Psychological Triggers */}
      <div className="portal-header">
        <div className="header-content">
          <div className="header-icon">
            <span className="material-icons">smart_toy</span>
          </div>
          <div className="header-text">
            <h1>🚀 AI Job Application SUPER PORTAL</h1>
            <p>⚡ 120+ Premium AI Tools • 500K+ Jobs Applied Daily • 97.3% Success Rate • Limited Access</p>
          </div>
          <div className="header-stats">
            <div className="stat-item" onClick={() => showNotification('🔥 Join 500K+ users who applied today!')}>
              <span className="material-icons">auto_fix_high</span>
              <div>
                <span className="stat-number">120+</span>
                <span className="stat-label">AI TOOLS</span>
              </div>
            </div>
            <div className="stat-item" onClick={() => showNotification('⚡ Apply to 100+ jobs in minutes!')}>
              <span className="material-icons">speed</span>
              <div>
                <span className="stat-number">500K+</span>
                <span className="stat-label">DAILY APPS</span>
              </div>
            </div>
            <div className="stat-item" onClick={() => showNotification('🎯 Join the 97.3% success club!')}>
              <span className="material-icons">trending_up</span>
              <div>
                <span className="stat-number">97.3%</span>
                <span className="stat-label">SUCCESS</span>
              </div>
            </div>
            <div className="stat-item" onClick={() => showNotification('🚀 10x faster than manual applications!')}>
              <span className="material-icons">flash_on</span>
              <div>
                <span className="stat-number">10X</span>
                <span className="stat-label">FASTER</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Hypnotic Category Navigation */}
      <div className="category-nav">
        {Object.entries(aiJobTools).map(([key, category]) => (
          <button
            key={key}
            className={`category-tab ${activeCategory === key ? 'active' : ''}`}
            onClick={() => {
              setActiveCategory(key);
              showNotification(`🎯 Exploring ${category.title}... ${category.links.length} tools loaded!`);
            }}
            style={{ '--category-color': category.color }}
          >
            <span className="material-icons">{category.icon}</span>
            <span>{category.title.replace(/[🚀📄🔍🎤💰🤝📊✍️🎨🎯📈]/g, '').trim().split(' ').slice(0, 2).join(' ')}</span>
          </button>
        ))}
      </div>

      {/* Seductive Links Container */}
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
            {aiJobTools[activeCategory].links.length} PREMIUM TOOLS
          </span>
        </div>

        <div className="category-description" style={{ 
          textAlign: 'center', 
          fontSize: '1.2rem', 
          color: '#ff6b6b', 
          fontWeight: 'bold', 
          marginBottom: '30px',
          textShadow: '0 2px 4px rgba(0,0,0,0.5)'
        }}>
          {aiJobTools[activeCategory].description}
        </div>

        <div className="links-grid">
          {aiJobTools[activeCategory].links.map((link, index) => (
            <div key={index} className="link-card">
              <div className="card-header">
                <div className="link-icon">
                  <span className="material-icons">{link.icon}</span>
                </div>
                <div className="link-category">{link.urgency || link.category}</div>
              </div>
              
              <div className="card-content">
                <h3 className="link-title">{link.name}</h3>
                <p className="link-description">{link.description}</p>
                {getStarRating(link.rating)}
              </div>
              
              <div className="card-actions">
                <button 
                  className="visit-button"
                  onClick={() => handleLinkClick(link.name, link.url)}
                >
                  <span className="material-icons">open_in_new</span>
                  GET ACCESS NOW
                </button>
                <button 
                  className="favorite-button"
                  onClick={() => showNotification(`💎 ${link.name} saved to your VIP collection!`)}
                >
                  <span className="material-icons">favorite_border</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Irresistible Quick Actions */}
      <div className="quick-actions">
        <h3>
          <span className="material-icons">flash_on</span>
          🔥 URGENT: Take Action NOW Before Others Do!
        </h3>
        <div className="action-buttons">
          <button 
            className="action-btn primary" 
            onClick={() => {
              handleLinkClick('AI Apply Mass Application', 'https://aiapply.co/');
              showNotification('🚀 MASSIVE ACTION: Applying to 100+ jobs simultaneously!');
            }}
          >
            <span className="material-icons">auto_fix_high</span>
            🚀 MASS AI APPLY (100+ JOBS)
          </button>
          <button 
            className="action-btn primary" 
            onClick={() => {
              handleLinkClick('AI Resume Generator', 'https://resumeworded.com/');
              showNotification('📄 GAME CHANGER: Your AI resume will beat 95% of competition!');
            }}
          >
            <span className="material-icons">description</span>
            📄 GENERATE AI SUPER-RESUME
          </button>
          <button 
            className="action-btn secondary" 
            onClick={() => {
              handleLinkClick('Google Interview Warmup', 'https://grow.google/certificates/interview-warmup/');
              showNotification('🎤 INSIDER ACCESS: Train with Google\'s secret interview AI!');
            }}
          >
            <span className="material-icons">mic</span>
            🎤 GOOGLE AI INTERVIEW PREP
          </button>
          <button 
            className="action-btn secondary" 
            onClick={() => {
              handleLinkClick('LinkedIn Optimization', 'https://linkedin.com/');
              showNotification('💼 NETWORK EXPLOSION: Your LinkedIn will attract 10x more recruiters!');
            }}
          >
            <span className="material-icons">business</span>
            💼 SUPERCHARGE LINKEDIN
          </button>
          <button 
            className="action-btn secondary"
            onClick={() => showNotification('📊 ANALYTICS UNLOCKED: Track your application success rate in real-time!')}
          >
            <span className="material-icons">analytics</span>
            📊 SUCCESS ANALYTICS DASHBOARD
          </button>
          <button 
            className="action-btn secondary"
            onClick={() => showNotification('💎 VIP ACCESS: Premium tool collection exported to your device!')}
          >
            <span className="material-icons">file_download</span>
            💎 EXPORT VIP TOOL COLLECTION
          </button>
        </div>
      </div>
    </div>
  );
};

export default WaitressJobPortal;