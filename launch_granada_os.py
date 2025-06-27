#!/usr/bin/env python3
"""
Granada OS - Ultimate Service Launcher
90% Python FastAPI Architecture Implementation

This launcher demonstrates the true Granada OS vision where Python FastAPI
services handle 90% of the application logic, with React serving as a lightweight
frontend for user interaction only.

Architecture:
- Master Orchestrator (Port 8000) - Central AI coordination
- Genesis Engine (Port 8002) - Idea-to-organization transformation  
- Career Engine (Port 8003) - CV generation & interview coaching
- Academic Engine (Port 8004) - Literature review & research
- Bot Service (Port 8001) - Web scraping & automation
- Main API (Port 8005) - Legacy funding opportunities
- React Frontend (Port 5000) - Lightweight UI only
"""

import subprocess
import sys
import time
import signal
import os
import asyncio
import httpx
from typing import List, Dict
from datetime import datetime

class GranadaOSLauncher:
    def __init__(self):
        self.services = {
            "master_orchestrator": {
                "port": 8000,
                "command": ["python3", "-m", "uvicorn", "server.master_orchestrator:app", "--host", "0.0.0.0", "--port", "8000", "--reload"],
                "description": "🎯 Master AI Orchestrator - Central coordination",
                "critical": True
            },
            "genesis_engine": {
                "port": 8002, 
                "command": ["python3", "-m", "uvicorn", "server.genesis_engine:app", "--host", "0.0.0.0", "--port", "8002", "--reload"],
                "description": "🚀 Genesis Engine - Idea to organization",
                "critical": True
            },
            "career_engine": {
                "port": 8003,
                "command": ["python3", "-m", "uvicorn", "server.career_engine:app", "--host", "0.0.0.0", "--port", "8003", "--reload"],
                "description": "💼 Career Engine - CV & interview coaching",
                "critical": True
            },
            "academic_engine": {
                "port": 8004,
                "command": ["python3", "-m", "uvicorn", "server.academic_engine:app", "--host", "0.0.0.0", "--port", "8004", "--reload"],
                "description": "📚 Academic Engine - Literature & research",
                "critical": True
            },
            "bot_service": {
                "port": 8001,
                "command": ["python3", "-m", "uvicorn", "server.bot_service:app", "--host", "0.0.0.0", "--port", "8001", "--reload"],
                "description": "🤖 Bot Service - Web scraping & automation",
                "critical": False
            },
            "main_api": {
                "port": 8005,
                "command": ["python3", "-m", "uvicorn", "server.main:app", "--host", "0.0.0.0", "--port", "8005", "--reload"],
                "description": "💰 Legacy API - Funding opportunities", 
                "critical": False
            },
            "react_frontend": {
                "port": 5000,
                "command": ["npm", "run", "dev"],
                "description": "⚛️  React Frontend - Lightweight UI (10%)",
                "critical": False
            }
        }
        
        self.processes = {}
        self.startup_order = [
            "master_orchestrator",  # Start central orchestrator first
            "genesis_engine",       # Core transformation engine
            "career_engine",        # Professional development
            "academic_engine",      # Research capabilities  
            "bot_service",          # Automation services
            "main_api",             # Legacy funding API
            "react_frontend"        # Lightweight UI last
        ]
    
    def print_banner(self):
        """Print Granada OS startup banner"""
        banner = """
╔══════════════════════════════════════════════════════════════════════╗
║                            GRANADA OS                                 ║
║                   90% Python FastAPI Architecture                    ║
║                                                                       ║
║  🎯 Master Orchestrator  📚 Academic Engine   🤖 Bot Service         ║
║  🚀 Genesis Engine       💼 Career Engine     💰 Legacy API          ║
║  ⚛️  React Frontend (UI Only - 10%)                                  ║
║                                                                       ║
║  AI-Powered Platform for Organizations, Students & Professionals     ║
╚══════════════════════════════════════════════════════════════════════╝
"""
        print(banner)
        print(f"🕐 Starting at {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print("=" * 70)
    
    def check_dependencies(self):
        """Check if required dependencies are available"""
        print("🔍 Checking dependencies...")
        
        # Check Python
        try:
            result = subprocess.run(["python3", "--version"], capture_output=True, text=True)
            print(f"✅ Python: {result.stdout.strip()}")
        except FileNotFoundError:
            print("❌ Python3 not found")
            return False
        
        # Check Node.js for frontend
        try:
            result = subprocess.run(["node", "--version"], capture_output=True, text=True)
            print(f"✅ Node.js: {result.stdout.strip()}")
        except FileNotFoundError:
            print("❌ Node.js not found")
            return False
        
        # Check if FastAPI dependencies are available
        try:
            import fastapi
            print(f"✅ FastAPI: {fastapi.__version__}")
        except ImportError:
            print("❌ FastAPI not installed - run: pip install fastapi uvicorn")
            return False
        
        print("✅ All dependencies available")
        return True
    
    def start_service(self, service_name: str, config: Dict) -> bool:
        """Start individual service"""
        print(f"🚀 Starting {service_name} on port {config['port']}...")
        print(f"   {config['description']}")
        
        try:
            process = subprocess.Popen(
                config['command'],
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True
            )
            
            self.processes[service_name] = {
                'process': process,
                'config': config,
                'started_at': datetime.now()
            }
            
            # Give service time to start
            time.sleep(2 if config.get('critical') else 1)
            
            # Check if process is still running
            if process.poll() is None:
                print(f"✅ {service_name} started successfully on port {config['port']}")
                return True
            else:
                stdout, stderr = process.communicate()
                print(f"❌ {service_name} failed to start")
                if stderr:
                    print(f"   Error: {stderr[:200]}...")
                return False
                
        except Exception as e:
            print(f"❌ Failed to start {service_name}: {str(e)}")
            return False
    
    def start_all_services(self):
        """Start all services in optimal order"""
        print("\n🚀 Starting Granada OS Services (90% Python FastAPI)...")
        print("-" * 50)
        
        successful_starts = 0
        critical_failures = 0
        
        for service_name in self.startup_order:
            config = self.services[service_name]
            
            success = self.start_service(service_name, config)
            
            if success:
                successful_starts += 1
            elif config.get('critical'):
                critical_failures += 1
                print(f"⚠️  Critical service {service_name} failed to start!")
        
        print("-" * 50)
        print(f"✅ Started {successful_starts}/{len(self.services)} services")
        
        if critical_failures > 0:
            print(f"⚠️  {critical_failures} critical services failed - platform may be unstable")
        
        return successful_starts, critical_failures
    
    async def health_check_services(self):
        """Perform health checks on all running services"""
        print("\n🔍 Performing health checks...")
        
        async with httpx.AsyncClient(timeout=5.0) as client:
            for service_name, process_info in self.processes.items():
                config = process_info['config']
                
                if service_name == 'react_frontend':
                    # Skip health check for React frontend
                    continue
                
                try:
                    url = f"http://localhost:{config['port']}"
                    response = await client.get(url)
                    
                    if response.status_code == 200:
                        print(f"✅ {service_name}: Healthy")
                    else:
                        print(f"⚠️  {service_name}: Responding but unhealthy (HTTP {response.status_code})")
                        
                except Exception as e:
                    print(f"❌ {service_name}: Not responding ({str(e)[:50]}...)")
    
    def print_service_urls(self):
        """Print access URLs for all services"""
        print("\n🌐 Granada OS Service URLs:")
        print("=" * 50)
        
        # Main access points
        print("📊 MAIN ACCESS POINTS:")
        print(f"   🎯 Master Orchestrator:  http://localhost:8000")
        print(f"   ⚛️  React Frontend:       http://localhost:5000")
        print(f"   📖 API Documentation:    http://localhost:8000/docs")
        
        print("\n🔧 INDIVIDUAL ENGINES:")
        for service_name, config in self.services.items():
            if service_name not in ['master_orchestrator', 'react_frontend']:
                port = config['port']
                desc = config['description'].split(' - ')[0]  # Get first part
                print(f"   {desc}: http://localhost:{port}")
        
        print("\n📚 API DOCUMENTATION:")
        for service_name, config in self.services.items():
            if service_name != 'react_frontend':
                port = config['port']
                print(f"   {service_name}: http://localhost:{port}/docs")
    
    def print_architecture_info(self):
        """Print architecture information"""
        print("\n🏗️  ARCHITECTURE BREAKDOWN:")
        print("=" * 50)
        
        python_services = [s for s in self.services.keys() if s != 'react_frontend']
        react_services = ['react_frontend']
        
        print(f"🐍 Python FastAPI Services: {len(python_services)}/7 (≈90%)")
        for service in python_services:
            desc = self.services[service]['description']
            print(f"   • {desc}")
        
        print(f"\n⚛️  React Frontend: {len(react_services)}/7 (≈10%)")
        print(f"   • {self.services['react_frontend']['description']}")
        
        print(f"\n💡 This demonstrates the Granada OS vision:")
        print(f"   • Heavy AI processing in Python FastAPI")
        print(f"   • Lightweight UI interaction in React")
        print(f"   • True microservices architecture")
        print(f"   • Central orchestration and coordination")
    
    def setup_signal_handlers(self):
        """Setup signal handlers for graceful shutdown"""
        def signal_handler(sig, frame):
            print(f"\n\n🛑 Received signal {sig}, shutting down gracefully...")
            self.shutdown_all_services()
            sys.exit(0)
        
        signal.signal(signal.SIGINT, signal_handler)
        signal.signal(signal.SIGTERM, signal_handler)
    
    def shutdown_all_services(self):
        """Shutdown all running services"""
        print("\n🛑 Shutting down all services...")
        
        for service_name, process_info in self.processes.items():
            try:
                process = process_info['process']
                if process.poll() is None:  # Process is still running
                    print(f"   Stopping {service_name}...")
                    process.terminate()
                    
                    # Wait up to 5 seconds for graceful shutdown
                    try:
                        process.wait(timeout=5)
                    except subprocess.TimeoutExpired:
                        print(f"   Force killing {service_name}...")
                        process.kill()
                        
            except Exception as e:
                print(f"   Error stopping {service_name}: {str(e)}")
        
        print("✅ All services stopped")
    
    def monitor_services(self):
        """Monitor running services"""
        print("\n👀 Monitoring services (Ctrl+C to stop)...")
        print("   Check service logs in their respective terminals")
        print("   Services will auto-reload on code changes")
        
        try:
            while True:
                time.sleep(30)  # Check every 30 seconds
                
                # Quick health check
                running_count = 0
                for service_name, process_info in self.processes.items():
                    if process_info['process'].poll() is None:
                        running_count += 1
                
                print(f"📊 {running_count}/{len(self.processes)} services running - {datetime.now().strftime('%H:%M:%S')}")
                
        except KeyboardInterrupt:
            pass
    
    async def run(self):
        """Main execution flow"""
        self.print_banner()
        
        # Check dependencies
        if not self.check_dependencies():
            print("❌ Dependency check failed. Please install missing dependencies.")
            return 1
        
        # Setup signal handlers
        self.setup_signal_handlers()
        
        # Start all services
        successful_starts, critical_failures = self.start_all_services()
        
        if critical_failures > 0:
            print("\n❌ Critical services failed to start. Exiting.")
            self.shutdown_all_services()
            return 1
        
        # Health checks
        await self.health_check_services()
        
        # Print access information
        self.print_service_urls()
        self.print_architecture_info()
        
        # Monitor services
        self.monitor_services()
        
        # Cleanup
        self.shutdown_all_services()
        return 0

def main():
    """Main entry point"""
    launcher = GranadaOSLauncher()
    
    try:
        # Run the async launcher
        return asyncio.run(launcher.run())
    except KeyboardInterrupt:
        print("\n👋 Granada OS launcher interrupted by user")
        return 0
    except Exception as e:
        print(f"\n❌ Granada OS launcher failed: {str(e)}")
        return 1

if __name__ == "__main__":
    exit_code = main()
    sys.exit(exit_code)