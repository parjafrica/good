# Granada OS - Unified Access System

## Correct Access Points:

**Main Application:** http://localhost:5000
**Admin Dashboard:** http://localhost:5000/wabden

## Admin System Features:
- Real-time dashboard with system metrics
- User management with full admin controls
- Funding opportunities verification and management  
- HR tools including employee directory and recruitment
- Accounting and financial tracking with revenue analytics
- Bot control system for web scraping automation
- Comprehensive submissions and proposal management

## Setup Commands:
```bash
# Option 1: Complete setup
./start.sh

# Option 2: Manual start
npm run dev
```

## Architecture:
- Port 5000: Main entry point for ALL access (including admin)
- No additional ports needed
- Admin interface served directly from main Express server
- No external dependencies or redirect issues

The Wabden admin system is now fully operational and accessible through the main application port without any redirect issues.