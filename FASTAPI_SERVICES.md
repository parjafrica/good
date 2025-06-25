# Granada OS FastAPI Services

## Service Architecture

### Main API Service (Port 8000)
- **File**: `server/main.py`
- **Endpoints**: Core functionality, opportunities, proposals, document processing
- **Features**: CRUD operations, file uploads, AI integration

### Bot Service (Port 8001)  
- **File**: `server/bot_service.py`
- **Endpoints**: Web scraping automation, bot management
- **Features**: Background tasks, Selenium integration, content extraction

### Admin API Service (Port 8002)
- **File**: `server/admin_api.py`
- **Endpoints**: User management, system administration, analytics
- **Features**: User ban/unban, credit adjustments, opportunity verification

## Starting Services

### Individual Services
```bash
# Main API
cd server && python3 -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload

# Bot Service
cd server && python3 -m uvicorn bot_service:app --host 0.0.0.0 --port 8001 --reload

# Admin API
cd server && python3 -m uvicorn admin_api:app --host 0.0.0.0 --port 8002 --reload
```

### All Services
```bash
python3 start_all_services.py
```

## API Documentation
- Main API: http://localhost:8000/docs
- Bot Service: http://localhost:8001/docs  
- Admin API: http://localhost:8002/docs

## Frontend Integration
- React app on port 5000 connects to all FastAPI services
- Admin dashboard at `/admin` uses Admin API service
- Main app features use Main API service
- Bot operations managed through Bot Service

## Database Integration
All services connect to PostgreSQL using DATABASE_URL environment variable with proper connection pooling and error handling.