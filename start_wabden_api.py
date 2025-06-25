#!/usr/bin/env python3
"""
Start Granada OS Wabden Admin API
Professional Python backend for admin operations
"""

import os
import sys
import subprocess
import time
import signal

def start_wabden_api():
    """Start the Wabden Admin API service"""
    print("🔧 Starting Granada OS Wabden Admin API...")
    print("   Port: 8002")
    print("   API Docs: http://localhost:8002/docs")
    print("   OpenAPI JSON: http://localhost:8002/openapi.json")
    print("")
    
    try:
        # Set environment variables
        env = os.environ.copy()
        env['PYTHONPATH'] = os.getcwd()
        
        # Start the FastAPI server
        cmd = [
            sys.executable, '-m', 'uvicorn',
            'server.wabden_api:app',
            '--host', '0.0.0.0',
            '--port', '8002',
            '--reload',
            '--log-level', 'info'
        ]
        
        process = subprocess.Popen(cmd, env=env)
        
        def signal_handler(sig, frame):
            print("\n🛑 Shutting down Wabden API...")
            process.terminate()
            sys.exit(0)
        
        signal.signal(signal.SIGINT, signal_handler)
        signal.signal(signal.SIGTERM, signal_handler)
        
        # Wait for the process
        process.wait()
        
    except Exception as e:
        print(f"❌ Failed to start Wabden API: {e}")
        sys.exit(1)

if __name__ == "__main__":
    start_wabden_api()