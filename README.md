# Granada OS - Funding Opportunities Platform

## Project Structure

```
├── server/                 # Backend (Express.js + TypeScript + Python)
│   ├── *.ts               # TypeScript API routes and logic
│   ├── *.py               # Python bot management and AI processing
│   └── __pycache__/       # Python cache
├── shared/                # Shared schemas and types
│   └── schema.ts          # Database schemas with Drizzle ORM
├── client/                # Frontend React application
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── pages/         # Page components
│   │   └── main.tsx       # Entry point
│   └── index.html
├── src/                   # Organized source code
│   ├── admin/             # Admin dashboard components
│   ├── user-dashboard/    # User-facing components
│   └── shared/            # Shared utilities and hooks
└── pyproject.toml         # Python dependencies
```

## Key Features

- **Expert-driven system** with personalized content delivery
- **Real-time bot scraping** of funding opportunities
- **PostgreSQL database** with authentic data
- **Admin dashboard** with user management and business tools
- **Python AI integration** with DeepSeek for proposal generation

## Getting Started

1. Install dependencies: `npm install`
2. Start development server: `npm run dev`
3. Access admin panel: `/admin`
4. Access user dashboard: `/`

## Database

Uses PostgreSQL with Drizzle ORM. All data is authentic from verified sources including:
- ReliefWeb API
- UN Jobs
- Grants.gov
- GrantSpace
- European Commission

## Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Backend**: Express.js, TypeScript, Python
- **Database**: PostgreSQL (Neon)
- **ORM**: Drizzle ORM
- **AI**: DeepSeek integration
- **Bot System**: Selenium, BeautifulSoup