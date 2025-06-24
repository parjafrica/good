# Granada OS - Funding Opportunities Platform

## Overview
Granada OS is a comprehensive funding opportunities platform successfully migrated from Bolt to Replit. The platform features an AI-powered bot system that scrapes real funding opportunities from major international organizations and stores them in a PostgreSQL database.

## Project Architecture
- **Frontend**: React + TypeScript with Tailwind CSS
- **Backend**: Node.js/Express with TypeScript
- **Database**: PostgreSQL (Neon) with Drizzle ORM
- **Bot System**: Python with Selenium and DeepSeek AI integration
- **API Integration**: RESTful endpoints serving funding opportunities

## Recent Changes (June 24, 2025)
- Successfully migrated from Bolt/Supabase to Replit/PostgreSQL
- Created complete database schema with funding opportunities, bots, and user management
- Built working Python bot manager for web scraping
- Fixed fake URL issue - now scraping only verified, working websites
- Implemented URL validation to ensure all links are accessible
- Added authentic funding opportunities from ReliefWeb, UN Jobs, Grants.gov, GrantSpace, EU Commission
- Fixed API routing and frontend data display
- Bot system tracking rewards with verified opportunities

## Current Database Content
- Authentic funding opportunities from verified working sources
- Sources: ReliefWeb API, UN Jobs, Grants.gov, GrantSpace, European Commission
- All URLs tested and confirmed accessible
- Covers global funding opportunities across multiple sectors
- Real application processes and eligibility criteria

## User Preferences
- Prefers real, authentic data over mock/sample data
- Wants functional bot scraping system with live results
- Focus on East African funding opportunities (Kenya, Uganda, South Sudan)

## Technical Notes
- Bot system configured for headless Chrome scraping
- DeepSeek API key integrated for content enhancement
- Database properly migrated with all tables and relationships
- Frontend successfully receiving and displaying real opportunity data