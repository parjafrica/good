-- Granada OS Admin Database Comprehensive Seed Data
-- This file creates realistic test data for the admin system

-- Enhanced user data with real African NGO and organization profiles
INSERT INTO users (id, email, first_name, last_name, hashed_password, user_type, is_active, credits, country, sector, organization_type, full_name, is_banned) VALUES 
-- Admin accounts
(gen_random_uuid(), 'admin@granada.com', 'System', 'Administrator', '$2b$12$LCruCr4mRROGt3GS0KwBWOTf8eFx1K2CstOJNSFe7LzJwTz8hwdMu', 'admin', true, 10000, 'Global', 'Technology', 'platform', 'System Administrator', false),
(gen_random_uuid(), 'james.mwangi@granada.com', 'James', 'Mwangi', '$2b$12$LCruCr4mRROGt3GS0KwBWOTf8eFx1K2CstOJNSFe7LzJwTz8hwdMu', 'admin', true, 8000, 'Kenya', 'Development', 'platform', 'James Mwangi', false),

-- NGO and Foundation users (donors)
(gen_random_uuid(), 'director@amrefhealth.org', 'Sarah', 'Kones', '$2b$12$LCruCr4mRROGt3GS0KwBWOTf8eFx1K2CstOJNSFe7LzJwTz8hwdMu', 'donor', true, 5000, 'Kenya', 'Health', 'large_ngo', 'Sarah Kones', false),
(gen_random_uuid(), 'grants@actionaid.org', 'Michael', 'Ssemakula', '$2b$12$LCruCr4mRROGt3GS0KwBWOTf8eFx1K2CstOJNSFe7LzJwTz8hwdMu', 'donor', true, 7500, 'Uganda', 'Poverty', 'international_ngo', 'Michael Ssemakula', false),
(gen_random_uuid(), 'funding@oxfam.org.tz', 'Grace', 'Mapunda', '$2b$12$LCruCr4mRROGt3GS0KwBWOTf8eFx1K2CstOJNSFe7LzJwTz8hwdMu', 'donor', true, 6000, 'Tanzania', 'Water', 'international_ngo', 'Grace Mapunda', false),
(gen_random_uuid(), 'programs@careintl.rw', 'Jean', 'Uwimana', '$2b$12$LCruCr4mRROGt3GS0KwBWOTf8eFx1K2CstOJNSFe7LzJwTz8hwdMu', 'donor', true, 4500, 'Rwanda', 'Education', 'international_ngo', 'Jean Uwimana', false),
(gen_random_uuid(), 'coordinator@wvi.org', 'Peter', 'Okello', '$2b$12$LCruCr4mRROGt3GS0KwBWOTf8eFx1K2CstOJNSFe7LzJwTz8hwdMu', 'donor', true, 8000, 'South Sudan', 'Child Protection', 'international_ngo', 'Peter Okello', false),

-- University and Research institutions
(gen_random_uuid(), 'research@mak.ac.ug', 'Dr. Agnes', 'Nabukeera', '$2b$12$LCruCr4mRROGt3GS0KwBWOTf8eFx1K2CstOJNSFe7LzJwTz8hwdMu', 'student', true, 3000, 'Uganda', 'Research', 'university', 'Dr. Agnes Nabukeera', false),
(gen_random_uuid(), 'grants@uon.ac.ke', 'Prof. David', 'Kiprotich', '$2b$12$LCruCr4mRROGt3GS0KwBWOTf8eFx1K2CstOJNSFe7LzJwTz8hwdMu', 'student', true, 2500, 'Kenya', 'Agriculture', 'university', 'Prof. David Kiprotich', false),
(gen_random_uuid(), 'innovation@nr.ac.rw', 'Dr. Marie', 'Uwizeyimana', '$2b$12$LCruCr4mRROGt3GS0KwBWOTf8eFx1K2CstOJNSFe7LzJwTz8hwdMu', 'student', true, 2000, 'Rwanda', 'Technology', 'university', 'Dr. Marie Uwizeyimana', false),

-- Small local NGOs and community organizations
(gen_random_uuid(), 'info@slumcodeafrica.org', 'Brian', 'Gitta', '$2b$12$LCruCr4mRROGt3GS0KwBWOTf8eFx1K2CstOJNSFe7LzJwTz8hwdMu', 'donor', true, 1500, 'Uganda', 'Technology', 'small_ngo', 'Brian Gitta', false),
(gen_random_uuid(), 'director@kirahealth.org', 'Elizabeth', 'Namukwaya', '$2b$12$LCruCr4mRROGt3GS0KwBWOTf8eFx1K2CstOJNSFe7LzJwTz8hwdMu', 'donor', true, 2200, 'Uganda', 'Health', 'small_ngo', 'Elizabeth Namukwaya', false),
(gen_random_uuid(), 'coordinator@greenbeltmovement.org', 'Joyce', 'Wanjiku', '$2b$12$LCruCr4mRROGt3GS0KwBWOTf8eFx1K2CstOJNSFe7LzJwTz8hwdMu', 'donor', true, 1800, 'Kenya', 'Environment', 'small_ngo', 'Joyce Wanjiku', false),

-- Students and researchers
(gen_random_uuid(), 'student1@strathmore.edu', 'Collins', 'Mutai', '$2b$12$LCruCr4mRROGt3GS0KwBWOTf8eFx1K2CstOJNSFe7LzJwTz8hwdMu', 'student', true, 1000, 'Kenya', 'Engineering', 'university', 'Collins Mutai', false),
(gen_random_uuid(), 'researcher@aau.org', 'Fatima', 'Hassan', '$2b$12$LCruCr4mRROGt3GS0KwBWOTf8eFx1K2CstOJNSFe7LzJwTz8hwdMu', 'student', true, 1200, 'Ethiopia', 'Agriculture', 'research_institute', 'Fatima Hassan', false),
(gen_random_uuid(), 'phd@must.ac.ug', 'Samuel', 'Nakasozi', '$2b$12$LCruCr4mRROGt3GS0KwBWOTf8eFx1K2CstOJNSFe7LzJwTz8hwdMu', 'student', true, 800, 'Uganda', 'Medicine', 'university', 'Samuel Nakasozi', false),

-- Inactive/banned accounts for testing
(gen_random_uuid(), 'banned@example.com', 'Test', 'Banned', '$2b$12$LCruCr4mRROGt3GS0KwBWOTf8eFx1K2CstOJNSFe7LzJwTz8hwdMu', 'donor', false, 0, 'Kenya', 'Unknown', 'unknown', 'Test Banned', true),
(gen_random_uuid(), 'inactive@example.com', 'Test', 'Inactive', '$2b$12$LCruCr4mRROGt3GS0KwBWOTf8eFx1K2CstOJNSFe7LzJwTz8hwdMu', 'student', false, 500, 'Uganda', 'Technology', 'startup', 'Test Inactive', false)

ON CONFLICT (email) DO NOTHING;

-- User interactions with realistic patterns
INSERT INTO user_interactions (user_id, action_type, action_details, ip_address, user_agent, created_at) 
SELECT 
    u.id,
    actions.action_type,
    actions.action_details,
    ips.ip_address,
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36',
    NOW() - (random() * interval '30 days')
FROM users u
CROSS JOIN (
    VALUES 
        ('user_login', '{"method": "email", "success": true}'),
        ('opportunity_search', '{"sector": "health", "country": "kenya"}'),
        ('proposal_generation', '{"opportunity_type": "research_grant"}'),
        ('document_upload', '{"document_type": "proposal", "size_mb": 2.5}'),
        ('credit_purchase', '{"package": "standard", "amount": 1000}'),
        ('profile_update', '{"fields_updated": ["sector", "organization"]}'),
        ('dashboard_view', '{"page": "funding_opportunities"}'),
        ('bot_interaction', '{"action": "run_search", "country": "uganda"}')
) AS actions(action_type, action_details)
CROSS JOIN (
    VALUES 
        ('41.89.216.43'),   -- Kenya
        ('196.43.101.54'),  -- Uganda  
        ('105.160.15.240'), -- Tanzania
        ('41.210.142.83'),  -- Rwanda
        ('196.223.158.148') -- South Sudan
) AS ips(ip_address)
WHERE random() < 0.3  -- Only 30% of possible combinations
ON CONFLICT DO NOTHING;

-- Credit transactions with realistic patterns
INSERT INTO credit_transactions (user_id, amount, transaction_type, description, created_at)
SELECT 
    u.id,
    CASE t.transaction_type
        WHEN 'initial_credit' THEN u.credits
        WHEN 'purchase' THEN (ARRAY[500, 1000, 2500, 5000])[floor(random() * 4 + 1)]
        WHEN 'usage' THEN -1 * (10 + floor(random() * 50))
        WHEN 'bonus' THEN (ARRAY[100, 250, 500])[floor(random() * 3 + 1)]
        WHEN 'refund' THEN (ARRAY[200, 500, 1000])[floor(random() * 3 + 1)]
    END as amount,
    t.transaction_type,
    t.description,
    NOW() - (random() * interval '30 days')
FROM users u
CROSS JOIN (
    VALUES 
        ('initial_credit', 'Initial credit allocation'),
        ('purchase', 'Credit package purchase'),
        ('usage', 'Proposal generation fee'),
        ('usage', 'Document processing fee'),
        ('bonus', 'Referral bonus'),
        ('refund', 'Service credit refund')
) AS t(transaction_type, description)
WHERE random() < 0.4  -- 40% chance for each combination
ON CONFLICT DO NOTHING;

-- System settings
INSERT INTO system_settings (setting_key, setting_value, description) VALUES 
('theme', '{"default": "dark", "available": ["light", "dark", "auto"]}', 'UI theme configuration'),
('ai_model', '{"primary": "deepseek", "fallback": "openai", "temperature": 0.7}', 'AI model configuration'),
('credit_rates', '{"proposal_generation": 10, "document_processing": 5, "premium_search": 20}', 'Credit consumption rates'),
('site_settings', '{"name": "Granada OS", "tagline": "AI-Powered Funding Platform", "maintenance_mode": false}', 'General site configuration'),
('notification_settings', '{"email_enabled": true, "sms_enabled": false, "push_enabled": true}', 'Notification preferences'),
('security_settings', '{"max_login_attempts": 5, "session_timeout": 3600, "require_2fa": false}', 'Security configuration')
ON CONFLICT (setting_key) DO UPDATE SET 
    setting_value = EXCLUDED.setting_value,
    updated_at = NOW();

-- Update user credits based on transactions
UPDATE users SET credits = (
    SELECT COALESCE(SUM(amount), 1000)
    FROM credit_transactions ct 
    WHERE ct.user_id = users.id
) WHERE EXISTS (
    SELECT 1 FROM credit_transactions ct WHERE ct.user_id = users.id
);