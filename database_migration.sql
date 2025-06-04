-- ThriveRemoteOS MySQL Database Schema
-- Migration from MongoDB to MySQL with enhanced content management

USE thriveremote_db;

-- Users table
CREATE TABLE users (
    id VARCHAR(36) PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(255),
    password_hash VARCHAR(255) NOT NULL,
    created_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_active DATETIME DEFAULT CURRENT_TIMESTAMP,
    total_sessions INT DEFAULT 0,
    productivity_score INT DEFAULT 0,
    daily_streak INT DEFAULT 0,
    last_streak_date DATE,
    savings_goal DECIMAL(10,2) DEFAULT 5000.00,
    current_savings DECIMAL(10,2) DEFAULT 0.00,
    settings JSON,
    achievements_unlocked INT DEFAULT 0,
    pong_high_score INT DEFAULT 0,
    commands_executed INT DEFAULT 0,
    easter_eggs_found INT DEFAULT 0,
    INDEX idx_username (username),
    INDEX idx_last_active (last_active)
);

-- Jobs table
CREATE TABLE jobs (
    id VARCHAR(36) PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    company VARCHAR(255) NOT NULL,
    location VARCHAR(255),
    salary VARCHAR(255),
    type VARCHAR(100),
    description TEXT,
    skills JSON,
    posted_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    application_status VARCHAR(50) DEFAULT 'not_applied',
    source VARCHAR(100) DEFAULT 'API',
    url TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_company (company),
    INDEX idx_location (location),
    INDEX idx_posted_date (posted_date),
    INDEX idx_application_status (application_status)
);

-- Applications table
CREATE TABLE applications (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    job_id VARCHAR(36) NOT NULL,
    job_title VARCHAR(500),
    company VARCHAR(255),
    status VARCHAR(50) DEFAULT 'applied',
    applied_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    follow_up_date DATETIME,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_job_id (job_id),
    INDEX idx_status (status),
    INDEX idx_applied_date (applied_date)
);

-- Tasks table
CREATE TABLE tasks (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'todo',
    priority VARCHAR(20) DEFAULT 'medium',
    category VARCHAR(100),
    due_date DATE,
    created_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    completed_date DATETIME,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_status (status),
    INDEX idx_priority (priority),
    INDEX idx_category (category),
    INDEX idx_due_date (due_date)
);

-- Achievements table
CREATE TABLE achievements (
    id VARCHAR(100) NOT NULL,
    user_id VARCHAR(36) NOT NULL,
    achievement_type VARCHAR(100),
    title VARCHAR(255),
    description TEXT,
    icon VARCHAR(10),
    unlocked BOOLEAN DEFAULT FALSE,
    unlock_date DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id, user_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_achievement_type (achievement_type),
    INDEX idx_unlocked (unlocked)
);

-- User sessions table
CREATE TABLE user_sessions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    token VARCHAR(255) UNIQUE NOT NULL,
    user_id VARCHAR(36) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_used DATETIME DEFAULT CURRENT_TIMESTAMP,
    active BOOLEAN DEFAULT TRUE,
    expires_at DATETIME,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_token (token),
    INDEX idx_user_id (user_id),
    INDEX idx_active (active),
    INDEX idx_expires_at (expires_at)
);

-- Productivity logs table
CREATE TABLE productivity_logs (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    action VARCHAR(255) NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    points INT DEFAULT 0,
    metadata JSON,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_action (action),
    INDEX idx_timestamp (timestamp)
);

-- Relocate data table - Enhanced for better content management
CREATE TABLE relocate_data (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36),
    data_type VARCHAR(100) NOT NULL,
    title VARCHAR(500),
    content JSON,
    source VARCHAR(255) DEFAULT 'move_uk_demo',
    created_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_public BOOLEAN DEFAULT FALSE,
    tags JSON,
    category VARCHAR(100),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_user_id (user_id),
    INDEX idx_data_type (data_type),
    INDEX idx_category (category),
    INDEX idx_is_public (is_public),
    INDEX idx_created_date (created_date)
);

-- Content management tables for better organization

-- Site content table
CREATE TABLE site_content (
    id VARCHAR(36) PRIMARY KEY,
    content_type VARCHAR(100) NOT NULL, -- 'page', 'post', 'resource', 'link'
    title VARCHAR(500) NOT NULL,
    slug VARCHAR(255) UNIQUE,
    content TEXT,
    excerpt TEXT,
    metadata JSON,
    status VARCHAR(50) DEFAULT 'published', -- 'draft', 'published', 'archived'
    author_id VARCHAR(36),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    published_at DATETIME,
    category VARCHAR(100),
    tags JSON,
    view_count INT DEFAULT 0,
    FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_content_type (content_type),
    INDEX idx_slug (slug),
    INDEX idx_status (status),
    INDEX idx_category (category),
    INDEX idx_published_at (published_at),
    INDEX idx_view_count (view_count)
);

-- Job links and resources
CREATE TABLE job_resources (
    id VARCHAR(36) PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    url TEXT NOT NULL,
    description TEXT,
    category VARCHAR(100), -- 'job_board', 'freelance', 'remote_company', 'tools'
    tags JSON,
    is_featured BOOLEAN DEFAULT FALSE,
    rating DECIMAL(3,2),
    click_count INT DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_category (category),
    INDEX idx_is_featured (is_featured),
    INDEX idx_rating (rating),
    INDEX idx_click_count (click_count)
);

-- AI tools and resources
CREATE TABLE ai_tools (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    url TEXT NOT NULL,
    description TEXT,
    category VARCHAR(100), -- 'writing', 'coding', 'design', 'productivity'
    pricing VARCHAR(100), -- 'free', 'freemium', 'paid'
    features JSON,
    tags JSON,
    rating DECIMAL(3,2),
    is_featured BOOLEAN DEFAULT FALSE,
    click_count INT DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_category (category),
    INDEX idx_pricing (pricing),
    INDEX idx_is_featured (is_featured),
    INDEX idx_rating (rating)
);

-- Peak District content and images
CREATE TABLE peak_district_content (
    id VARCHAR(36) PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    content_type VARCHAR(100), -- 'image', 'article', 'location', 'activity'
    description TEXT,
    image_url TEXT,
    location VARCHAR(255),
    coordinates JSON, -- lat, lng
    tags JSON,
    season VARCHAR(50), -- 'spring', 'summer', 'autumn', 'winter', 'all'
    difficulty VARCHAR(50), -- 'easy', 'moderate', 'hard'
    rating DECIMAL(3,2),
    view_count INT DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_content_type (content_type),
    INDEX idx_location (location),
    INDEX idx_season (season),
    INDEX idx_difficulty (difficulty),
    INDEX idx_rating (rating)
);

-- Waitress toolkit resources
CREATE TABLE waitress_toolkit (
    id VARCHAR(36) PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    resource_type VARCHAR(100), -- 'template', 'guide', 'tool', 'script'
    content TEXT,
    file_url TEXT,
    description TEXT,
    category VARCHAR(100), -- 'customer_service', 'pos_systems', 'scheduling', 'training'
    tags JSON,
    is_premium BOOLEAN DEFAULT FALSE,
    download_count INT DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_resource_type (resource_type),
    INDEX idx_category (category),
    INDEX idx_is_premium (is_premium),
    INDEX idx_download_count (download_count)
);

-- Journey planning links and resources
CREATE TABLE journey_planning (
    id VARCHAR(36) PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    url TEXT NOT NULL,
    description TEXT,
    category VARCHAR(100), -- 'transport', 'accommodation', 'food', 'activities', 'weather'
    location_from VARCHAR(255),
    location_to VARCHAR(255),
    transport_type VARCHAR(100), -- 'car', 'train', 'bus', 'plane', 'walking'
    tags JSON,
    rating DECIMAL(3,2),
    click_count INT DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_category (category),
    INDEX idx_location_from (location_from),
    INDEX idx_location_to (location_to),
    INDEX idx_transport_type (transport_type),
    INDEX idx_rating (rating)
);

-- Content settings and configurations
CREATE TABLE app_settings (
    id VARCHAR(36) PRIMARY KEY,
    setting_key VARCHAR(255) UNIQUE NOT NULL,
    setting_value JSON,
    setting_type VARCHAR(100), -- 'string', 'number', 'boolean', 'json', 'array'
    description TEXT,
    is_public BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_setting_key (setting_key),
    INDEX idx_setting_type (setting_type),
    INDEX idx_is_public (is_public)
);

-- Insert sample content data
INSERT INTO job_resources (id, title, url, description, category, tags, is_featured, rating) VALUES
(UUID(), 'Remote.co - Remote Jobs', 'https://remote.co/', 'Curated remote job listings from top companies', 'job_board', '["remote", "jobs", "curated"]', TRUE, 4.5),
(UUID(), 'We Work Remotely', 'https://weworkremotely.com/', 'Largest remote work community with job listings', 'job_board', '["remote", "community", "jobs"]', TRUE, 4.3),
(UUID(), 'AngelList Jobs', 'https://angel.co/jobs', 'Startup jobs and remote opportunities', 'job_board', '["startup", "jobs", "remote"]', TRUE, 4.1),
(UUID(), 'AI Apply', 'https://aiapply.co/', 'AI-powered job application assistance', 'tools', '["ai", "applications", "automation"]', TRUE, 4.2),
(UUID(), 'Upwork', 'https://upwork.com/', 'Global freelancing platform', 'freelance', '["freelance", "global", "projects"]', FALSE, 4.0),
(UUID(), 'Fiverr', 'https://fiverr.com/', 'Marketplace for digital services', 'freelance', '["freelance", "services", "gigs"]', FALSE, 3.9);

INSERT INTO ai_tools (id, name, url, description, category, pricing, features, rating, is_featured) VALUES
(UUID(), 'ChatGPT', 'https://chat.openai.com/', 'Advanced AI assistant for various tasks', 'productivity', 'freemium', '["text_generation", "coding", "analysis"]', 4.8, TRUE),
(UUID(), 'GitHub Copilot', 'https://github.com/features/copilot', 'AI pair programmer', 'coding', 'paid', '["code_completion", "suggestions", "documentation"]', 4.6, TRUE),
(UUID(), 'Midjourney', 'https://midjourney.com/', 'AI image generation platform', 'design', 'paid', '["image_generation", "art", "design"]', 4.5, TRUE),
(UUID(), 'Notion AI', 'https://notion.so/', 'AI-powered productivity workspace', 'productivity', 'freemium', '["writing", "organization", "collaboration"]', 4.4, FALSE);

INSERT INTO peak_district_content (id, title, content_type, description, location, tags, season, difficulty, rating) VALUES
(UUID(), 'Kinder Scout Plateau', 'location', 'The highest point in the Peak District with stunning moorland views', 'Edale, Derbyshire', '["hiking", "moorland", "highest_peak"]', 'all', 'moderate', 4.7),
(UUID(), 'Chatsworth House Gardens', 'location', 'Historic house with magnificent gardens and parkland', 'Bakewell, Derbyshire', '["historic", "gardens", "family_friendly"]', 'all', 'easy', 4.6),
(UUID(), 'Monsal Trail', 'activity', 'Traffic-free cycling and walking route through beautiful countryside', 'Monsal Head, Derbyshire', '["cycling", "walking", "family_friendly"]', 'all', 'easy', 4.5),
(UUID(), 'Peak District Winter Photography', 'image', 'Stunning winter landscapes across the Peak District', 'Various locations', '["photography", "winter", "landscapes"]', 'winter', 'easy', 4.8);

INSERT INTO waitress_toolkit (id, title, resource_type, description, category, tags) VALUES
(UUID(), 'Customer Service Excellence Guide', 'guide', 'Comprehensive guide to providing exceptional customer service', 'customer_service', '["guide", "service", "excellence"]'),
(UUID(), 'POS System Comparison Chart', 'template', 'Compare different Point of Sale systems for restaurants', 'pos_systems', '["comparison", "pos", "restaurants"]'),
(UUID(), 'Staff Scheduling Template', 'template', 'Excel template for managing restaurant staff schedules', 'scheduling', '["template", "scheduling", "staff"]'),
(UUID(), 'Order Taking Best Practices', 'guide', 'Tips and techniques for efficient order taking', 'customer_service', '["orders", "efficiency", "service"]');

INSERT INTO journey_planning (id, title, url, description, category, location_from, location_to, transport_type, rating) VALUES
(UUID(), 'Make My Drive Fun', 'https://makemydrivefun.com', 'Plan exciting stops and activities for your road trip', 'activities', 'Phoenix, AZ', 'Peak District, UK', 'car', 4.3),
(UUID(), 'National Rail Enquiries', 'https://nationalrail.co.uk/', 'UK train timetables and booking', 'transport', 'Manchester', 'Sheffield', 'train', 4.1),
(UUID(), 'Weather Underground', 'https://wunderground.com/', 'Detailed weather forecasts and conditions', 'weather', 'Any', 'Peak District', 'car', 4.4),
(UUID(), 'YHA Hostels', 'https://yha.org.uk/', 'Budget accommodation across the UK', 'accommodation', 'Any', 'Peak District', 'walking', 4.2);

INSERT INTO app_settings (id, setting_key, setting_value, setting_type, description, is_public) VALUES
(UUID(), 'site_title', '"ThriveRemoteOS - Quantum Consciousness Portal"', 'string', 'Main site title', TRUE),
(UUID(), 'max_jobs_per_page', '50', 'number', 'Maximum jobs to display per page', FALSE),
(UUID(), 'enable_achievements', 'true', 'boolean', 'Enable achievement system', FALSE),
(UUID(), 'default_savings_goal', '5000.00', 'number', 'Default savings goal for new users', FALSE),
(UUID(), 'featured_categories', '["remote_work", "ai_tools", "peak_district"]', 'array', 'Featured content categories', TRUE);
