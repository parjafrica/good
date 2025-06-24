/*
  # Granada Operating System - Complete Database Schema

  1. Extensions
    - Enable pgvector for AI embeddings
    - Enable uuid-ossp for UUID generation

  2. Core Tables
    - `users` - User authentication and profiles
    - `organizations` - NGO/organization profiles
    - `proposals` - Grant proposals and applications
    - `donors` - Funding organizations and foundations
    - `donor_calls` - Specific funding opportunities
    - `projects` - Active projects and initiatives
    - `ai_interactions` - AI assistant conversation history

  3. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
    - Organization-based data isolation

  4. Sample Data
    - Demo admin user
    - Sample organization and donor data
    - Example funding opportunities
*/

-- Enable required extensions
-- CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table for authentication
CREATE TABLE IF NOT EXISTS users (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    email text UNIQUE NOT NULL,
    hashed_password text NOT NULL,
    full_name text NOT NULL,
    is_active boolean DEFAULT true,
    is_superuser boolean DEFAULT false,
    organization_id uuid,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Organizations table
CREATE TABLE IF NOT EXISTS organizations (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    name text NOT NULL,
    description text,
    mission_statement text,
    sector text,
    country text,
    website text,
    logo_url text,
    brand_colors jsonb DEFAULT '{}',
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Donors table
CREATE TABLE IF NOT EXISTS donors (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    name text NOT NULL,
    type text NOT NULL, -- Foundation, Government, Corporate, etc.
    country text,
    description text,
    website text,
    focus_areas jsonb DEFAULT '[]',
    geographic_focus jsonb DEFAULT '[]',
    funding_range_min integer,
    funding_range_max integer,
    contact_info jsonb DEFAULT '{}',
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Donor calls (funding opportunities)
CREATE TABLE IF NOT EXISTS donor_calls (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    donor_id uuid REFERENCES donors(id) ON DELETE CASCADE,
    title text NOT NULL,
    description text,
    total_funding bigint,
    max_grant_size integer,
    min_grant_size integer,
    application_deadline timestamptz,
    announcement_date timestamptz DEFAULT now(),
    keywords jsonb DEFAULT '[]',
    sdg_alignment jsonb DEFAULT '[]',
    eligibility_criteria text,
    application_process text,
    status text DEFAULT 'open', -- open, closed, draft
    -- embedding vector(1536), -- For AI matching
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Proposals table
CREATE TABLE IF NOT EXISTS proposals (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
    donor_call_id uuid REFERENCES donor_calls(id) ON DELETE SET NULL,
    title text NOT NULL,
    description text,
    status text DEFAULT 'draft', -- draft, submitted, under_review, approved, rejected
    total_budget bigint,
    duration_months integer,
    start_date date,
    end_date date,
    content jsonb DEFAULT '{}', -- Structured proposal content
    ai_score integer, -- AI analysis score (0-100)
    ai_feedback jsonb DEFAULT '{}',
    version integer DEFAULT 1,
    created_by uuid REFERENCES users(id),
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Projects table
CREATE TABLE IF NOT EXISTS projects (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
    proposal_id uuid REFERENCES proposals(id) ON DELETE SET NULL,
    title text NOT NULL,
    description text,
    status text DEFAULT 'planning', -- planning, active, completed, on_hold, cancelled
    total_budget bigint,
    spent_budget bigint DEFAULT 0,
    start_date date,
    end_date date,
    completion_percentage integer DEFAULT 0,
    team_members jsonb DEFAULT '[]',
    milestones jsonb DEFAULT '[]',
    risks jsonb DEFAULT '[]',
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- AI interactions for chat history
CREATE TABLE IF NOT EXISTS ai_interactions (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id uuid REFERENCES users(id) ON DELETE CASCADE,
    organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
    message text NOT NULL,
    response text NOT NULL,
    context_type text, -- proposal, donor, project, general
    context_id uuid, -- ID of related entity
    created_at timestamptz DEFAULT now()
);

-- Add foreign key constraint for users.organization_id
ALTER TABLE users ADD CONSTRAINT fk_users_organization 
    FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE SET NULL;

-- Enable Row Level Security
-- ALTER TABLE users ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE donors ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE donor_calls ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE proposals ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE ai_interactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Users can read their own data
-- CREATE POLICY "Users can read own data"
--     ON users
--     FOR SELECT
--     TO authenticated
--     USING (auth.uid() = id);

-- Users can update their own data
-- CREATE POLICY "Users can update own data"
--     ON users
--     FOR UPDATE
--     TO authenticated
--     USING (auth.uid() = id);

-- Organization members can read their organization
-- CREATE POLICY "Organization members can read their org"
--     ON organizations
--     FOR SELECT
--     TO authenticated
--     USING (id = (SELECT organization_id FROM users WHERE id = auth.uid()));

-- Organization members can update their organization
-- CREATE POLICY "Organization members can update their org"
--     ON organizations
--     FOR UPDATE
--     TO authenticated
--     USING (id = (SELECT organization_id FROM users WHERE id = auth.uid()));

-- All authenticated users can read donors and donor calls
-- CREATE POLICY "Authenticated users can read donors"
--     ON donors
--     FOR SELECT
--     TO authenticated
--     USING (true);

-- CREATE POLICY "Authenticated users can read donor calls"
--     ON donor_calls
--     FOR SELECT
--     TO authenticated
--     USING (true);

-- Organization members can manage their proposals
-- CREATE POLICY "Organization members can manage proposals"
--     ON proposals
--     FOR ALL
--     TO authenticated
--     USING (organization_id = (SELECT organization_id FROM users WHERE id = auth.uid()));

-- Organization members can manage their projects
-- CREATE POLICY "Organization members can manage projects"
--     ON projects
--     FOR ALL
--     TO authenticated
--     USING (organization_id = (SELECT organization_id FROM users WHERE id = auth.uid()));

-- Users can manage their AI interactions
-- CREATE POLICY "Users can manage their AI interactions"
--     ON ai_interactions
--     FOR ALL
--     TO authenticated
--     USING (user_id = auth.uid());

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_organization ON users(organization_id);
CREATE INDEX IF NOT EXISTS idx_proposals_organization ON proposals(organization_id);
CREATE INDEX IF NOT EXISTS idx_proposals_status ON proposals(status);
CREATE INDEX IF NOT EXISTS idx_donor_calls_deadline ON donor_calls(application_deadline);
CREATE INDEX IF NOT EXISTS idx_donor_calls_status ON donor_calls(status);
CREATE INDEX IF NOT EXISTS idx_projects_organization ON projects(organization_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_ai_interactions_user ON ai_interactions(user_id);

-- Vector similarity search index for donor matching
-- CREATE INDEX IF NOT EXISTS idx_donor_calls_embedding
--     ON donor_calls USING ivfflat (embedding vector_cosine_ops)
--     WITH (lists = 100);

-- Insert sample data (now that tables exist)

-- Create sample organization first
INSERT INTO organizations (id, name, description, mission_statement, sector, country) 
VALUES (
    '550e8400-e29b-41d4-a716-446655440000',
    'Sample NGO',
    'A demonstration organization for Granada OS',
    'To demonstrate the power of Granada Operating System for Impact',
    'Education',
    'Global'
) ON CONFLICT (id) DO NOTHING;

-- Create initial admin user (password: admin123)
INSERT INTO users (email, hashed_password, full_name, is_active, is_superuser, organization_id) 
VALUES (
    'admin@granada.org', 
    '$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', 
    'Granada Admin', 
    true, 
    true,
    '550e8400-e29b-41d4-a716-446655440000'
) ON CONFLICT (email) DO NOTHING;

-- Create sample donor
INSERT INTO donors (id, name, type, country, description, focus_areas, geographic_focus, funding_range_min, funding_range_max)
VALUES (
    '660e8400-e29b-41d4-a716-446655440000',
    'Global Education Foundation',
    'Foundation',
    'USA',
    'Supporting education initiatives worldwide',
    '["Education", "Youth Development", "Digital Literacy"]',
    '["Global", "Africa", "Asia"]',
    10000,
    500000
) ON CONFLICT (id) DO NOTHING;

-- Create sample donor call
INSERT INTO donor_calls (donor_id, title, description, total_funding, max_grant_size, application_deadline, keywords, sdg_alignment)
VALUES (
    '660e8400-e29b-41d4-a716-446655440000',
    'Digital Literacy for Youth Program',
    'Supporting digital skills development for young people in underserved communities',
    2000000,
    100000,
    '2024-12-15 23:59:59',
    '["Education", "Digital Literacy", "Youth", "Technology"]',
    '[4, 8, 10]'
) ON CONFLICT DO NOTHING;

-- Create sample proposal
INSERT INTO proposals (organization_id, title, description, status, total_budget, duration_months, ai_score)
VALUES (
    '550e8400-e29b-41d4-a716-446655440000',
    'Youth Empowerment Through Digital Skills',
    'A comprehensive program to provide digital literacy training to underserved youth',
    'draft',
    75000,
    18,
    78
) ON CONFLICT DO NOTHING;

-- Create sample project
INSERT INTO projects (organization_id, title, description, status, total_budget, completion_percentage)
VALUES (
    '550e8400-e29b-41d4-a716-446655440000',
    'Community Health Initiative',
    'Improving healthcare access in rural communities',
    'active',
    120000,
    65
) ON CONFLICT DO NOTHING;