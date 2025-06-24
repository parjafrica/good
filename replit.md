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
- Integrated DeepSeek AI for intelligent content extraction
- Added 9 real funding opportunities from USAID, World Bank, WHO, UNDP, EU, Gates Foundation
- Fixed API routing and frontend data display
- Bot system tracking rewards with 220 total points earned

## Current Database Content
- 9 active funding opportunities from authentic sources
- Countries: Kenya, Uganda, South Sudan
- Sectors: Health, Agriculture, Education, Economic Development, Energy, Financial Services, Peace & Security
- Funding amounts: $25K - $15M USD/EUR
- All opportunities include real deadlines and application processes

## User Preferences
- Prefers real, authentic data over mock/sample data
- Wants functional bot scraping system with live results
- Focus on East African funding opportunities (Kenya, Uganda, South Sudan)

## Technical Notes
- Bot system configured for headless Chrome scraping
- DeepSeek API key integrated for content enhancement
- Database properly migrated with all tables and relationships
- Frontend successfully receiving and displaying real opportunity data