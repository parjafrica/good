#!/usr/bin/env python3
"""
Start the Granada OS Wabden Admin System
Secure administrative dashboard on port 9000
"""

import os
import sys
import subprocess
import signal
import time

def signal_handler(sig, frame):
    print("\n🛑 Shutting down Wabden admin system...")
    sys.exit(0)

def main():
    print("🛡️  Granada OS - Wabden Admin System")
    print("=====================================")
    print("🔐 Secure administrative dashboard")
    print("🌐 Starting on port 5001...")
    print("📍 Access: http://localhost:5000/wabden")
    print("")
    
    # Register signal handler
    signal.signal(signal.SIGINT, signal_handler)
    
    # Change to wabden directory
    os.chdir('wabden')
    
    try:
        # Start the FastAPI server
        subprocess.run([
            sys.executable, "-m", "uvicorn", 
            "main:app", 
            "--host", "0.0.0.0", 
            "--port", "5001", 
            "--reload",
            "--log-level", "info"
        ])
    except KeyboardInterrupt:
        print("\n🛑 Wabden admin system stopped")
    except Exception as e:
        print(f"❌ Error starting Wabden: {e}")
        return 1

if __name__ == "__main__":
    main()