#!/bin/bash
echo "Starting Granada OS Admin System..."
echo "=================================="

# Kill any existing admin processes
pkill -f "uvicorn.*admin.*9000" 2>/dev/null

# Start the admin system
cd /home/runner/workspace/admin/backend
python3 -m uvicorn main:app --host 0.0.0.0 --port 9000 --reload &

# Wait for startup
sleep 3

echo "✅ Admin system started successfully!"
echo ""
echo "🌐 Access URLs:"
echo "   • Main Dashboard: http://localhost:9000/admin"
echo "   • User Management: http://localhost:9000/admin/users"
echo "   • Submissions: http://localhost:9000/admin/submissions"
echo "   • HR Management: http://localhost:9000/admin/hr"
echo "   • Accounting: http://localhost:9000/admin/accounting"
echo "   • Analytics: http://localhost:9000/admin/analytics"
echo "   • Bot Management: http://localhost:9000/admin/bots"
echo "   • System Logs: http://localhost:9000/admin/system"
echo ""
echo "📋 Features Available:"
echo "   • User Submissions & Requests Tracking"
echo "   • Human Resources Management"
echo "   • Accounting & Financial Management" 
echo "   • Enhanced Graphics & Animations"
echo "   • Real-time Charts & Analytics"
echo "   • Comprehensive Database Management"
echo ""
echo "🎨 New Design Features:"
echo "   • Gradient backgrounds and animations"
echo "   • Interactive charts with Chart.js"
echo "   • AOS scroll animations"
echo "   • Modal-based detail views"
echo "   • Advanced filtering and bulk actions"
echo ""
echo "💡 The redesigned admin system is completely separate from the main app"
echo "   and includes all the features from your requirements document."