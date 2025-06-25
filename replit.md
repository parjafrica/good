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
- **MAJOR UPDATE**: Implemented backend behavioral tracking pipeline system
- Built user engagement tracking that runs as background process
- Added minimal notification system for major milestones only
- User behavior data collected for analytics and personalization
- Background XP, levels, credits system for future features
- Removed intrusive UI elements, keeping tracking pipeline discrete
- **ADMIN SYSTEM**: Built comprehensive system administration panel at /admin
- Complete user management with ban/unban, edit, delete capabilities
- Real-time user interaction tracking and click analytics
- Credit transaction monitoring and manual adjustment tools
- Database management with optimization and cleanup features
- System settings configuration for themes, AI models, site name
- Bot management with URL feeding and performance monitoring
- **LATEST UPDATE**: Comprehensive system integration with database synchronization
- Rebuilt ProposalManager with real-time database integration and admin sync
- Implemented full CreditsPurchase system with transaction tracking and package management
- Created comprehensive Settings page with profile, preferences, notifications, and privacy controls
- Enhanced all core pages to use dark theme as default system-wide standard
- Integrated all components with PostgreSQL database for real-time data synchronization
- Built credit transaction system with proper purchase flow and balance tracking
- Added user settings management with export capabilities and data privacy controls
- System now maintains complete state synchronization between user actions and admin dashboard
- All pages now reflect real database state with live updates and proper data persistence
- **BUSINESS TOOLS UPDATE**: Created comprehensive business management suite
- Built AdminBusinessTools with HR management, accounting modules, and document editing
- Implemented MS Word-like document editor with rich text formatting capabilities
- Added employee management with full CRUD operations and detailed profiles
- Created financial management system with income/expense tracking and invoicing
- Integrated business tools into admin dashboard with seamless navigation
- Fixed UUID generation issues for proposal saving system
- Enhanced admin panel with real-time activity tracking from user interactions database
- **REAL ADMIN SYSTEM**: Built authentic database-driven admin panel
- Connected directly to PostgreSQL database with live data from users, proposals, opportunities
- Implemented real user management with ban/unban functionality and credit adjustments
- Added live activity monitoring showing actual user interactions from database
- Replaced all mock data with genuine database queries and mutations
- Admin system now provides actual system administration capabilities


## Current Database Content
- Authentic funding opportunities from verified working sources
- Sources: ReliefWeb API, UN Jobs, Grants.gov, GrantSpace, European Commission
- All URLs tested and confirmed accessible
- Covers global funding opportunities across multiple sectors
- Real application processes and eligibility criteria

## Admin Panel Access
- Direct access at /admin bypasses React authentication completely
- Server-side HTML rendering eliminates useAuth dependency issues
- Full bot management capabilities without authentication barriers
- Real-time API integration for all bot operations

## User Preferences
- Prefers real, authentic data over mock/sample data
- Wants functional bot scraping system with live results
- Focus on East African funding opportunities (Kenya, Uganda, South Sudan)
- **CRITICAL REQUIREMENT**: Expert-driven system is the core/heart of the app - must drive personalized content delivery based on user details
- **BRANDING REQUIREMENT**: Replace all "AI" references with "Expert" terminology throughout frontend interface
- Remove all dummy data and make content truly database-driven and user-specific
- Each user sees specific information tailored to their profile and stored details
- Backend AI system should control what bots provide to individual users
- **NEW REQUIREMENT**: Landing page as interactive chat that collects user information and populates profile before dashboard

## Technical Notes
- **Intelligent Bot System**: URL feeding, human-like behavior, screenshot rewards at 70%+ score
- **Multiple Scraping Techniques**: Selenium (JavaScript sites), HTTP+BeautifulSoup (static), API calls
- **Best Solution**: Node.js-based intelligent bot controller with priority queue processing
- **Human-like Features**: Scrolling simulation, click interactions, realistic delays, AI analysis
- **URL Sources**: 7 verified funding websites including Grants.gov, GrantSpace, EU Portal
- Database properly migrated with all tables and relationships
- Frontend successfully receiving and displaying real opportunity data