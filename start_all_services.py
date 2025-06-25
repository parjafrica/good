#!/usr/bin/env python3
"""
Start all Granada OS services - Frontend + FastAPI backend
"""

import subprocess
import sys
import time
import os
import signal

processes = []

def signal_handler(sig, frame):
    print("\nShutting down all services...")
    for process in processes:
        try:
            process.terminate()
        except:
            pass
    sys.exit(0)

signal.signal(signal.SIGINT, signal_handler)

def start_service(command, name, port=None):
    """Start a service and track the process"""
    try:
        print(f"Starting {name}...")
        process = subprocess.Popen(command, shell=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        processes.append(process)
        
        time.sleep(2)
        
        if process.poll() is None:
            port_info = f" on port {port}" if port else ""
            print(f"✓ {name} started successfully{port_info}")
            return True
        else:
            stdout, stderr = process.communicate()
            print(f"✗ {name} failed to start:")
            print(f"Error: {stderr.decode()}")
            return False
            
    except Exception as e:
        print(f"Error starting {name}: {e}")
        return False

def main():
    print("Granada OS - Complete Service Stack")
    print("==================================")
    
    if not os.path.exists("server"):
        print("Error: Please run this from the project root directory")
        return 1
    
    services = [
        ("cd server && python3 -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload", "Main API", 8000),
        ("cd server && python3 -m uvicorn bot_service:app --host 0.0.0.0 --port 8001 --reload", "Bot Service", 8001),
        ("cd server && python3 -m uvicorn admin_api:app --host 0.0.0.0 --port 8002 --reload", "Admin API", 8002),
    ]
    
    success_count = 0
    
    for command, name, port in services:
        if start_service(command, name, port):
            success_count += 1
    
    if success_count > 0:
        print(f"\n✓ Started {success_count}/3 FastAPI services")
        print("\nGranada OS Architecture:")
        print("- Frontend (React): http://localhost:5000")
        print("- Main API: http://localhost:8000 (docs: /docs)")
        print("- Bot Service: http://localhost:8001 (docs: /docs)")
        print("- Admin API: http://localhost:8002 (docs: /docs)")
        print("\nAdmin Dashboard: http://localhost:5000/admin")
        print("\nServices running. Press Ctrl+C to stop all.")
        
        try:
            while True:
                time.sleep(1)
        except KeyboardInterrupt:
            pass
    else:
        print("No services started successfully")
        return 1
    
    return 0

if __name__ == "__main__":
    sys.exit(main())