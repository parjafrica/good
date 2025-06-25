#!/usr/bin/env python3
"""
Start Granada OS Admin System
Standalone admin interface on port 9000
"""

import subprocess
import sys
import time

def main():
    print("Granada OS Admin System")
    print("======================")
    
    try:
        print("Starting admin system on port 9000...")
        
        # Start admin system
        process = subprocess.Popen([
            sys.executable, "-m", "uvicorn", 
            "admin.backend.main:app",
            "--host", "0.0.0.0",
            "--port", "9000",
            "--reload"
        ])
        
        print("✓ Admin system started successfully")
        print("")
        print("Admin Dashboard: http://localhost:9000/admin")
        print("API Documentation: http://localhost:9000/docs")
        print("")
        print("Features:")
        print("- Dashboard with real-time statistics")
        print("- User management with search and filters")
        print("- Opportunity verification and management")
        print("- Bot control and monitoring")
        print("- System logs and activity tracking")
        print("")
        print("Press Ctrl+C to stop the admin system")
        
        try:
            process.wait()
        except KeyboardInterrupt:
            print("\nStopping admin system...")
            process.terminate()
            
    except Exception as e:
        print(f"Failed to start admin system: {e}")
        return 1
    
    return 0

if __name__ == "__main__":
    sys.exit(main())