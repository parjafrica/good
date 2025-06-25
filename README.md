# Granada OS - Funding Opportunities Platform

## Quick Start

### Option 1: Single Script (Recommended)
```bash
./start.sh
```

### Option 2: Manual Steps
1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the application:**
   ```bash
   npm run dev
   ```

3. **Access the application:**
   - Main App: http://localhost:5000
   - Admin Panel: http://localhost:5000/wabden

## Project Structure

```
├── client/                 # React frontend
├── server/                 # Express.js backend + API routes
├── wabden/                 # Secure admin dashboard (FastAPI)
├── shared/                 # Shared schemas and types
└── package.json           # Unified dependency management
```

## Development

### Single Command Setup
```bash
npm install              # Installs all Node.js dependencies
npm run install:all      # Installs both Node.js and Python dependencies
npm run dev:all          # Starts both main app and admin system
```

### Individual Services
```bash
npm run dev              # Main application only (port 5000)
npm run dev:wabden       # Admin system only (port 5001)
```

## Admin Access

The admin system uses the secure URL `/wabden` for enhanced security. It includes:

- **Dashboard**: Real-time system metrics and analytics
- **User Management**: User administration with ban/unban, credit adjustments
- **Opportunities**: Funding opportunity verification and management
- **HR Management**: Employee directory, recruitment pipeline, performance reviews
- **Accounting**: Financial management, revenue tracking, expense monitoring
- **Submissions**: User proposal and research request management
- **Bot Control**: Web scraping automation and intelligent bot management

## Database

- **PostgreSQL** with Drizzle ORM
- Real funding opportunities from verified sources
- Comprehensive user tracking and analytics
- Database migrations: `npm run db:push`

## Features

- **Expert-driven system** with personalized content delivery
- **Real-time bot scraping** of funding opportunities  
- **AI-powered proposal generation** with DeepSeek integration
- **Multi-port architecture** unified on single development server
- **Comprehensive admin dashboard** with advanced analytics
- **Dark theme** as system-wide standard

## Environment Variables

Required environment variables:
- `DATABASE_URL` - PostgreSQL connection string
- `OPENAI_API_KEY` - For AI proposal generation (optional)

## Security

- Admin routes secured with non-obvious URL patterns
- Database-driven authentication system
- Real-time user interaction tracking
- Comprehensive audit logging

## Support

For technical issues or feature requests, refer to the admin dashboard analytics or system logs.