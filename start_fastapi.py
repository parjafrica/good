#!/usr/bin/env python3
"""
Start FastAPI services for Granada OS
"""

import subprocess
import sys
import time
import os

def start_service(script_name, port, service_name):
    """Start a FastAPI service"""
    try:
        print(f"Starting {service_name} on port {port}...")
        process = subprocess.Popen([
            sys.executable, "-m", "uvicorn", 
            f"server.{script_name.replace('.py', '')}:app",
            "--host", "0.0.0.0",
            "--port", str(port),
            "--reload"
        ], stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        
        time.sleep(3)
        
        if process.poll() is None:
            print(f"✓ {service_name} started successfully on port {port}")
            return process
        else:
            stdout, stderr = process.communicate()
            print(f"✗ {service_name} failed to start:")
            print(f"Error: {stderr.decode()}")
            return None
            
    except Exception as e:
        print(f"Error starting {service_name}: {e}")
        return None

def main():
    print("Granada OS FastAPI Services")
    print("===========================")
    
    if not os.path.exists("server"):
        print("Error: Please run this from the project root directory")
        return 1
    
    services = [
        ("main.py", 8000, "Main API"),
        ("bot_service.py", 8001, "Bot Service")
    ]
    
    processes = []
    
    for script, port, name in services:
        process = start_service(script, port, name)
        if process:
            processes.append((name, process, port))
    
    if processes:
        print(f"\n✓ Started {len(processes)} FastAPI services")
        print("\nFastAPI Backend Architecture:")
        print("- Main API (port 8000) - Core functionality, opportunities, admin")
        print("- Bot Service (port 8001) - Web scraping and bot management")
        print("- Express Frontend (port 5000) - React app and static files")
        print("\nAPI Documentation:")
        print("- Main API docs: http://localhost:8000/docs")
        print("- Bot Service docs: http://localhost:8001/docs")
        print("\nServices running in background. Press Ctrl+C to stop.")
        
        try:
            while True:
                time.sleep(1)
        except KeyboardInterrupt:
            print("\nStopping services...")
            for name, process, port in processes:
                process.terminate()
                print(f"Stopped {name}")
    else:
        print("No services started successfully")
        return 1
    
    return 0

if __name__ == "__main__":
    sys.exit(main())