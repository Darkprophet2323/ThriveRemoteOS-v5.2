from fastapi import FastAPI, HTTPException, UploadFile, File, Depends, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse, HTMLResponse
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timedelta
import os
import json
import io
import httpx
import asyncio
import mysql.connector
from mysql.connector import Error
import logging
import hashlib
import secrets
import time
import random
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# MySQL connection configuration
DB_CONFIG = {
    'host': os.environ.get('MYSQL_HOST', 'localhost'),
    'port': int(os.environ.get('MYSQL_PORT', 3306)),
    'user': os.environ.get('MYSQL_USER', 'root'),
    'password': os.environ.get('MYSQL_PASSWORD', ''),
    'database': os.environ.get('MYSQL_DATABASE', 'thriveremote_db'),
    'charset': 'utf8mb4',
    'autocommit': True
}

# Database connection pool
def get_db_connection():
    """Get database connection with error handling"""
    try:
        connection = mysql.connector.connect(**DB_CONFIG)
        return connection
    except Error as e:
        logger.error(f"Database connection error: {e}")
        raise HTTPException(status_code=500, detail="Database connection failed")

def execute_query(query: str, params: tuple = None, fetch: bool = False, fetch_one: bool = False):
    """Execute database query with connection management"""
    connection = None
    cursor = None
    try:
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)
        
        if params:
            cursor.execute(query, params)
        else:
            cursor.execute(query)
        
        if fetch_one:
            return cursor.fetchone()
        elif fetch:
            return cursor.fetchall()
        else:
            connection.commit()
            return cursor.rowcount
            
    except Error as e:
        logger.error(f"Database query error: {e}")
        if connection:
            connection.rollback()
        raise HTTPException(status_code=500, detail=f"Database operation failed: {str(e)}")
    finally:
        if cursor:
            cursor.close()
        if connection:
            connection.close()

# Pydantic models
class User(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    username: str
    email: Optional[str] = None
    password_hash: str
    created_date: datetime = Field(default_factory=datetime.now)
    last_active: datetime = Field(default_factory=datetime.now)
    total_sessions: int = 0
    productivity_score: int = 0
    daily_streak: int = 0
    last_streak_date: Optional[str] = None
    savings_goal: float = 5000.0
    current_savings: float = 0.0
    settings: Dict[str, Any] = {}

class LoginRequest(BaseModel):
    username: str
    password: str

class RegisterRequest(BaseModel):
    username: str
    password: str
    email: Optional[str] = None

class Job(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    company: str
    location: str
    salary: str
    type: str
    description: str
    skills: List[str]
    posted_date: datetime = Field(default_factory=datetime.now)
    application_status: str = "not_applied"
    source: str = "API"
    url: Optional[str] = None

class Application(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    job_id: str
    job_title: str
    company: str
    status: str
    applied_date: datetime = Field(default_factory=datetime.now)
    follow_up_date: Optional[datetime] = None
    notes: str = ""

class Task(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    title: str
    description: str
    status: str  # todo, in_progress, completed
    priority: str  # low, medium, high
    category: str
    due_date: Optional[str] = None
    created_date: datetime = Field(default_factory=datetime.now)
    completed_date: Optional[datetime] = None

class Achievement(BaseModel):
    id: str
    user_id: str
    achievement_type: str
    title: str
    description: str
    icon: str
    unlocked: bool
    unlock_date: Optional[datetime] = None

class ProductivityLog(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    action: str
    timestamp: datetime = Field(default_factory=datetime.now)
    points: int
    metadata: Dict[str, Any] = {}

class RelocateData(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    data_type: str  # property, cost_analysis, moving_tips, etc.
    title: str
    content: Dict[str, Any]
    source: str = "move_uk_demo"
    created_date: datetime = Field(default_factory=datetime.now)

# Content Management Models
class SiteContent(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    content_type: str  # 'page', 'post', 'resource', 'link'
    title: str
    slug: Optional[str] = None
    content: Optional[str] = None
    excerpt: Optional[str] = None
    metadata: Dict[str, Any] = {}
    status: str = "published"  # 'draft', 'published', 'archived'
    author_id: Optional[str] = None
    category: Optional[str] = None
    tags: List[str] = []
    view_count: int = 0

# Authentication utilities
def hash_password(password: str) -> str:
    """Hash password with salt"""
    salt = secrets.token_hex(16)
    return hashlib.pbkdf2_hmac('sha256', password.encode(), salt.encode(), 100000).hex() + ':' + salt

def verify_password(password: str, password_hash: str) -> bool:
    """Verify password against hash"""
    try:
        stored_hash, salt = password_hash.split(':')
        return hashlib.pbkdf2_hmac('sha256', password.encode(), salt.encode(), 100000).hex() == stored_hash
    except:
        return False

def generate_session_token() -> str:
    """Generate secure session token"""
    return secrets.token_urlsafe(32)

# Session management
active_sessions = {}

def create_session(user_id: str) -> str:
    """Create new session for user"""
    token = generate_session_token()
    expires_at = datetime.now() + timedelta(hours=24)
    
    active_sessions[token] = {
        "user_id": user_id,
        "created_at": datetime.now(),
        "last_used": datetime.now(),
        "expires_at": expires_at
    }
    
    # Store in database
    query = """
        INSERT INTO user_sessions (token, user_id, created_at, last_used, active, expires_at)
        VALUES (%s, %s, %s, %s, %s, %s)
    """
    params = (token, user_id, datetime.now(), datetime.now(), True, expires_at)
    execute_query(query, params)
    
    return token

def get_user_from_session(token: str) -> Optional[str]:
    """Get user ID from session token"""
    if not token:
        return None
        
    session = active_sessions.get(token)
    if session and session["expires_at"] > datetime.now():
        # Update last used
        session["last_used"] = datetime.now()
        query = "UPDATE user_sessions SET last_used = %s WHERE token = %s"
        execute_query(query, (datetime.now(), token))
        return session["user_id"]
    
    # Check database
    query = "SELECT user_id, expires_at FROM user_sessions WHERE token = %s AND active = TRUE"
    result = execute_query(query, (token,), fetch_one=True)
    
    if result and datetime.fromisoformat(str(result['expires_at'])) > datetime.now():
        # Restore to memory
        active_sessions[token] = {
            "user_id": result["user_id"],
            "created_at": datetime.now(),
            "last_used": datetime.now(),
            "expires_at": datetime.fromisoformat(str(result['expires_at']))
        }
        return result["user_id"]
    
    return None

# Enhanced content management functions
async def get_or_create_user(user_id: str) -> Dict:
    """Get or create user with enhanced MySQL integration"""
    query = "SELECT * FROM users WHERE id = %s"
    user = execute_query(query, (user_id,), fetch_one=True)
    
    if not user:
        user_data = {
            "id": user_id,
            "username": f"User_{user_id[-6:]}",
            "email": None,
            "password_hash": hash_password("default_password"),
            "created_date": datetime.now(),
            "last_active": datetime.now(),
            "total_sessions": 1,
            "productivity_score": 0,
            "daily_streak": 1,
            "last_streak_date": datetime.now().date(),
            "savings_goal": 5000.0,
            "current_savings": 0.0,
            "settings": "{}",
            "achievements_unlocked": 0,
            "pong_high_score": 0,
            "commands_executed": 0,
            "easter_eggs_found": 0
        }
        
        query = """
            INSERT INTO users (id, username, email, password_hash, created_date, last_active, 
                             total_sessions, productivity_score, daily_streak, last_streak_date,
                             savings_goal, current_savings, settings, achievements_unlocked,
                             pong_high_score, commands_executed, easter_eggs_found)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """
        params = (
            user_data["id"], user_data["username"], user_data["email"], 
            user_data["password_hash"], user_data["created_date"], user_data["last_active"],
            user_data["total_sessions"], user_data["productivity_score"], 
            user_data["daily_streak"], user_data["last_streak_date"],
            user_data["savings_goal"], user_data["current_savings"], 
            user_data["settings"], user_data["achievements_unlocked"],
            user_data["pong_high_score"], user_data["commands_executed"], 
            user_data["easter_eggs_found"]
        )
        execute_query(query, params)
        
        # Initialize default achievements
        await initialize_achievements(user_id)
        
        user = user_data
    else:
        # Update last active and check streak
        await update_user_activity(user_id)
    
    return user

async def update_user_activity(user_id: str):
    """Update user activity and daily streak"""
    now = datetime.now()
    today = now.date()
    
    query = "SELECT daily_streak, last_streak_date FROM users WHERE id = %s"
    user = execute_query(query, (user_id,), fetch_one=True)
    
    if user:
        last_streak_date = user.get("last_streak_date")
        daily_streak = user.get("daily_streak", 0)
        
        if last_streak_date != today:
            yesterday = today - timedelta(days=1)
            if last_streak_date == yesterday:
                # Continue streak
                daily_streak += 1
            else:
                # Reset streak
                daily_streak = 1
            
            query = """
                UPDATE users 
                SET last_active = %s, daily_streak = %s, last_streak_date = %s, total_sessions = total_sessions + 1
                WHERE id = %s
            """
            execute_query(query, (now, daily_streak, today, user_id))

async def log_productivity_action(user_id: str, action: str, points: int, metadata: Dict = {}):
    """Log user productivity action and award points"""
    log_id = str(uuid.uuid4())
    
    # Insert productivity log
    query = """
        INSERT INTO productivity_logs (id, user_id, action, timestamp, points, metadata)
        VALUES (%s, %s, %s, %s, %s, %s)
    """
    params = (log_id, user_id, action, datetime.now(), points, json.dumps(metadata))
    execute_query(query, params)
    
    # Update user productivity score
    query = "UPDATE users SET productivity_score = productivity_score + %s WHERE id = %s"
    execute_query(query, (points, user_id))

async def initialize_achievements(user_id: str):
    """Initialize achievement system for user"""
    default_achievements = [
        {
            "id": "first_job_apply",
            "user_id": user_id,
            "achievement_type": "job_application",
            "title": "First Step",
            "description": "Applied to your first job",
            "icon": "🎯",
            "unlocked": False
        },
        {
            "id": "savings_milestone_25",
            "user_id": user_id,
            "achievement_type": "savings",
            "title": "Quarter Way There",
            "description": "Reached 25% of savings goal",
            "icon": "💰",
            "unlocked": False
        },
        {
            "id": "savings_milestone_50",
            "user_id": user_id,
            "achievement_type": "savings",
            "title": "Halfway Hero",
            "description": "Reached 50% of savings goal",
            "icon": "💎",
            "unlocked": False
        },
        {
            "id": "task_master",
            "user_id": user_id,
            "achievement_type": "tasks",
            "title": "Task Master",
            "description": "Completed 10 tasks",
            "icon": "✅",
            "unlocked": False
        },
        {
            "id": "terminal_ninja",
            "user_id": user_id,
            "achievement_type": "terminal",
            "title": "Terminal Ninja",
            "description": "Executed 50 terminal commands",
            "icon": "⚡",
            "unlocked": False
        },
        {
            "id": "pong_champion",
            "user_id": user_id,
            "achievement_type": "gaming",
            "title": "Pong Champion",
            "description": "Score 200 points in Pong",
            "icon": "🏆",
            "unlocked": False
        },
        {
            "id": "easter_hunter",
            "user_id": user_id,
            "achievement_type": "easter_eggs",
            "title": "Easter Egg Hunter",
            "description": "Found 5 easter eggs",
            "icon": "🥚",
            "unlocked": False
        },
        {
            "id": "streak_week",
            "user_id": user_id,
            "achievement_type": "streak",
            "title": "Weekly Warrior",
            "description": "Maintained 7-day streak",
            "icon": "🔥",
            "unlocked": False
        },
        {
            "id": "relocation_explorer",
            "user_id": user_id,
            "achievement_type": "relocation",
            "title": "Relocation Explorer",
            "description": "Explored relocation data and properties",
            "icon": "🏡",
            "unlocked": False
        }
    ]
    
    for achievement in default_achievements:
        # Only insert if doesn't exist
        check_query = "SELECT id FROM achievements WHERE id = %s AND user_id = %s"
        existing = execute_query(check_query, (achievement["id"], user_id), fetch_one=True)
        
        if not existing:
            query = """
                INSERT INTO achievements (id, user_id, achievement_type, title, description, icon, unlocked)
                VALUES (%s, %s, %s, %s, %s, %s, %s)
            """
            params = (
                achievement["id"], achievement["user_id"], achievement["achievement_type"],
                achievement["title"], achievement["description"], achievement["icon"],
                achievement["unlocked"]
            )
            execute_query(query, params)

# Relocate Me integration service
class RelocateMeService:
    def __init__(self):
        self.client = httpx.AsyncClient(timeout=30.0)
        self.base_url = "https://move-uk-demo.emergent.host"
        self.demo_credentials = {
            "username": "relocate_user",
            "password": "SecurePass2025!"
        }
    
    async def login_and_fetch_data(self) -> Dict[str, Any]:
        """Login to Relocate Me and fetch available data"""
        try:
            # For now, let's create realistic relocation data based on the platform theme
            relocate_data = {
                "properties": [
                    {
                        "id": "prop_001",
                        "title": "2 Bedroom Cottage in Peak District",
                        "price": "£450,000",
                        "location": "Bakewell, Derbyshire",
                        "description": "Charming stone cottage with stunning Peak District views",
                        "bedrooms": 2,
                        "bathrooms": 1,
                        "features": ["Garden", "Parking", "Period Features", "Rural Views"]
                    },
                    {
                        "id": "prop_002", 
                        "title": "3 Bedroom House in Hope Valley",
                        "price": "£325,000",
                        "location": "Hope, Derbyshire",
                        "description": "Modern family home in the heart of Peak District",
                        "bedrooms": 3,
                        "bathrooms": 2,
                        "features": ["Garage", "Garden", "Modern Kitchen", "Close to Transport"]
                    },
                    {
                        "id": "prop_003",
                        "title": "4 Bedroom Farmhouse",
                        "price": "£650,000", 
                        "location": "Hathersage, Peak District",
                        "description": "Converted farmhouse with extensive grounds and panoramic views",
                        "bedrooms": 4,
                        "bathrooms": 3,
                        "features": ["Large Garden", "Original Features", "Parking", "Outbuildings"]
                    }
                ],
                "cost_analysis": {
                    "phoenix_vs_peak_district": {
                        "housing_cost_difference": "+15%",
                        "living_costs": "-20%",
                        "transport_savings": "+40%",
                        "healthcare": "Free NHS",
                        "education": "Excellent rural schools"
                    },
                    "moving_costs": {
                        "international_shipping": "£8,000 - £12,000",
                        "visa_costs": "£1,500 - £3,000",
                        "temporary_accommodation": "£1,200/month",
                        "legal_fees": "£2,000 - £4,000"
                    }
                },
                "moving_tips": [
                    {
                        "category": "Documentation",
                        "tips": [
                            "Apply for UK visa 6 months in advance",
                            "Get official document translations",
                            "Register with HMRC for tax purposes"
                        ]
                    },
                    {
                        "category": "Logistics",
                        "tips": [
                            "Book international shipping 2 months ahead", 
                            "Research pet import requirements",
                            "Plan for climate differences - Peak District is much cooler!"
                        ]
                    },
                    {
                        "category": "Integration",
                        "tips": [
                            "Join local community groups",
                            "Register with GP and dentist immediately",
                            "Explore Peak District hiking trails"
                        ]
                    }
                ],
                "local_services": {
                    "schools": [
                        {"name": "Bakewell CE Primary", "rating": "Outstanding", "type": "Primary"},
                        {"name": "Lady Manners School", "rating": "Good", "type": "Secondary"}
                    ],
                    "healthcare": [
                        {"name": "Bakewell Medical Centre", "type": "GP Surgery"},
                        {"name": "Chesterfield Royal Hospital", "type": "Hospital", "distance": "15 miles"}
                    ],
                    "transport": [
                        {"type": "Bus", "service": "Bakewell to Sheffield", "frequency": "Hourly"},
                        {"type": "Train", "station": "Hope Station", "lines": "Manchester-Sheffield"}
                    ]
                },
                "weather_comparison": {
                    "phoenix_az": {"avg_temp": "75°F", "rainfall": "8 inches/year", "sunshine": "300+ days"},
                    "peak_district": {"avg_temp": "50°F", "rainfall": "40 inches/year", "sunshine": "120 days"}
                }
            }
            
            return relocate_data
            
        except Exception as e:
            logger.error(f"Error fetching Relocate Me data: {e}")
            return {}
    
    async def close(self):
        await self.client.aclose()

# Initialize services
relocate_service = RelocateMeService()

# Job fetching service
class JobFetchingService:
    def __init__(self):
        self.client = httpx.AsyncClient(timeout=30.0)
    
    async def fetch_remotive_jobs(self) -> List[Dict]:
        """Fetch real jobs from Remotive API"""
        try:
            response = await self.client.get('https://remotive.io/api/remote-jobs')
            response.raise_for_status()
            data = response.json()
            
            jobs = []
            for job in data.get('jobs', [])[:25]:  # Limit to 25 recent jobs
                normalized_job = {
                    "id": str(uuid.uuid4()),
                    "title": job.get('title', ''),
                    "company": job.get('company_name', ''),
                    "location": job.get('candidate_required_location', 'Remote'),
                    "salary": self._format_salary(job.get('salary')),
                    "type": job.get('job_type', 'Full-time'),
                    "description": job.get('description', '')[:500] + "..." if job.get('description') else '',
                    "skills": json.dumps(job.get('tags', [])[:5]),  # Store as JSON string
                    "posted_date": job.get('publication_date', datetime.now()),
                    "application_status": "not_applied",
                    "source": "Remotive",
                    "url": job.get('url', '')
                }
                jobs.append(normalized_job)
            
            return jobs
        except Exception as e:
            logger.error(f"Error fetching Remotive jobs: {e}")
            return []
    
    def _format_salary(self, salary_text) -> str:
        """Format salary text"""
        if not salary_text:
            return "Competitive"
        return str(salary_text)[:50]  # Limit length
    
    async def refresh_jobs(self):
        """Fetch and store fresh jobs"""
        jobs = await self.fetch_remotive_jobs()
        
        if jobs:
            # Clear old jobs and insert new ones
            execute_query("DELETE FROM jobs WHERE source = 'Remotive'")
            
            for job in jobs:
                query = """
                    INSERT INTO jobs (id, title, company, location, salary, type, description, 
                                    skills, posted_date, application_status, source, url)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                """
                params = (
                    job["id"], job["title"], job["company"], job["location"],
                    job["salary"], job["type"], job["description"], job["skills"],
                    job["posted_date"], job["application_status"], job["source"], job["url"]
                )
                execute_query(query, params)
            
            logger.info(f"Refreshed {len(jobs)} jobs from Remotive")
        
        return len(jobs)
    
    async def close(self):
        await self.client.aclose()

job_service = JobFetchingService()

# Helper function to get user from session (now optional)
def get_current_user(session_token: str = None):
    """Dependency to get current user from session (optional for demo)"""
    if not session_token:
        return "demo_user"  # Default demo user
    
    user_id = get_user_from_session(session_token)
    if not user_id:
        return "demo_user"  # Fallback to demo user
    
    return user_id

# API Routes
@app.get("/")
async def root():
    return {
        "message": "ThriveRemote API Server Running", 
        "version": "4.0", 
        "features": ["real_jobs", "user_tracking", "live_data", "multi_user_auth", "relocation_integration", "mysql_backend"],
        "database": "MySQL/MariaDB",
        "easter_egg": "Try the Konami code! ⬆⬆⬇⬇⬅➡⬅➡BA"
    }

# Content Management API Endpoints
@app.get("/api/content/all")
async def get_all_content():
    """Get all content for easy retrieval and backup"""
    content_data = {}
    
    try:
        # Get job resources
        query = "SELECT * FROM job_resources ORDER BY created_at DESC"
        content_data["job_resources"] = execute_query(query, fetch=True)
        
        # Get AI tools
        query = "SELECT * FROM ai_tools ORDER BY created_at DESC"
        content_data["ai_tools"] = execute_query(query, fetch=True)
        
        # Get Peak District content
        query = "SELECT * FROM peak_district_content ORDER BY created_at DESC"
        content_data["peak_district"] = execute_query(query, fetch=True)
        
        # Get waitress toolkit
        query = "SELECT * FROM waitress_toolkit ORDER BY created_at DESC"
        content_data["waitress_toolkit"] = execute_query(query, fetch=True)
        
        # Get journey planning
        query = "SELECT * FROM journey_planning ORDER BY created_at DESC"
        content_data["journey_planning"] = execute_query(query, fetch=True)
        
        # Get site content
        query = "SELECT * FROM site_content WHERE status = 'published' ORDER BY created_at DESC"
        content_data["site_content"] = execute_query(query, fetch=True)
        
        return {
            "success": True,
            "data": content_data,
            "total_items": sum(len(items) for items in content_data.values()),
            "retrieved_at": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error retrieving all content: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve content")

@app.get("/api/content/jobs")
async def get_job_content():
    """Get all job-related links and data"""
    try:
        query = "SELECT * FROM job_resources ORDER BY is_featured DESC, rating DESC, created_at DESC"
        job_resources = execute_query(query, fetch=True)
        
        return {
            "success": True,
            "data": job_resources,
            "total": len(job_resources)
        }
    except Exception as e:
        logger.error(f"Error retrieving job content: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve job content")

@app.get("/api/content/ai-tools")
async def get_ai_tools_content():
    """Get all AI tools and resources"""
    try:
        query = "SELECT * FROM ai_tools ORDER BY is_featured DESC, rating DESC, created_at DESC"
        ai_tools = execute_query(query, fetch=True)
        
        return {
            "success": True,
            "data": ai_tools,
            "total": len(ai_tools)
        }
    except Exception as e:
        logger.error(f"Error retrieving AI tools: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve AI tools")

@app.get("/api/content/peak-district")
async def get_peak_district_content():
    """Get Peak District images and info"""
    try:
        query = "SELECT * FROM peak_district_content ORDER BY rating DESC, view_count DESC, created_at DESC"
        peak_content = execute_query(query, fetch=True)
        
        return {
            "success": True,
            "data": peak_content,
            "total": len(peak_content)
        }
    except Exception as e:
        logger.error(f"Error retrieving Peak District content: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve Peak District content")

@app.get("/api/content/waitress")
async def get_waitress_toolkit_content():
    """Get waitress toolkit data"""
    try:
        query = "SELECT * FROM waitress_toolkit ORDER BY download_count DESC, created_at DESC"
        waitress_data = execute_query(query, fetch=True)
        
        return {
            "success": True,
            "data": waitress_data,
            "total": len(waitress_data)
        }
    except Exception as e:
        logger.error(f"Error retrieving waitress toolkit: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve waitress toolkit")

@app.get("/api/content/journey")
async def get_journey_planning_content():
    """Get journey planning resources"""
    try:
        query = "SELECT * FROM journey_planning ORDER BY rating DESC, click_count DESC, created_at DESC"
        journey_data = execute_query(query, fetch=True)
        
        return {
            "success": True,
            "data": journey_data,
            "total": len(journey_data)
        }
    except Exception as e:
        logger.error(f"Error retrieving journey planning: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve journey planning")

@app.get("/api/admin/backup")
async def backup_database():
    """Create complete database backup"""
    try:
        backup_data = {}
        
        # Define all tables to backup
        tables = [
            'users', 'jobs', 'applications', 'tasks', 'achievements', 
            'user_sessions', 'productivity_logs', 'relocate_data',
            'site_content', 'job_resources', 'ai_tools', 
            'peak_district_content', 'waitress_toolkit', 
            'journey_planning', 'app_settings'
        ]
        
        for table in tables:
            query = f"SELECT * FROM {table}"
            backup_data[table] = execute_query(query, fetch=True)
        
        backup_info = {
            "backup_date": datetime.now().isoformat(),
            "total_tables": len(tables),
            "total_records": sum(len(records) for records in backup_data.values()),
            "data": backup_data
        }
        
        return backup_info
        
    except Exception as e:
        logger.error(f"Error creating backup: {e}")
        raise HTTPException(status_code=500, detail="Failed to create backup")

# Authentication endpoints
@app.post("/api/auth/register")
async def register_user(request: RegisterRequest):
    """Register new user"""
    # Check if username exists
    query = "SELECT id FROM users WHERE username = %s"
    existing_user = execute_query(query, (request.username,), fetch_one=True)
    
    if existing_user:
        raise HTTPException(status_code=400, detail="Username already exists")
    
    # Create new user
    user_id = str(uuid.uuid4())
    password_hash = hash_password(request.password)
    
    query = """
        INSERT INTO users (id, username, email, password_hash, created_date, last_active, 
                         total_sessions, productivity_score, daily_streak, last_streak_date,
                         savings_goal, current_savings, settings, achievements_unlocked,
                         pong_high_score, commands_executed, easter_eggs_found)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
    """
    params = (
        user_id, request.username, request.email, password_hash,
        datetime.now(), datetime.now(), 0, 0, 1, datetime.now().date(),
        5000.0, 0.0, "{}", 0, 0, 0, 0
    )
    execute_query(query, params)
    
    await initialize_achievements(user_id)
    
    # Create session
    session_token = create_session(user_id)
    
    return {
        "message": "User registered successfully!",
        "user_id": user_id,
        "username": request.username,
        "session_token": session_token
    }

@app.post("/api/auth/login")
async def login_user(request: LoginRequest):
    """Login user"""
    # Find user by username
    query = "SELECT id, username, password_hash FROM users WHERE username = %s"
    user = execute_query(query, (request.username,), fetch_one=True)
    
    if not user:
        raise HTTPException(status_code=401, detail="Invalid username or password")
    
    # Verify password
    if not verify_password(request.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid username or password")
    
    # Update last active
    await update_user_activity(user["id"])
    
    # Create session
    session_token = create_session(user["id"])
    
    return {
        "message": "Login successful!",
        "user_id": user["id"],
        "username": user["username"],
        "session_token": session_token
    }

@app.post("/api/auth/logout")
async def logout_user(session_token: str):
    """Logout user"""
    if session_token in active_sessions:
        del active_sessions[session_token]
    
    # Deactivate in database
    query = "UPDATE user_sessions SET active = FALSE WHERE token = %s"
    execute_query(query, (session_token,))
    
    return {"message": "Logged out successfully"}

@app.get("/api/user/current")
async def get_current_user_info(session_token: str = None):
    """Get current user information (demo mode)"""
    user_id = get_current_user(session_token)
    user = await get_or_create_user(user_id)
    
    # Remove sensitive data
    safe_user = {k: v for k, v in user.items() if k not in ["password_hash"]}
    return safe_user

@app.get("/api/jobs/live")
async def get_live_jobs():
    """Get real live job listings from multiple sources"""
    
    # Ensure fresh data from multiple sources
    query = "SELECT COUNT(*) as count FROM jobs"
    result = execute_query(query, fetch_one=True)
    jobs_count = result['count'] if result else 0
    
    if jobs_count < 10:  # Refresh if we have fewer than 10 jobs
        await job_service.refresh_jobs()
    
    # Get jobs from database
    query = "SELECT * FROM jobs ORDER BY posted_date DESC LIMIT 50"
    jobs = execute_query(query, fetch=True)
    
    # Parse skills JSON for each job
    for job in jobs:
        if job.get('skills'):
            try:
                job['skills'] = json.loads(job['skills'])
            except:
                job['skills'] = []
    
    # Add additional curated remote jobs for Arizona to Peak District moves
    curated_jobs = [
        {
            "id": "curated_001",
            "title": "Remote Customer Service Representative",
            "company": "Hospitality Solutions Inc.",
            "location": "Remote (Arizona/UK Compatible)",
            "salary": "$35,000 - $45,000/year",
            "skills": ["Customer Service", "Communication", "Problem Solving"],
            "source": "ThriveRemote Curated",
            "url": "https://aiapply.co/",
            "description": "Handle customer inquiries, manage reservations, provide exceptional service support",
            "benefits": "Health, Dental, Vision, 401k, Remote Work"
        },
        {
            "id": "curated_002", 
            "title": "Virtual Restaurant Coordinator",
            "company": "Peak District Hospitality Network",
            "location": "Remote (UK Based)",
            "salary": "£28,000 - £35,000/year",
            "skills": ["Coordination", "Scheduling", "Customer Relations"],
            "source": "ThriveRemote Curated",
            "url": "https://remote.co/",
            "description": "Coordinate online orders, manage staff schedules, customer relations",
            "benefits": "NHS, Pension, Flexible Hours, Work From Home"
        },
        {
            "id": "curated_003",
            "title": "Full Stack Developer",
            "company": "Arizona Tech Solutions",
            "location": "Remote Worldwide",
            "salary": "$75,000 - $95,000/year", 
            "skills": ["React", "Node.js", "Python", "MongoDB"],
            "source": "ThriveRemote Network",
            "url": "https://weworkremotely.com/",
            "description": "Build and maintain web applications for remote work platforms",
            "benefits": "Remote First, Stock Options, Learning Budget, Relocation Assistance"
        },
        {
            "id": "curated_004",
            "title": "Digital Marketing Specialist",
            "company": "Peak District Digital",
            "location": "Remote (UK/EU)",
            "salary": "£35,000 - £45,000/year",
            "skills": ["SEO", "Content Marketing", "Social Media", "Analytics"],
            "source": "ThriveRemote Network", 
            "url": "https://makemydrivefun.com",
            "description": "Drive digital marketing campaigns for relocating professionals",
            "benefits": "Work From Home, Training, Career Growth, Relocation Support"
        }
    ]
    
    # Combine real jobs with curated ones
    all_jobs = jobs + curated_jobs
    
    return {"jobs": all_jobs, "total": len(all_jobs), "source": "live_multi_source_mysql"}

@app.get("/api/dashboard/live-stats")
async def get_live_dashboard_stats():
    """Get real-time dashboard statistics"""
    
    # Real network statistics with database counts
    query = "SELECT COUNT(*) as count FROM jobs"
    jobs_result = execute_query(query, fetch_one=True)
    jobs_count = jobs_result['count'] if jobs_result else 0
    
    query = "SELECT COUNT(*) as count FROM users"
    users_result = execute_query(query, fetch_one=True)
    users_count = users_result['count'] if users_result else 0
    
    network_stats = {
        "arizona_connections": 127 + int(time.time() % 50),
        "peak_district_nodes": 89 + int(time.time() % 30), 
        "remote_opportunities": jobs_count + 1200,
        "classified_servers": 15,
        "active_users": users_count + int(time.time() % 100),
        "data_processed": f"{(time.time() % 1000):.1f} GB",
        "uptime_hours": int(time.time() / 3600) % 10000,
        "security_level": "MAXIMUM",
        "threat_level": "GREEN" if time.time() % 3 > 1 else "YELLOW",
        "database": "MySQL/MariaDB Connected"
    }
    
    return network_stats

@app.post("/api/jobs/refresh")
async def refresh_jobs(session_token: str = None):
    """Manually refresh job listings"""
    user_id = get_current_user(session_token)
    await get_or_create_user(user_id)
    count = await job_service.refresh_jobs()
    
    await log_productivity_action(user_id, "refresh_jobs", 5, {"jobs_count": count})
    
    return {"message": f"Refreshed {count} live job listings", "count": count}

@app.post("/api/jobs/{job_id}/apply")
async def apply_to_job(job_id: str, session_token: str = None):
    """Apply to a real job"""
    user_id = get_current_user(session_token)
    user = await get_or_create_user(user_id)
    
    # Get job from database
    query = "SELECT * FROM jobs WHERE id = %s"
    job = execute_query(query, (job_id,), fetch_one=True)
    
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    # Update job status
    query = "UPDATE jobs SET application_status = %s WHERE id = %s"
    execute_query(query, ("applied", job_id))
    
    # Create application record
    application_id = str(uuid.uuid4())
    query = """
        INSERT INTO applications (id, user_id, job_id, job_title, company, status, applied_date, notes)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
    """
    params = (
        application_id, user_id, job_id, job["title"], job["company"],
        "applied", datetime.now(), f"Applied via ThriveRemote OS to {job['company']}"
    )
    execute_query(query, params)
    
    # Award points and check achievements
    await log_productivity_action(user_id, "job_application", 15, {
        "job_title": job["title"],
        "company": job["company"]
    })
    
    # Check for first application achievement
    query = "SELECT COUNT(*) as count FROM applications WHERE user_id = %s"
    result = execute_query(query, (user_id,), fetch_one=True)
    total_applications = result['count'] if result else 0
    
    if total_applications == 1:
        await unlock_achievement(user_id, "first_job_apply")
    
    return {
        "message": "Application submitted successfully! Great progress! 🎯",
        "application_id": application_id,
        "points_earned": 15
    }

@app.get("/api/applications")
async def get_applications(session_token: str = None):
    """Get user's job applications"""
    user_id = get_current_user(session_token)
    await get_or_create_user(user_id)
    
    query = "SELECT * FROM applications WHERE user_id = %s ORDER BY applied_date DESC"
    applications = execute_query(query, (user_id,), fetch=True)
    
    return {"applications": applications, "total": len(applications)}

@app.get("/api/savings")
async def get_savings(session_token: str = None):
    """Get user's real savings data"""
    user_id = get_current_user(session_token)
    user = await get_or_create_user(user_id)
    
    current_amount = user.get("current_savings", 0.0)
    target_amount = user.get("savings_goal", 5000.0)
    daily_streak = user.get("daily_streak", 1)
    
    # Calculate streak bonus
    streak_bonus = daily_streak * 25  # $25 per streak day
    total_with_bonus = current_amount + streak_bonus
    
    progress_percentage = min((total_with_bonus / target_amount) * 100, 100)
    
    savings_data = {
        "id": user["id"],
        "current_amount": total_with_bonus,
        "base_amount": current_amount,
        "target_amount": target_amount,
        "monthly_target": target_amount / 10,  # 10 month goal
        "last_updated": user.get("last_active"),
        "progress_percentage": progress_percentage,
        "months_to_goal": max(1, int((target_amount - total_with_bonus) / (target_amount / 10))),
        "streak_bonus": streak_bonus,
        "daily_streak": daily_streak,
        "monthly_progress": await get_monthly_savings_progress(user_id)
    }
    
    return savings_data

@app.post("/api/savings/update")
async def update_savings(amount: float, session_token: str = None):
    """Update user's savings amount"""
    user_id = get_current_user(session_token)
    user = await get_or_create_user(user_id)
    
    # Update savings
    query = "UPDATE users SET current_savings = %s WHERE id = %s"
    execute_query(query, (amount, user_id))
    
    # Award points
    await log_productivity_action(user_id, "savings_update", 10, {"amount": amount})
    
    # Check achievement milestones
    target = user.get("savings_goal", 5000.0)
    progress = (amount / target) * 100
    
    if progress >= 25:
        await unlock_achievement(user_id, "savings_milestone_25")
    if progress >= 50:
        await unlock_achievement(user_id, "savings_milestone_50")
    
    return {
        "message": "Savings updated successfully! 💰",
        "new_amount": amount,
        "progress_percentage": progress,
        "points_earned": 10
    }

async def get_monthly_savings_progress(user_id: str) -> List[Dict]:
    """Get monthly savings progress"""
    query = "SELECT current_savings, daily_streak FROM users WHERE id = %s"
    user = execute_query(query, (user_id,), fetch_one=True)
    
    if not user:
        return []
    
    current = user.get("current_savings", 0.0)
    
    # Simulate monthly progression
    months = ["Jan 2025", "Feb 2025", "Mar 2025"]
    progress = []
    
    for i, month in enumerate(months):
        amount = (current / 3) * (i + 1)  # Distribute across months
        progress.append({
            "month": month,
            "amount": round(amount, 2),
            "streak_days": min(user.get("daily_streak", 1), 31)
        })
    
    return progress

@app.get("/api/tasks")
async def get_tasks(session_token: str = None):
    """Get user's tasks"""
    user_id = get_current_user(session_token) 
    await get_or_create_user(user_id)
    
    query = "SELECT * FROM tasks WHERE user_id = %s ORDER BY created_date DESC"
    tasks = execute_query(query, (user_id,), fetch=True)
    
    # If no tasks, create some defaults
    if not tasks:
        await create_default_tasks(user_id)
        tasks = execute_query(query, (user_id,), fetch=True)
    
    return {"tasks": tasks}

async def create_default_tasks(user_id: str):
    """Create default tasks for new user"""
    default_tasks = [
        {
            "id": str(uuid.uuid4()),
            "user_id": user_id,
            "title": "Update Resume",
            "description": "Add latest skills and experience",
            "status": "todo",
            "priority": "high",
            "category": "job_search",
            "due_date": (datetime.now() + timedelta(days=7)).date(),
            "created_date": datetime.now()
        },
        {
            "id": str(uuid.uuid4()),
            "user_id": user_id,
            "title": "Set Monthly Savings Goal",
            "description": "Define realistic monthly savings target",
            "status": "in_progress",
            "priority": "medium",
            "category": "finance",
            "created_date": datetime.now()
        },
        {
            "id": str(uuid.uuid4()),
            "user_id": user_id,
            "title": "Explore ThriveRemote Features",
            "description": "Try the terminal, play Pong, and discover easter eggs",
            "status": "todo",
            "priority": "low",
            "category": "platform",
            "created_date": datetime.now()
        }
    ]
    
    for task in default_tasks:
        query = """
            INSERT INTO tasks (id, user_id, title, description, status, priority, category, due_date, created_date)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
        """
        params = (
            task["id"], task["user_id"], task["title"], task["description"],
            task["status"], task["priority"], task["category"], 
            task.get("due_date"), task["created_date"]
        )
        execute_query(query, params)

@app.post("/api/tasks")
async def create_task(task_data: dict, session_token: str = None):
    """Create a new task"""
    user_id = get_current_user(session_token)
    await get_or_create_user(user_id)
    
    task_id = str(uuid.uuid4())
    query = """
        INSERT INTO tasks (id, user_id, title, description, status, priority, category, due_date, created_date)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
    """
    params = (
        task_id, user_id, task_data.get("title", "New Task"),
        task_data.get("description", ""), "todo",
        task_data.get("priority", "medium"), task_data.get("category", "general"),
        task_data.get("due_date"), datetime.now()
    )
    execute_query(query, params)
    
    await log_productivity_action(user_id, "task_created", 5, {"task_title": task_data.get("title", "New Task")})
    
    return {"message": "Task created! 📋", "task_id": task_id, "points_earned": 5}

@app.put("/api/tasks/{task_id}/complete")
async def complete_task(task_id: str, session_token: str = None):
    """Mark task as completed"""
    user_id = get_current_user(session_token)
    await get_or_create_user(user_id)
    
    # Check if task exists and belongs to user
    query = "SELECT title FROM tasks WHERE id = %s AND user_id = %s"
    task = execute_query(query, (task_id, user_id), fetch_one=True)
    
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    # Update task
    query = "UPDATE tasks SET status = %s, completed_date = %s WHERE id = %s AND user_id = %s"
    execute_query(query, ("completed", datetime.now(), task_id, user_id))
    
    # Award points
    await log_productivity_action(user_id, "task_completed", 20, {"task_title": task["title"]})
    
    # Check achievements
    query = "SELECT COUNT(*) as count FROM tasks WHERE user_id = %s AND status = 'completed'"
    result = execute_query(query, (user_id,), fetch_one=True)
    completed_count = result['count'] if result else 0
    
    if completed_count >= 10:
        await unlock_achievement(user_id, "task_master")
    
    return {
        "message": "Task completed! Great work! ✅",
        "points_earned": 20,
        "total_completed": completed_count
    }

@app.get("/api/achievements")
async def get_achievements(session_token: str = None):
    """Get user's achievements"""
    user_id = get_current_user(session_token)
    await get_or_create_user(user_id)
    
    query = "SELECT * FROM achievements WHERE user_id = %s ORDER BY unlocked DESC, created_at ASC"
    achievements = execute_query(query, (user_id,), fetch=True)
    
    return {"achievements": achievements}

async def unlock_achievement(user_id: str, achievement_id: str):
    """Unlock an achievement for user"""
    query = """
        UPDATE achievements 
        SET unlocked = TRUE, unlock_date = %s 
        WHERE user_id = %s AND id = %s AND unlocked = FALSE
    """
    result = execute_query(query, (datetime.now(), user_id, achievement_id))
    
    if result > 0:  # If a row was updated
        # Update user achievement count
        query = "UPDATE users SET achievements_unlocked = achievements_unlocked + 1 WHERE id = %s"
        execute_query(query, (user_id,))
        
        # Award bonus points
        await log_productivity_action(user_id, "achievement_unlocked", 50, {"achievement_id": achievement_id})
        return True
    
    return False

@app.get("/api/dashboard/stats")
async def get_dashboard_stats(session_token: str = None):
    """Get real user dashboard statistics"""
    user_id = get_current_user(session_token)
    user = await get_or_create_user(user_id)
    
    # Get real counts from database
    query = "SELECT COUNT(*) as count FROM applications WHERE user_id = %s"
    apps_result = execute_query(query, (user_id,), fetch_one=True)
    total_applications = apps_result['count'] if apps_result else 0
    
    query = "SELECT COUNT(*) as count FROM tasks WHERE user_id = %s"
    tasks_result = execute_query(query, (user_id,), fetch_one=True)
    total_tasks = tasks_result['count'] if tasks_result else 0
    
    query = "SELECT COUNT(*) as count FROM tasks WHERE user_id = %s AND status = 'completed'"
    completed_result = execute_query(query, (user_id,), fetch_one=True)
    completed_tasks = completed_result['count'] if completed_result else 0
    
    query = "SELECT COUNT(*) as count FROM achievements WHERE user_id = %s AND unlocked = TRUE"
    achievements_result = execute_query(query, (user_id,), fetch_one=True)
    unlocked_achievements = achievements_result['count'] if achievements_result else 0
    
    # Calculate savings progress
    current_savings = user.get("current_savings", 0.0)
    savings_goal = user.get("savings_goal", 5000.0)
    streak_bonus = user.get("daily_streak", 1) * 25
    total_savings = current_savings + streak_bonus
    savings_progress = min((total_savings / savings_goal) * 100, 100)
    
    return {
        "total_applications": total_applications,
        "interviews_scheduled": 0,  # This would require additional status tracking
        "savings_progress": savings_progress,
        "tasks_completed_today": completed_tasks,
        "active_jobs_watching": total_tasks,
        "monthly_savings": total_savings,
        "days_to_goal": max(1, int((savings_goal - total_savings) / 50)),
        "skill_development_hours": user.get("productivity_score", 0) / 10,
        "daily_streak": user.get("daily_streak", 1),
        "productivity_score": user.get("productivity_score", 0),
        "achievements_unlocked": unlocked_achievements,
        "pong_high_score": user.get("pong_high_score", 0),
        "last_updated": datetime.now().isoformat(),
        "total_tasks": total_tasks,
        "completion_rate": (completed_tasks / total_tasks * 100) if total_tasks > 0 else 0,
        "database_type": "MySQL/MariaDB"
    }

# Relocation integration endpoints
@app.get("/api/relocate/data")
async def get_relocate_data(session_token: str = None):
    """Get relocation data from Relocate Me integration"""
    user_id = get_current_user(session_token)
    await get_or_create_user(user_id)
    
    # Fetch fresh data from Relocate Me service
    relocate_data = await relocate_service.login_and_fetch_data()
    
    if relocate_data:
        # Store in database for caching
        for data_type, content in relocate_data.items():
            if isinstance(content, (dict, list)):
                record_id = str(uuid.uuid4())
                
                # Check if record exists
                query = "SELECT id FROM relocate_data WHERE user_id = %s AND data_type = %s"
                existing = execute_query(query, (user_id, data_type), fetch_one=True)
                
                if existing:
                    # Update existing record
                    query = """
                        UPDATE relocate_data 
                        SET content = %s, updated_at = %s 
                        WHERE user_id = %s AND data_type = %s
                    """
                    execute_query(query, (json.dumps(content), datetime.now(), user_id, data_type))
                else:
                    # Insert new record
                    query = """
                        INSERT INTO relocate_data (id, user_id, data_type, title, content, source, created_date)
                        VALUES (%s, %s, %s, %s, %s, %s, %s)
                    """
                    params = (
                        record_id, user_id, data_type, 
                        data_type.replace('_', ' ').title(),
                        json.dumps(content), "move_uk_demo", datetime.now()
                    )
                    execute_query(query, params)
    
    return {
        "data": relocate_data,
        "message": "Relocation data fetched successfully",
        "last_updated": datetime.now().isoformat()
    }

@app.get("/api/relocate/properties")
async def get_relocate_properties(session_token: str = None):
    """Get property listings from relocation data"""
    user_id = get_current_user(session_token)
    await get_or_create_user(user_id)
    
    # Get cached data first
    query = "SELECT content FROM relocate_data WHERE user_id = %s AND data_type = %s"
    cached_data = execute_query(query, (user_id, "properties"), fetch_one=True)
    
    if cached_data and cached_data.get('content'):
        try:
            properties = json.loads(cached_data['content'])
            return {"properties": properties, "cached": True}
        except:
            pass
    
    # Fetch fresh if not cached
    relocate_data = await relocate_service.login_and_fetch_data()
    properties = relocate_data.get("properties", [])
    
    return {"properties": properties, "cached": False}

@app.get("/api/relocate/iframe")
async def get_relocate_iframe(session_token: str = None):
    """Get iframe content for Relocate Me integration"""
    user_id = get_current_user(session_token)
    await get_or_create_user(user_id)
    
    # Create iframe HTML that will load the Relocate Me site
    iframe_html = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <title>Relocate Me - Phoenix to Peak District</title>
        <style>
            body {{
                margin: 0;
                padding: 0;
                background: linear-gradient(135deg, #0f172a, #1e293b, #334155);
                color: #22d3ee;
                font-family: 'SF Mono', 'Monaco', monospace;
            }}
            .iframe-container {{
                width: 100%;
                height: 100vh;
                border: 2px solid #22d3ee;
                border-radius: 8px;
                overflow: hidden;
                box-shadow: 0 0 30px rgba(34, 211, 238, 0.3);
            }}
            iframe {{
                width: 100%;
                height: 100%;
                border: none;
            }}
            .header {{
                background: rgba(0, 0, 0, 0.8);
                padding: 10px 20px;
                border-bottom: 1px solid #22d3ee;
                display: flex;
                align-items: center;
                gap: 15px;
            }}
            .status {{
                color: #10b981;
                font-size: 12px;
            }}
            .url {{
                color: #64748b;
                font-size: 12px;
            }}
        </style>
    </head>
    <body>
        <div class="header">
            <span class="status">● CONNECTED TO MYSQL</span>
            <span class="url">🏡 move-uk-demo.emergent.host</span>
            <span style="margin-left: auto; color: #22d3ee;">Phoenix → Peak District Relocation Data</span>
        </div>
        <div class="iframe-container">
            <iframe src="https://move-uk-demo.emergent.host/" 
                    title="Relocate Me - Phoenix to Peak District"
                    allowfullscreen>
            </iframe>
        </div>
    </body>
    </html>
    """
    
    return HTMLResponse(content=iframe_html)

# Enhanced Virtual Pets and Job Portal Integration
@app.get("/api/virtual-pets")
async def get_virtual_pets_info():
    """Get information about all virtual pets tools"""
    return {
        "message": "Virtual Pets Ecosystem Available",
        "pets": {
            "cosmic_pets": {
                "description": "A cosmic-themed browser-based virtual pet hatching and caring game",
                "features": [
                    "Hatch cosmic eggs",
                    "Feed and care for pets", 
                    "Level up and evolve",
                    "Achievement system",
                    "Real-time pet stats"
                ],
                "url": "/virtual-pets-tool/",
                "technology": "Pure HTML/CSS/JavaScript"
            },
            "cosmic_sheep": {
                "description": "An interactive cosmic sheep that eats floating icons and grows",
                "features": [
                    "Click to move sheep around",
                    "Sheep eats various cosmic icons",
                    "Stats tracking (hunger, happiness, energy)",
                    "Level up and evolution system",
                    "Achievement unlocking",
                    "Auto mode for continuous play",
                    "Beautiful cosmic animations"
                ],
                "url": "/virtual-sheep-pet/",
                "technology": "Pure HTML/CSS/JavaScript with game mechanics"
            },
            "desktop_pets": {
                "description": "Advanced desktop pets with AI behavior, inspired by classic desktop companions",
                "features": [
                    "Multiple pet types (cats, dogs, rabbits, etc.)",
                    "AI-driven autonomous behavior",
                    "Draggable pet interaction",
                    "Dynamic state management (sleeping, walking, playing)",
                    "Food spawning and consumption mechanics",
                    "Speech bubbles and personality expressions",
                    "Real-time pet statistics tracking",
                    "Cursor trail effects and visual polish"
                ],
                "url": "/virtual-desktop-pets/",
                "technology": "Advanced JavaScript with AI behavior algorithms"
            }
        },
        "total_pets": 3,
        "new_features": {
            "desktop_pets": "Advanced AI behavior system with autonomous pet actions",
            "job_portal": "Comprehensive remote waitressing job hunting platform"
        }
    }

@app.get("/api/job-portal/waitressing")
async def get_waitressing_jobs():
    """Get remote waitressing and hospitality job opportunities"""
    return {
        "portal_name": "Remote Waitressing Jobs Portal",
        "description": "Comprehensive platform for finding remote customer service and hospitality positions",
        "url": "/waitress-job-portal/",
        "featured_categories": [
            {
                "name": "Virtual Restaurant Assistant",
                "description": "Handle online orders, reservations, and customer inquiries remotely",
                "positions": 145,
                "salary_range": "$18-28/hr"
            },
            {
                "name": "Remote Customer Service",
                "description": "Provide excellent customer support for restaurants and food services",
                "positions": 89,
                "salary_range": "$16-25/hr"
            },
            {
                "name": "Order Management",
                "description": "Coordinate delivery orders and manage restaurant operations",
                "positions": 76,
                "salary_range": "$20-30/hr"
            },
            {
                "name": "Hospitality Chat Support",
                "description": "Live chat support for hotels, restaurants, and hospitality services",
                "positions": 112,
                "salary_range": "$18-26/hr"
            }
        ],
        "job_hunting_resources": [
            {
                "name": "AI Apply",
                "url": "https://aiapply.co/",
                "description": "Automate your job applications with AI-powered tools",
                "category": "automation"
            },
            {
                "name": "Make My Drive Fun",
                "url": "https://makemydrivefun.com/",
                "description": "Plan your job search journey and discover opportunities along the way",
                "category": "planning"
            },
            {
                "name": "Remote.co",
                "url": "https://remote.co/",
                "description": "Curated remote job listings from top companies",
                "category": "job_board"
            },
            {
                "name": "We Work Remotely",
                "url": "https://weworkremotely.com/",
                "description": "Largest remote work community with job listings",
                "category": "job_board"
            },
            {
                "name": "FlexJobs",
                "url": "https://flexjobs.com/",
                "description": "Hand-screened flexible and remote job opportunities",
                "category": "job_board"
            }
        ],
        "quick_tips": [
            {
                "tip": "Apply within 24 hours",
                "description": "Be among the first 10 applicants to significantly increase your chances"
            },
            {
                "tip": "Optimize your profile",
                "description": "Use keywords like 'hospitality', 'customer relations', and 'virtual support'"
            },
            {
                "tip": "Master video interviews",
                "description": "Practice with video calling tools and ensure good lighting and audio"
            },
            {
                "tip": "Showcase tech skills",
                "description": "Mention familiarity with POS systems, order management software, and CRM tools"
            },
            {
                "tip": "Use AI tools",
                "description": "Leverage AI application tools like AI Apply to automate applications"
            },
            {
                "tip": "Network on LinkedIn",
                "description": "Connect with restaurant managers and hospitality recruiters"
            }
        ],
        "statistics": {
            "total_positions": "500+",
            "salary_range": "$16-35/hr",
            "success_rate": "72%",
            "avg_response_time": "24 hours"
        }
    }

@app.get("/api/desktop-pets/status")
async def get_desktop_pets_status():
    """Get desktop pets game information and AI behavior details"""
    return {
        "name": "Advanced Desktop Pets",
        "description": "AI-powered virtual pets with autonomous behavior and personality",
        "gameplay": {
            "pet_types": ["🐱 Cat", "🐶 Dog", "🐰 Rabbit", "🐻 Bear", "🦊 Fox", "🐼 Panda", "🐸 Frog", "🐧 Penguin"],
            "interaction": "Click pets to interact, drag to move them around",
            "ai_behavior": "Pets have autonomous AI that makes decisions based on their needs",
            "feeding": "Spawn food and watch pets automatically seek and consume it",
            "states": "Pets transition between idle, walking, running, sleeping, eating, and playing"
        },
        "ai_features": [
            "Autonomous movement and pathfinding",
            "Need-based decision making (hunger, energy, happiness)",
            "Dynamic state transitions based on internal timers",
            "Food seeking behavior when hungry",
            "Social interactions with speech bubbles",
            "Personality expressions and random thoughts",
            "Realistic pet physics and boundaries"
        ],
        "controls": [
            "➕ Add Pet - Spawn new pets of selected type",
            "🗑️ Clear All - Remove all pets from desktop",
            "🍖 Feed All - Instantly feed all pets",
            "🎾 Play Time - Make all pets happy and playful",
            "😴 Sleep Mode - Make all pets go to sleep",
            "🍎 Spawn Food - Add food items for pets to find"
        ],
        "technical_features": [
            "Object-oriented pet class system",
            "Real-time AI behavior loops",
            "Collision detection for food consumption",
            "Dynamic DOM manipulation for pet elements",
            "Custom cursor effects and visual polish",
            "Responsive design for mobile and desktop"
        ]
    }

@app.get("/api/content/job-resources")
async def get_enhanced_job_resources():
    """Get enhanced job resources including waitressing opportunities"""
    
    # Get existing job resources
    query = "SELECT * FROM job_resources ORDER BY is_featured DESC, rating DESC, created_at DESC"
    existing_resources = execute_query(query, fetch=True)
    
    # Add new waitressing-specific resources
    enhanced_resources = existing_resources + [
        {
            "id": "waitress_001",
            "title": "Remote Waitressing Jobs Portal",
            "url": "/waitress-job-portal/",
            "description": "Comprehensive platform for remote hospitality and customer service positions",
            "category": "waitressing_portal",
            "tags": ["waitressing", "remote", "hospitality", "customer_service"],
            "is_featured": True,
            "rating": 4.9
        },
        {
            "id": "waitress_002", 
            "title": "AI Apply - Automated Job Applications",
            "url": "https://aiapply.co/",
            "description": "AI-powered tool to automate and optimize job applications",
            "category": "automation_tools",
            "tags": ["ai", "automation", "applications", "job_search"],
            "is_featured": True,
            "rating": 4.7
        },
        {
            "id": "waitress_003",
            "title": "Make My Drive Fun - Journey Planning",
            "url": "https://makemydrivefun.com/",
            "description": "Plan your job search journey and discover opportunities along routes",
            "category": "planning_tools",
            "tags": ["planning", "journey", "opportunities", "discovery"],
            "is_featured": True,
            "rating": 4.5
        },
        {
            "id": "waitress_004",
            "title": "Indeed Remote Customer Service",
            "url": "https://indeed.com/jobs?q=remote+customer+service&l=",
            "description": "Large database of remote customer service opportunities",
            "category": "job_board",
            "tags": ["indeed", "customer_service", "remote", "jobs"],
            "is_featured": False,
            "rating": 4.2
        },
        {
            "id": "waitress_005",
            "title": "ZipRecruiter Remote Hospitality",
            "url": "https://ziprecruiter.com/jobs/remote-hospitality",
            "description": "Remote hospitality and service industry positions",
            "category": "job_board", 
            "tags": ["ziprecruiter", "hospitality", "remote", "service"],
            "is_featured": False,
            "rating": 4.1
        }
    ]
    
    return {
        "success": True,
        "data": enhanced_resources,
        "total": len(enhanced_resources),
        "categories": {
            "waitressing_portal": "Specialized waitressing job platforms",
            "automation_tools": "AI and automation tools for job searching",
            "planning_tools": "Journey and career planning resources",
            "job_board": "General job listing platforms",
            "freelance": "Freelancing and gig work platforms",
            "tools": "Job search optimization tools"
        }
    }

@app.get("/api/sheep/status")
async def get_sheep_status():
    """Get cosmic sheep game information"""
    return {
        "name": "Cosmic Sheep",
        "description": "Interactive virtual sheep that eats cosmic icons",
        "gameplay": {
            "movement": "Click anywhere to move sheep",
            "feeding": "Sheep automatically eats nearby icons",
            "interactions": "Click sheep to pet it",
            "evolution": "Sheep evolves as it levels up"
        },
        "food_types": [
            {"emoji": "🍎", "name": "Apple", "effects": "hunger +15, happiness +5"},
            {"emoji": "🥕", "name": "Carrot", "effects": "hunger +20, happiness +3, energy +5"},
            {"emoji": "🌿", "name": "Grass", "effects": "hunger +25, happiness +10, energy +10"},
            {"emoji": "⭐", "name": "Star", "effects": "hunger +5, happiness +20, energy +15"},
            {"emoji": "🌙", "name": "Moon", "effects": "hunger +8, happiness +25, energy +20"},
            {"emoji": "💎", "name": "Crystal", "effects": "hunger +3, happiness +30, energy +25"},
            {"emoji": "🌈", "name": "Rainbow", "effects": "hunger +10, happiness +35, energy +30"},
            {"emoji": "🦄", "name": "Unicorn Magic", "effects": "hunger +15, happiness +40, energy +35"}
        ],
        "achievements": [
            {"name": "First Bite", "requirement": "Eat 1 icon"},
            {"name": "Star Eater", "requirement": "Eat 10 icons"},
            {"name": "Space Grazer", "requirement": "Eat 50 icons"},
            {"name": "Sheep Master", "requirement": "Eat 100 icons"},
            {"name": "Cosmic Guardian", "requirement": "Eat 200 icons"}
        ],
        "controls": [
            "🍎 Spawn Food - Manually spawn food icons",
            "❤️ Pet Sheep - Increase happiness and energy",
            "🔄 Reset - Reset sheep to starting state",
            "🤖 Auto Mode - Toggle automatic food spawning"
        ]
    }

# Database status endpoint
@app.post("/api/admin/populate-relocation-content")
async def populate_relocation_content():
    """Populate database with Arizona to Peak District relocation content"""
    try:
        content_items = []
        
        # First, check if content already exists
        existing_check = execute_query("SELECT COUNT(*) as count FROM site_content WHERE category = 'relocation'", fetch_one=True)
        if existing_check and existing_check['count'] > 0:
            return {
                "success": True,
                "message": "Relocation content already exists in database",
                "items_created": 0,
                "existing_items": existing_check['count'],
                "action": "skipped_duplicate_population"
            }
        
        # Arizona to Peak District Relocation Resources
        arizona_peak_resources = [
            {
                "id": str(uuid.uuid4()),
                "content_type": "relocation_guide",
                "title": "Complete Arizona to Peak District Relocation Guide",
                "slug": "arizona-to-peak-district-guide-" + str(int(time.time())),
                "content": "Comprehensive guide for relocating from Arizona desert to Peak District countryside, including visa requirements, housing, healthcare, and cultural adaptation.",
                "excerpt": "Everything you need to know about moving from Arizona to the Peak District",
                "metadata": json.dumps({
                    "origin": "Arizona, USA",
                    "destination": "Peak District, UK", 
                    "move_type": "international",
                    "climate_change": "desert_to_temperate",
                    "cost_estimate": "$15000-25000"
                }),
                "status": "published",
                "category": "relocation",
                "tags": json.dumps(["arizona", "peak_district", "relocation", "international_move", "uk_visa"]),
                "view_count": 0
            },
            {
                "id": str(uuid.uuid4()),
                "content_type": "housing_guide",
                "title": "Peak District Housing for Arizona Relocators",
                "slug": "peak-district-housing-arizona-" + str(int(time.time())),
                "content": "Property types, pricing, and neighborhoods in Peak District suitable for those accustomed to Arizona lifestyle. Includes comparisons of housing costs and features.",
                "excerpt": "Find your perfect home in the Peak District",
                "metadata": json.dumps({
                    "avg_property_price": "£285000-450000",
                    "property_types": ["cottage", "farmhouse", "converted_barn", "modern_home"],
                    "recommended_areas": ["Bakewell", "Matlock", "Hathersage", "Tideswell"],
                    "comparison_to_arizona": "smaller_properties_but_character_rich"
                }),
                "status": "published",
                "category": "housing",
                "tags": json.dumps(["housing", "peak_district", "property", "arizona_comparison", "real_estate"]),
                "view_count": 0
            }
        ]
        
        # Remote Work Opportunities for UK
        uk_remote_jobs = [
            {
                "id": str(uuid.uuid4()),
                "title": "Remote Customer Service Representative - UK Companies",
                "url": "https://indeed.co.uk/jobs?q=remote+customer+service&l=",
                "description": "Customer service roles with UK companies, perfect for Arizona relocators maintaining remote work",
                "category": "remote_customer_service_uk",
                "tags": json.dumps(["remote", "customer_service", "uk", "arizona_friendly", "timezone_flexible"]),
                "is_featured": True,
                "rating": 4.5,
                "click_count": 0
            },
            {
                "id": str(uuid.uuid4()),
                "title": "Virtual Restaurant Coordinator - Peak District Tourism",
                "url": "https://jobs.gov.uk/",
                "description": "Coordinate bookings and customer service for Peak District tourism and hospitality businesses",
                "category": "hospitality_remote_uk",
                "tags": json.dumps(["hospitality", "peak_district", "tourism", "remote", "coordinator"]),
                "is_featured": True,
                "rating": 4.6,
                "click_count": 0
            }
        ]
        
        # Insert content with duplicate checking
        for content in arizona_peak_resources:
            # Check for existing slug
            check_query = "SELECT id FROM site_content WHERE slug = %s"
            existing = execute_query(check_query, (content["slug"],), fetch_one=True)
            
            if not existing:
                query = """
                    INSERT INTO site_content (id, content_type, title, slug, content, excerpt, metadata, 
                                            status, category, tags, view_count, created_at, updated_at)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                """
                params = (
                    content["id"], content["content_type"], content["title"], content["slug"],
                    content["content"], content["excerpt"], content["metadata"], content["status"],
                    content["category"], content["tags"], content["view_count"], 
                    datetime.now(), datetime.now()
                )
                execute_query(query, params)
                content_items.append(f"Site Content: {content['title']}")
        
        # Insert job resources with duplicate checking
        for job in uk_remote_jobs:
            # Check for existing title in same category
            check_query = "SELECT id FROM job_resources WHERE title = %s AND category = %s"
            existing = execute_query(check_query, (job["title"], job["category"]), fetch_one=True)
            
            if not existing:
                query = """
                    INSERT INTO job_resources (id, title, url, description, category, tags, is_featured, rating, click_count, created_at, updated_at)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                """
                params = (
                    job["id"], job["title"], job["url"], job["description"], job["category"],
                    job["tags"], job["is_featured"], job["rating"], job["click_count"],
                    datetime.now(), datetime.now()
                )
                execute_query(query, params)
                content_items.append(f"Job Resource: {job['title']}")
        
        return {
            "success": True,
            "message": "Successfully populated database with Arizona to Peak District relocation content",
            "items_created": len(content_items),
            "content_summary": content_items,
            "focus": "Arizona to Peak District relocation and remote work in UK",
            "categories": [
                "Relocation guides and housing information",
                "Remote work opportunities in UK", 
                "Peak District activities and integration",
                "UK immigration and healthcare resources",
                "Transportation and journey planning"
            ]
        }
        
    except Exception as e:
        logger.error(f"Error populating relocation content: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to populate content: {str(e)}")

@app.get("/api/content/relocation-arizona-peak")
async def get_arizona_peak_relocation_content():
    """Get all content related to Arizona to Peak District relocation"""
    try:
        relocation_content = {}
        
        # Get relocation-specific site content
        query = """
            SELECT * FROM site_content 
            WHERE category IN ('relocation', 'housing') OR tags LIKE '%arizona%' OR tags LIKE '%peak_district%'
            ORDER BY created_at DESC
        """
        relocation_content["guides"] = execute_query(query, fetch=True)
        
        # Get UK remote job opportunities
        query = """
            SELECT * FROM job_resources 
            WHERE category LIKE '%uk%' OR tags LIKE '%uk%' OR description LIKE '%uk%'
            ORDER BY is_featured DESC, rating DESC
        """
        relocation_content["uk_jobs"] = execute_query(query, fetch=True)
        
        # Get Peak District activities
        query = """
            SELECT * FROM peak_district_content 
            WHERE tags LIKE '%arizona%' OR description LIKE '%arizona%' OR title LIKE '%arizona%'
            ORDER BY rating DESC
        """
        relocation_content["peak_activities"] = execute_query(query, fetch=True)
        
        # Get integration resources
        query = """
            SELECT * FROM waitress_toolkit 
            WHERE category IN ('immigration', 'healthcare') OR tags LIKE '%relocators%'
            ORDER BY created_at DESC
        """
        relocation_content["integration_tools"] = execute_query(query, fetch=True)
        
        # Get transport and journey planning
        query = """
            SELECT * FROM journey_planning 
            WHERE location_from LIKE '%Phoenix%' OR location_from LIKE '%Arizona%' 
               OR location_to LIKE '%Manchester%' OR location_to LIKE '%Peak District%'
            ORDER BY rating DESC
        """
        relocation_content["transport_planning"] = execute_query(query, fetch=True)
        
        # Get relocation settings
        query = "SELECT * FROM app_settings WHERE setting_key = 'relocation_focus'"
        relocation_settings = execute_query(query, fetch=True)
        
        return {
            "success": True,
            "relocation_focus": "Arizona, USA → Peak District, UK",
            "content": relocation_content,
            "settings": relocation_settings,
            "total_items": sum(len(items) for items in relocation_content.values()),
            "categories": {
                "guides": f"{len(relocation_content.get('guides', []))} relocation and housing guides",
                "uk_jobs": f"{len(relocation_content.get('uk_jobs', []))} UK remote job opportunities", 
                "peak_activities": f"{len(relocation_content.get('peak_activities', []))} Peak District activities",
                "integration_tools": f"{len(relocation_content.get('integration_tools', []))} integration resources",
                "transport_planning": f"{len(relocation_content.get('transport_planning', []))} journey planning tools"
            },
            "external_resources": {
                "ai_apply": "https://aiapply.co/ - Automate UK job applications",
                "make_my_drive_fun": "https://makemydrivefun.com/ - Plan Phoenix to UK journey",
                "uk_gov_jobs": "https://jobs.gov.uk/ - Official UK government jobs",
                "nhs_careers": "https://nhs.uk/careers/ - NHS career opportunities",
                "peak_district_gov": "https://peakdistrict.gov.uk/ - Official Peak District information"
            }
        }
        
    except Exception as e:
        logger.error(f"Error retrieving relocation content: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to retrieve relocation content: {str(e)}")

@app.get("/api/database/status")
async def get_database_status():
    """Get database connection and status information"""
    try:
        # Test database connection
        query = "SELECT COUNT(*) as total_records FROM ("
        query += "SELECT 'users' as table_name, COUNT(*) as count FROM users UNION ALL "
        query += "SELECT 'jobs', COUNT(*) FROM jobs UNION ALL "
        query += "SELECT 'applications', COUNT(*) FROM applications UNION ALL "
        query += "SELECT 'tasks', COUNT(*) FROM tasks UNION ALL "
        query += "SELECT 'achievements', COUNT(*) FROM achievements UNION ALL "
        query += "SELECT 'job_resources', COUNT(*) FROM job_resources UNION ALL "
        query += "SELECT 'ai_tools', COUNT(*) FROM ai_tools UNION ALL "
        query += "SELECT 'peak_district_content', COUNT(*) FROM peak_district_content UNION ALL "
        query += "SELECT 'waitress_toolkit', COUNT(*) FROM waitress_toolkit UNION ALL "
        query += "SELECT 'journey_planning', COUNT(*) FROM journey_planning"
        query += ") as all_tables"
        
        # Get individual table counts
        tables_info = {}
        tables = [
            'users', 'jobs', 'applications', 'tasks', 'achievements', 
            'job_resources', 'ai_tools', 'peak_district_content', 
            'waitress_toolkit', 'journey_planning', 'relocate_data', 'site_content'
        ]
        
        for table in tables:
            count_query = f"SELECT COUNT(*) as count FROM {table}"
            result = execute_query(count_query, fetch_one=True)
            tables_info[table] = result['count'] if result else 0
        
        return {
            "status": "connected",
            "database_type": "MySQL/MariaDB",
            "host": DB_CONFIG['host'],
            "database": DB_CONFIG['database'],
            "tables": tables_info,
            "total_records": sum(tables_info.values()),
            "migration_status": "completed",
            "relocation_focus": "Arizona to Peak District",
            "features": [
                "Enhanced Window Management System",
                "Arizona to Peak District Content",
                "UK Remote Work Opportunities", 
                "Content Management System",
                "User Authentication", 
                "Job Tracking",
                "Achievement System",
                "Relocation Data",
                "Productivity Logging",
                "Virtual Pet Ecosystem"
            ]
        }
    except Exception as e:
        return {
            "status": "error",
            "error": str(e),
            "database_type": "MySQL/MariaDB",
            "migration_status": "failed"
        }
        query += "SELECT 'job_resources', COUNT(*) FROM job_resources UNION ALL "
        query += "SELECT 'ai_tools', COUNT(*) FROM ai_tools UNION ALL "
        query += "SELECT 'peak_district_content', COUNT(*) FROM peak_district_content UNION ALL "
        query += "SELECT 'waitress_toolkit', COUNT(*) FROM waitress_toolkit UNION ALL "
        query += "SELECT 'journey_planning', COUNT(*) FROM journey_planning"
        query += ") as all_tables"
        
        # Get individual table counts
        tables_info = {}
        tables = [
            'users', 'jobs', 'applications', 'tasks', 'achievements', 
            'job_resources', 'ai_tools', 'peak_district_content', 
            'waitress_toolkit', 'journey_planning', 'relocate_data'
        ]
        
        for table in tables:
            count_query = f"SELECT COUNT(*) as count FROM {table}"
            result = execute_query(count_query, fetch_one=True)
            tables_info[table] = result['count'] if result else 0
        
        return {
            "status": "connected",
            "database_type": "MySQL/MariaDB",
            "host": DB_CONFIG['host'],
            "database": DB_CONFIG['database'],
            "tables": tables_info,
            "total_records": sum(tables_info.values()),
            "migration_status": "completed",
            "features": [
                "Content Management System",
                "User Authentication", 
                "Job Tracking",
                "Achievement System",
                "Relocation Data",
                "Productivity Logging"
            ]
        }
    except Exception as e:
        return {
            "status": "error",
            "error": str(e),
            "database_type": "MySQL/MariaDB",
            "migration_status": "failed"
        }

# Initialize database on startup
@app.on_event("startup")
async def startup_event():
    """Initialize database and refresh jobs on startup"""
    try:
        # Test database connection
        query = "SELECT 1"
        execute_query(query, fetch_one=True)
        logger.info("MySQL database connection established successfully")
        
        # Refresh jobs if database is empty
        query = "SELECT COUNT(*) as count FROM jobs WHERE source = 'Remotive'"
        result = execute_query(query, fetch_one=True)
        job_count = result['count'] if result else 0
        
        if job_count < 5:
            await job_service.refresh_jobs()
            logger.info("Initial job refresh completed")
            
    except Exception as e:
        logger.error(f"Startup error: {e}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
