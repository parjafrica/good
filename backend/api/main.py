import asyncio
import logging
from fastapi import FastAPI, Depends, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from database.connection import create_tables, close_db
from services.bot_manager import bot_manager, start_bot_system, stop_bot_system
from services.verification_service import verification_service, start_verification_service, stop_verification_service
from api.routes import search_api

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
)
logger = logging.getLogger(__name__)

# Startup and shutdown events
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logger.info("Starting Granada Search Backend")
    
    # Create database tables
    await create_tables()
    logger.info("Database tables created")
    
    # Start bot system in background
    asyncio.create_task(start_bot_system())
    logger.info("Bot system started")
    
    # Start verification service in background
    asyncio.create_task(start_verification_service())
    logger.info("Verification service started")
    
    yield
    
    # Shutdown
    logger.info("Shutting down Granada Search Backend")
    
    # Stop services
    await stop_bot_system()
    await stop_verification_service()
    
    # Close database connections
    await close_db()
    logger.info("Database connections closed")

# Create FastAPI app
app = FastAPI(
    title="Granada Search Backend",
    description="Real-time funding opportunity search system with multi-bot architecture",
    version="1.0.0",
    lifespan=lifespan
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(search_api.router, prefix="/api/search", tags=["search"])

@app.get("/")
async def root():
    return {
        "name": "Granada Search Backend",
        "version": "1.0.0",
        "status": "running",
        "bots_active": len(bot_manager.bots),
        "verification_service": "running" if verification_service.running else "stopped"
    }

@app.get("/health")
async def health_check():
    # Check database connection
    try:
        # Check bot system
        bot_status = "healthy" if bot_manager.running else "stopped"
        
        # Check verification service
        verification_status = "healthy" if verification_service.running else "stopped"
        
        return {
            "status": "healthy",
            "timestamp": asyncio.get_event_loop().time(),
            "services": {
                "bot_system": bot_status,
                "verification_service": verification_status
            }
        }
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        raise HTTPException(status_code=500, detail="Health check failed")

@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    start_time = asyncio.get_event_loop().time()
    response = await call_next(request)
    process_time = asyncio.get_event_loop().time() - start_time
    response.headers["X-Process-Time"] = str(process_time)
    return response

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)