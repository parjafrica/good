#!/usr/bin/env python3
"""
Granada Backend Runner
Starts the FastAPI backend server with the correct configuration.
"""

import uvicorn
import sys
import asyncio

if __name__ == "__main__":
    # On Windows, we MUST use the ProactorEventLoop to support
    # subprocesses, which Playwright requires.
    if sys.platform == "win32":
        asyncio.set_event_loop_policy(asyncio.WindowsProactorEventLoopPolicy())

    print("🚀 Starting Granada Backend API Server...")
    print("📍 API will be available at: http://localhost:8000")
    print("📚 API Documentation: http://localhost:8000/docs")
    print("🔧 Auto-reload is DISABLED for stability with Playwright on Windows.")
    print("-" * 50)

    uvicorn.run(
        "backend.main:create_app",
        host="0.0.0.0",
        port=8000,
        factory=True,
        reload=False,  # This MUST be False to avoid the error.
    )