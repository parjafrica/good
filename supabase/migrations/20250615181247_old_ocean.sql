-- Create search_bots table if it doesn't exist
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

-- Create bot_rewards table if it doesn't exist
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

-- Create search_targets table if it doesn't exist
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

-- Create opportunity_verifications table if it doesn't exist
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

-- Create search_statistics table if it doesn't exist
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
ALTER TABLE search_bots ENABLE ROW LEVEL SECURITY;
ALTER TABLE bot_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE search_targets ENABLE ROW LEVEL SECURITY;
ALTER TABLE opportunity_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE search_statistics ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist and recreate them
DO $$
BEGIN
    -- Drop and recreate search_bots policies
    DROP POLICY IF EXISTS "Admins can manage search bots" ON search_bots;
    CREATE POLICY "Admins can manage search bots"
        ON search_bots
        FOR ALL
        TO authenticated
        USING (
            (SELECT is_superuser FROM users WHERE id = auth.uid())
        );

    -- Drop and recreate bot_rewards policies
    DROP POLICY IF EXISTS "Admins can manage bot rewards" ON bot_rewards;
    CREATE POLICY "Admins can manage bot rewards"
        ON bot_rewards
        FOR ALL
        TO authenticated
        USING (
            (SELECT is_superuser FROM users WHERE id = auth.uid())
        );

    -- Drop and recreate search_targets policies
    DROP POLICY IF EXISTS "Admins can manage search targets" ON search_targets;
    CREATE POLICY "Admins can manage search targets"
        ON search_targets
        FOR ALL
        TO authenticated
        USING (
            (SELECT is_superuser FROM users WHERE id = auth.uid())
        );

    -- Drop and recreate opportunity_verifications policies
    DROP POLICY IF EXISTS "Admins can manage opportunity verifications" ON opportunity_verifications;
    CREATE POLICY "Admins can manage opportunity verifications"
        ON opportunity_verifications
        FOR ALL
        TO authenticated
        USING (
            (SELECT is_superuser FROM users WHERE id = auth.uid())
        );

    -- Drop and recreate search_statistics policies
    DROP POLICY IF EXISTS "Authenticated users can read search statistics" ON search_statistics;
    CREATE POLICY "Authenticated users can read search statistics"
        ON search_statistics
        FOR SELECT
        TO authenticated
        USING (true);
END $$;

-- Create indexes for performance
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

-- Insert Kenya bot configuration
INSERT INTO search_bots (bot_id, name, country, status, targets_config) 
VALUES (
    'kenya_bot',
    'Kenya Funding Bot',
    'Kenya',
    'active',
    '[
        {
            "name": "UNDP Kenya",
            "url": "https://www.undp.org/kenya/funding-opportunities",
            "type": "scraping",
            "rate_limit": 30,
            "priority": 10
        },
        {
            "name": "Kenya Government Tenders",
            "url": "https://tenders.go.ke",
            "type": "scraping",
            "rate_limit": 20,
            "priority": 9
        },
        {
            "name": "USAID Kenya",
            "url": "https://www.usaid.gov/kenya/partnership-opportunities",
            "type": "scraping",
            "rate_limit": 25,
            "priority": 9
        },
        {
            "name": "NGOs Board Kenya",
            "url": "https://ngobureau.go.ke",
            "type": "scraping",
            "rate_limit": 20,
            "priority": 8
        }
    ]'
) ON CONFLICT (bot_id) DO NOTHING;

-- Insert Kenya search targets
INSERT INTO search_targets (name, url, country, type, rate_limit, priority)
VALUES 
    ('UNDP Kenya', 'https://www.undp.org/kenya/funding-opportunities', 'Kenya', 'scraping', 30, 10),
    ('Kenya Government Tenders', 'https://tenders.go.ke', 'Kenya', 'scraping', 20, 9),
    ('USAID Kenya', 'https://www.usaid.gov/kenya/partnership-opportunities', 'Kenya', 'scraping', 25, 9),
    ('NGOs Board Kenya', 'https://ngobureau.go.ke', 'Kenya', 'scraping', 20, 8)
ON CONFLICT DO NOTHING;

-- Insert Nigeria bot configuration
INSERT INTO search_bots (bot_id, name, country, status, targets_config) 
VALUES (
    'nigeria_bot',
    'Nigeria Funding Bot',
    'Nigeria',
    'active',
    '[
        {
            "name": "UNDP Nigeria",
            "url": "https://www.undp.org/nigeria/funding-opportunities",
            "type": "scraping",
            "rate_limit": 30,
            "priority": 10
        },
        {
            "name": "Nigeria Bureau of Public Procurement",
            "url": "https://www.bpp.gov.ng",
            "type": "scraping",
            "rate_limit": 20,
            "priority": 9
        },
        {
            "name": "USAID Nigeria",
            "url": "https://www.usaid.gov/nigeria/partnership-opportunities",
            "type": "scraping",
            "rate_limit": 25,
            "priority": 9
        }
    ]'
) ON CONFLICT (bot_id) DO NOTHING;

-- Insert Nigeria search targets
INSERT INTO search_targets (name, url, country, type, rate_limit, priority)
VALUES 
    ('UNDP Nigeria', 'https://www.undp.org/nigeria/funding-opportunities', 'Nigeria', 'scraping', 30, 10),
    ('Nigeria Bureau of Public Procurement', 'https://www.bpp.gov.ng', 'Nigeria', 'scraping', 20, 9),
    ('USAID Nigeria', 'https://www.usaid.gov/nigeria/partnership-opportunities', 'Nigeria', 'scraping', 25, 9)
ON CONFLICT DO NOTHING;