# Granada Real-Time Funding Search Backend

A powerful multi-bot system for scraping, verifying, and storing real funding opportunities from around the world.

## 🚀 Features

- **Multi-Bot Architecture**: Country-specific bots that continuously search for funding opportunities
- **Intelligent Scraping**: Extracts data from websites, APIs, and RSS feeds
- **Verification System**: Validates opportunities to ensure data quality
- **Reward System**: Incentivizes bots for successful discoveries
- **Real-Time Updates**: Continuously refreshes the database with new opportunities
- **Comprehensive API**: Exposes search functionality to the frontend

## 🏗️ Architecture

### Bot System
- **Bot Manager**: Coordinates all bots and manages the scraping queue
- **Country-Specific Bots**: Specialized bots for different regions
- **Search Targets**: Configurable sources for each bot to search
- **Rate Limiting**: Respects website limits to avoid blocking

### Verification System
- **Opportunity Verifier**: Validates scraped opportunities
- **Multiple Checks**: URL validation, content analysis, deadline verification, duplicate detection
- **Scoring System**: Calculates verification scores for each opportunity

### Database
- **Donor Opportunities**: Stores all funding opportunities
- **Search Bots**: Configuration and status of all bots
- **Bot Rewards**: Tracks bot performance and rewards
- **Search Targets**: Configurable search sources
- **Opportunity Verifications**: Records of verification checks
- **Search Statistics**: Performance metrics for the system

## 🔧 Setup

### Prerequisites
- Python 3.9+
- PostgreSQL database
- Supabase account

### Installation
```bash
# Install dependencies
pip install -r requirements.txt

# Set environment variables
export DATABASE_URL=postgresql+asyncpg://user:password@localhost/granada_db

# Run migrations
alembic upgrade head

# Start the server
uvicorn api.main:app --reload
```

## 🤖 Bot Configuration

The system starts with a South Sudan bot and can be extended with more country-specific bots:

```python
# Add a new country bot
new_bot = FundingBot(
    "kenya_bot",
    "Kenya",
    [
        SearchTarget(
            name="Kenya Government Tenders",
            url="https://tenders.go.ke",
            country="Kenya",
            type="scraping",
            selectors={},
            rate_limit=20,
            priority=9
        ),
        # Add more targets...
    ]
)
```

## 🔍 API Endpoints

- `GET /api/search/opportunities`: Search for funding opportunities
- `GET /api/search/opportunity/{id}`: Get details for a specific opportunity
- `GET /api/search/statistics`: Get system statistics
- `POST /api/search/trigger-search`: Trigger an immediate search
- `GET /api/search/bot-status`: Check status of all bots

## 🔄 Continuous Operation

The system runs continuously, with bots searching for new opportunities and the verification service validating them. Each successful find earns the bot reward points, creating a competitive system that incentivizes finding high-quality opportunities.

## 📊 Performance Metrics

- **Opportunities Found**: Total number of opportunities discovered
- **Verification Rate**: Percentage of opportunities that pass verification
- **Bot Success Rate**: Performance metrics for each bot
- **Response Time**: Average time to process search requests

## 🔐 Security

- Row-Level Security (RLS) for all database tables
- Admin-only access to bot management
- Read-only access for regular users to opportunity data

## 🚀 Deployment

The system is designed to run as a standalone service or as part of the Granada backend. It can be deployed to any environment that supports Python and PostgreSQL.

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.