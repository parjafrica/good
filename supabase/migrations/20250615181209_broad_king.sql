/*
  # Add Real-Time Search System Tables

  1. New Tables
    - `donor_opportunities` - Scraped funding opportunities
    - `search_bots` - Bot configuration and status
    - `bot_rewards` - Reward system for successful bots
    - `search_targets` - Search targets configuration
    - `opportunity_verifications` - Verification records
    - `search_statistics` - Search performance metrics

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users

  3. Indexes
    - Add performance indexes for search operations
*/

-- Create donor_opportunities table
CREATE TABLE IF NOT EXISTS donor_opportunities (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    title text NOT NULL,
    description text,
    deadline timestamptz,
    amount_min bigint,
    amount_max bigint,
    currency text DEFAULT 'USD',
    source_url text NOT NULL,
    source_name text NOT NULL,
    country text NOT NULL,
    sector text,
    eligibility_criteria text,
    application_process text,
    contact_email text,
    contact_phone text,
    keywords jsonb,
    focus_areas jsonb,
    content_hash text UNIQUE NOT NULL,
    scraped_at timestamptz DEFAULT now(),
    last_verified timestamptz,
    is_verified boolean DEFAULT false,
    is_active boolean DEFAULT true,
    verification_score float DEFAULT 0.0,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Create search_bots table
CREATE TABLE IF NOT EXISTS search_bots (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    bot_id text UNIQUE NOT NULL,
    name text NOT NULL,
    country text NOT NULL,
    status text DEFAULT 'active',
    targets_config jsonb,
    last_run timestamptz,
    total_opportunities_found integer DEFAULT 0,
    total_reward_points integer DEFAULT 0,
    error_count integer DEFAULT 0,
    success_rate float DEFAULT 0.0,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Create bot_rewards table
CREATE TABLE IF NOT EXISTS bot_rewards (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    bot_id text NOT NULL,
    country text NOT NULL,
    opportunities_found integer NOT NULL,
    reward_points integer NOT NULL,
    bonus_multiplier float DEFAULT 1.0,
    awarded_at timestamptz DEFAULT now(),
    notes text
);

-- Create search_targets table
CREATE TABLE IF NOT EXISTS search_targets (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    name text NOT NULL,
    url text NOT NULL,
    country text NOT NULL,
    type text NOT NULL,
    selectors jsonb,
    headers jsonb,
    rate_limit integer DEFAULT 30,
    priority integer DEFAULT 5,
    api_key text,
    is_active boolean DEFAULT true,
    success_rate float DEFAULT 0.0,
    last_successful_run timestamptz,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Create opportunity_verifications table
CREATE TABLE IF NOT EXISTS opportunity_verifications (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    opportunity_id uuid NOT NULL,
    verification_type text NOT NULL,
    status text NOT NULL,
    score float DEFAULT 0.0,
    details jsonb,
    verified_at timestamptz DEFAULT now(),
    verified_by text
);

-- Create search_statistics table
CREATE TABLE IF NOT EXISTS search_statistics (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    date timestamptz DEFAULT now(),
    country text NOT NULL,
    source_name text NOT NULL,
    opportunities_found integer DEFAULT 0,
    opportunities_verified integer DEFAULT 0,
    success_rate float DEFAULT 0.0,
    response_time_avg float DEFAULT 0.0,
    errors_count integer DEFAULT 0,
    created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE donor_opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE search_bots ENABLE ROW LEVEL SECURITY;
ALTER TABLE bot_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE search_targets ENABLE ROW LEVEL SECURITY;
ALTER TABLE opportunity_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE search_statistics ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Authenticated users can read donor opportunities
CREATE POLICY "Authenticated users can read donor opportunities"
    ON donor_opportunities
    FOR SELECT
    TO authenticated
    USING (true);

-- Authenticated users can read search statistics
CREATE POLICY "Authenticated users can read search statistics"
    ON search_statistics
    FOR SELECT
    TO authenticated
    USING (true);

-- Only admins can manage bots and targets
CREATE POLICY "Admins can manage search bots"
    ON search_bots
    FOR ALL
    TO authenticated
    USING (
        (SELECT is_superuser FROM users WHERE id = auth.uid())
    );

CREATE POLICY "Admins can manage search targets"
    ON search_targets
    FOR ALL
    TO authenticated
    USING (
        (SELECT is_superuser FROM users WHERE id = auth.uid())
    );

CREATE POLICY "Admins can manage bot rewards"
    ON bot_rewards
    FOR ALL
    TO authenticated
    USING (
        (SELECT is_superuser FROM users WHERE id = auth.uid())
    );

CREATE POLICY "Admins can manage opportunity verifications"
    ON opportunity_verifications
    FOR ALL
    TO authenticated
    USING (
        (SELECT is_superuser FROM users WHERE id = auth.uid())
    );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_donor_opportunities_country ON donor_opportunities(country);
CREATE INDEX IF NOT EXISTS idx_donor_opportunities_sector ON donor_opportunities(sector);
CREATE INDEX IF NOT EXISTS idx_donor_opportunities_deadline ON donor_opportunities(deadline);
CREATE INDEX IF NOT EXISTS idx_donor_opportunities_verified ON donor_opportunities(is_verified);
CREATE INDEX IF NOT EXISTS idx_donor_opportunities_content_hash ON donor_opportunities(content_hash);
CREATE INDEX IF NOT EXISTS idx_donor_opportunities_source ON donor_opportunities(source_name);

CREATE INDEX IF NOT EXISTS idx_search_bots_country ON search_bots(country);
CREATE INDEX IF NOT EXISTS idx_search_bots_status ON search_bots(status);

CREATE INDEX IF NOT EXISTS idx_bot_rewards_bot_id ON bot_rewards(bot_id);
CREATE INDEX IF NOT EXISTS idx_bot_rewards_awarded_at ON bot_rewards(awarded_at);

CREATE INDEX IF NOT EXISTS idx_search_targets_country ON search_targets(country);
CREATE INDEX IF NOT EXISTS idx_search_targets_type ON search_targets(type);

CREATE INDEX IF NOT EXISTS idx_opportunity_verifications_opportunity_id ON opportunity_verifications(opportunity_id);
CREATE INDEX IF NOT EXISTS idx_opportunity_verifications_status ON opportunity_verifications(status);

CREATE INDEX IF NOT EXISTS idx_search_statistics_date ON search_statistics(date);
CREATE INDEX IF NOT EXISTS idx_search_statistics_country ON search_statistics(country);

-- Insert initial South Sudan bot configuration
INSERT INTO search_bots (bot_id, name, country, status, targets_config) 
VALUES (
    'south_sudan_bot',
    'South Sudan Funding Bot',
    'South Sudan',
    'active',
    '[
        {
            "name": "UNDP South Sudan",
            "url": "https://www.undp.org/south-sudan/funding-opportunities",
            "type": "scraping",
            "rate_limit": 30,
            "priority": 10
        },
        {
            "name": "World Bank South Sudan",
            "url": "https://projects.worldbank.org/en/projects-operations/projects-list?countrycode_exact=SS",
            "type": "scraping",
            "rate_limit": 20,
            "priority": 9
        },
        {
            "name": "USAID South Sudan",
            "url": "https://www.usaid.gov/south-sudan/partnership-opportunities",
            "type": "scraping",
            "rate_limit": 25,
            "priority": 9
        },
        {
            "name": "African Development Bank",
            "url": "https://www.afdb.org/en/projects-and-operations/procurement/opportunities",
            "type": "scraping",
            "rate_limit": 20,
            "priority": 8
        },
        {
            "name": "UN Women South Sudan",
            "url": "https://africa.unwomen.org/en/where-we-are/east-and-southern-africa/south-sudan",
            "type": "scraping",
            "rate_limit": 15,
            "priority": 7
        }
    ]'
) ON CONFLICT (bot_id) DO NOTHING;

-- Insert initial search targets
INSERT INTO search_targets (name, url, country, type, rate_limit, priority)
VALUES 
    ('UNDP South Sudan', 'https://www.undp.org/south-sudan/funding-opportunities', 'South Sudan', 'scraping', 30, 10),
    ('World Bank South Sudan', 'https://projects.worldbank.org/en/projects-operations/projects-list?countrycode_exact=SS', 'South Sudan', 'scraping', 20, 9),
    ('USAID South Sudan', 'https://www.usaid.gov/south-sudan/partnership-opportunities', 'South Sudan', 'scraping', 25, 9),
    ('African Development Bank', 'https://www.afdb.org/en/projects-and-operations/procurement/opportunities', 'South Sudan', 'scraping', 20, 8),
    ('UN Women South Sudan', 'https://africa.unwomen.org/en/where-we-are/east-and-southern-africa/south-sudan', 'South Sudan', 'scraping', 15, 7)
ON CONFLICT DO NOTHING;