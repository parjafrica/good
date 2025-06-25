#!/bin/bash

echo "🚀 Granada OS - Unified Development Setup"
echo "========================================"

# Install all dependencies
echo "📦 Installing dependencies..."
npm install

# Install Python dependencies for Wabden
echo "🐍 Installing Python dependencies for Wabden admin system..."
cd wabden && python -m pip install -r requirements.txt
cd ..

# Start services
echo "🌐 Starting all services..."
echo "   - Main App: http://localhost:5000"
echo "   - Admin Panel: http://localhost:5000/wabden"
echo ""

# Use concurrently to run both services
npx concurrently \
  --names "MAIN,ADMIN" \
  --prefix-colors "blue,green" \
  "NODE_ENV=development npx tsx server/index.ts" \
  "cd wabden && python -m uvicorn main:app --host 0.0.0.0 --port 5001 --reload"