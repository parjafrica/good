# Granada OS FastAPI Backend

## Architecture Overview

Granada OS now uses a pure FastAPI backend architecture with the following services:

### Services
- **Main API** (port 8000): Core functionality, opportunities, proposals, admin
- **Bot Service** (port 8001): Web scraping, automation, bot management  
- **Frontend** (port 5000): React application served by Express

## API Endpoints

### Main API (port 8000)

#### Health & Status
- `GET /` - Service status
- `GET /health` - Health check with database connectivity

#### Funding Opportunities
- `GET /api/opportunities` - List opportunities with filters (country, sector, verified_only, limit)
- `POST /api/opportunities` - Create new opportunity

#### Bot Management
- `GET /api/bots` - Get bot status and statistics
- `POST /api/bots/{bot_id}/run` - Run specific bot

#### Proposals
- `POST /api/proposals/generate` - Generate AI proposal content

#### Document Processing
- `POST /api/documents/upload` - Upload and process funding documents

#### Admin
- `GET /api/admin/stats` - Admin dashboard statistics

### Bot Service (port 8001)

#### Bot Operations
- `GET /` - Service status
- `POST /bots/{bot_id}/run` - Execute bot with background processing

## Starting Services

### Option 1: Individual Services
```bash
# Start main API
cd server && python3 -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload

# Start bot service
cd server && python3 -m uvicorn bot_service:app --host 0.0.0.0 --port 8001 --reload
```

### Option 2: All Services
```bash
# Start FastAPI services
python3 start_fastapi.py

# Or use the shell script
./run_fastapi.sh
```

## API Documentation

- Main API docs: http://localhost:8000/docs
- Bot Service docs: http://localhost:8001/docs
- Interactive testing available through Swagger UI

## Database Integration

All services connect to PostgreSQL using the DATABASE_URL environment variable and include:
- Connection pooling
- Error handling
- Transaction management
- Real-time data synchronization

## Features

### Main API Features
- RESTful endpoints for funding opportunities
- File upload and document processing
- AI-powered proposal generation
- Admin dashboard statistics
- CORS support for frontend integration

### Bot Service Features
- Web scraping with Selenium
- AI content formatting with DeepSeek
- Background task processing
- Bot status monitoring
- Opportunity deduplication

## Environment Variables

Required:
- `DATABASE_URL` - PostgreSQL connection string

Optional:
- `DEEPSEEK_API_KEY` - For AI content processing