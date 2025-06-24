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
- Created comprehensive Admin Bot Panel with URL feeding system accessible at /admin
- Implemented bot activation controls, stealth mode, and human behavior settings
- Added screenshot rewards system and performance monitoring
- Fixed authentication context issues for standalone admin panel operation
- Created fully functional admin panel at /admin with direct server-side rendering
- Bypassed React authentication errors with standalone HTML admin interface

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
- **Intelligent Bot System**: URL feeding, human-like behavior, screenshot rewards at 70%+ score
- **Multiple Scraping Techniques**: Selenium (JavaScript sites), HTTP+BeautifulSoup (static), API calls
- **Best Solution**: Node.js-based intelligent bot controller with priority queue processing
- **Human-like Features**: Scrolling simulation, click interactions, realistic delays, AI analysis
- **URL Sources**: 7 verified funding websites including Grants.gov, GrantSpace, EU Portal
- Database properly migrated with all tables and relationships
- Frontend successfully receiving and displaying real opportunity data