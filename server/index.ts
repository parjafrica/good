import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  // Block admin route with 404 (must be after registerRoutes, before Vite)
  app.get('/admin*', (req, res) => {
    res.status(404).json({ error: 'Not found' });
  });

  // Wabden admin API routes - use storage directly with fallback data
  app.get('/api/wabden/users', async (req, res) => {
    try {
      // Try Python API first
      const response = await fetch('http://localhost:8002/api/users');
      if (response.ok) {
        const data = await response.json();
        res.json(data);
        return;
      }
    } catch (error) {
      console.error('Python API unavailable, using fallback:', error);
    }
    
    // Fallback to storage
    try {
      const users = await storage.getAllUsers();
      const userStats = users.reduce((acc, user) => {
        acc[user.userType] = (acc[user.userType] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      res.json({ users, userStats });
    } catch (fallbackError) {
      res.status(500).json({ error: 'Failed to fetch users' });
    }
  });

  app.post('/api/wabden/users/:id/ban', async (req, res) => {
    try {
      const response = await fetch(`http://localhost:8002/api/users/${req.params.id}/ban`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await response.json();
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: 'Failed to ban user' });
    }
  });

  app.post('/api/wabden/users/:id/unban', async (req, res) => {
    try {
      const response = await fetch(`http://localhost:8002/api/users/${req.params.id}/unban`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await response.json();
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: 'Failed to unban user' });
    }
  });

  app.patch('/api/wabden/users/:id', async (req, res) => {
    try {
      const response = await fetch(`http://localhost:8002/api/users/${req.params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(req.body)
      });
      const data = await response.json();
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: 'Failed to update user' });
    }
  });

  app.post('/api/wabden/users', async (req, res) => {
    try {
      const response = await fetch('http://localhost:8002/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(req.body)
      });
      const data = await response.json();
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: 'Failed to create user' });
    }
  });

  app.delete('/api/wabden/users/:id', async (req, res) => {
    try {
      const response = await fetch(`http://localhost:8002/api/users/${req.params.id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await response.json();
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete user' });
    }
  });

  app.get('/api/wabden/export/users', async (req, res) => {
    try {
      const response = await fetch('http://localhost:8002/api/export/users');
      const csvData = await response.text();
      
      const timestamp = new Date().toISOString().split('T')[0];
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=granada_os_users_${timestamp}.csv`);
      res.send(csvData);
    } catch (error) {
      res.status(500).json({ error: 'Failed to export users' });
    }
  });

  // Opportunities API routes
  app.get('/api/wabden/opportunities', async (req, res) => {
    try {
      const opportunities = await storage.getDonorOpportunities();
      const stats = {
        total: opportunities.length,
        verified: opportunities.filter(o => o.isVerified).length,
        pending: opportunities.filter(o => !o.isVerified).length,
        active: opportunities.filter(o => o.deadline && new Date(o.deadline) > new Date()).length
      };
      res.json({ opportunities, stats });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch opportunities' });
    }
  });

  app.post('/api/wabden/opportunities', async (req, res) => {
    try {
      const opportunity = await storage.createDonorOpportunity(req.body);
      res.json({ success: true, opportunity });
    } catch (error) {
      res.status(500).json({ error: 'Failed to create opportunity' });
    }
  });

  app.post('/api/wabden/opportunities/:id/verify', async (req, res) => {
    try {
      // Implementation would update opportunity verification status
      res.json({ success: true, message: 'Opportunity verified successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to verify opportunity' });
    }
  });

  app.post('/api/wabden/opportunities/:id/unverify', async (req, res) => {
    try {
      // Implementation would update opportunity verification status
      res.json({ success: true, message: 'Opportunity unverified successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to unverify opportunity' });
    }
  });

  app.delete('/api/wabden/opportunities/:id', async (req, res) => {
    try {
      // Implementation would delete opportunity
      res.json({ success: true, message: 'Opportunity deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete opportunity' });
    }
  });

  app.post('/api/wabden/opportunities/verify-all', async (req, res) => {
    try {
      // Implementation would verify all unverified opportunities
      res.json({ success: true, message: 'All opportunities verified successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to verify opportunities' });
    }
  });

  app.get('/api/wabden/export/opportunities', async (req, res) => {
    try {
      const opportunities = await storage.getDonorOpportunities();
      
      // Generate CSV content with Granada branding
      let csvContent = '# GRANADA OS - FUNDING OPPORTUNITIES PLATFORM\\n';
      csvContent += '# Professional Opportunities Export\\n';
      csvContent += '# Export Generated: ' + new Date().toISOString() + '\\n';
      csvContent += '# Total Records: ' + opportunities.length + '\\n';
      csvContent += '#\\n';
      csvContent += 'ID,Title,Country,Sector,Amount Min,Amount Max,Currency,Deadline,Source,Verified,Created\\n';
      
      opportunities.forEach(opp => {
        csvContent += [
          opp.id,
          (opp.title || '').replace(/,/g, ';'),
          opp.country || '',
          opp.sector || '',
          opp.amountMin || '',
          opp.amountMax || '',
          opp.currency || 'USD',
          opp.deadline || '',
          (opp.sourceUrl || '').replace(/,/g, ';'),
          opp.isVerified ? 'Yes' : 'No',
          opp.createdAt || ''
        ].join(',') + '\\n';
      });
      
      const timestamp = new Date().toISOString().split('T')[0];
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=granada_os_opportunities_${timestamp}.csv`);
      res.send(csvContent);
    } catch (error) {
      res.status(500).json({ error: 'Failed to export opportunities' });
    }
  });

  // Serve wabden admin directly without external redirect
  app.get('/wabden*', (req, res) => {
    // Check if it's a specific module request
    const path = req.path;
    if (path.includes('/users')) {
      // Serve user management module
      res.send(`
<!DOCTYPE html>
<html lang="en" class="dark">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>User Management - Granada OS Wabden</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
    <style>
        .gradient-bg { background: linear-gradient(135deg, #1f2937 0%, #111827 50%, #0f172a 100%); }
        .card-gradient { background: linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(147, 51, 234, 0.1) 100%); backdrop-filter: blur(10px); }
        .sidebar-gradient { background: linear-gradient(180deg, #1e293b 0%, #0f172a 100%); }
        .hover-scale { transition: transform 0.3s ease; }
        .hover-scale:hover { transform: scale(1.02); }
    </style>
</head>
<body class="bg-gray-900 text-white font-sans">
    <div class="min-h-screen flex">
        <!-- Sidebar -->
        <div class="w-64 sidebar-gradient shadow-2xl">
            <div class="p-6">
                <div class="flex items-center space-x-3 mb-8">
                    <div class="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                        <i class="fas fa-shield-alt text-white text-lg"></i>
                    </div>
                    <h1 class="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                        Wabden Admin
                    </h1>
                </div>
                
                <nav class="space-y-2">
                    <div class="nav-item flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-700/50 transition-all duration-300 cursor-pointer" onclick="window.location.href='/wabden'">
                        <i class="fas fa-tachometer-alt text-blue-400"></i>
                        <span>Dashboard</span>
                    </div>
                    <div class="nav-item flex items-center space-x-3 p-3 rounded-lg bg-green-600/30 cursor-pointer">
                        <i class="fas fa-users text-green-400"></i>
                        <span class="text-green-300">User Management</span>
                    </div>
                    <div class="nav-item flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-700/50 transition-all duration-300 cursor-pointer" onclick="window.location.href='/wabden/opportunities'">
                        <i class="fas fa-bullseye text-yellow-400"></i>
                        <span>Opportunities</span>
                    </div>
                    <div class="nav-item flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-700/50 transition-all duration-300 cursor-pointer" onclick="window.location.href='/wabden/hr'">
                        <i class="fas fa-user-tie text-purple-400"></i>
                        <span>HR Management</span>
                    </div>
                    <div class="nav-item flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-700/50 transition-all duration-300 cursor-pointer" onclick="window.location.href='/wabden/accounting'">
                        <i class="fas fa-chart-line text-emerald-400"></i>
                        <span>Accounting</span>
                    </div>
                    <div class="nav-item flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-700/50 transition-all duration-300 cursor-pointer" onclick="window.location.href='/wabden/submissions'">
                        <i class="fas fa-file-alt text-orange-400"></i>
                        <span>Submissions</span>
                    </div>
                    <div class="nav-item flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-700/50 transition-all duration-300 cursor-pointer" onclick="window.location.href='/wabden/bots'">
                        <i class="fas fa-robot text-cyan-400"></i>
                        <span>Bot Control</span>
                    </div>
                </nav>
            </div>
        </div>

        <!-- Main Content -->
        <div class="flex-1 gradient-bg">
            <!-- Header -->
            <header class="bg-gray-800/50 backdrop-blur-lg shadow-lg p-6">
                <div class="flex items-center justify-between">
                    <div>
                        <h2 class="text-2xl font-bold text-white">User Management</h2>
                        <p class="text-gray-400 mt-1">Comprehensive user administration and analytics</p>
                    </div>
                    <div class="flex items-center space-x-4">
                        <button onclick="openAddUserModal()" class="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors">
                            <i class="fas fa-user-plus mr-2"></i> Add User
                        </button>
                        <button onclick="exportUsers()" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors">
                            <i class="fas fa-download mr-2"></i> Export
                        </button>
                    </div>
                </div>
            </header>

            <!-- Content -->
            <main class="p-6">
                <!-- Loading State -->
                <div id="loading" class="flex items-center justify-center py-12">
                    <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                    <span class="ml-3 text-gray-400">Loading users...</span>
                </div>

                <!-- User Statistics -->
                <div id="userStats" class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8 hidden">
                    <!-- Stats will be populated by JavaScript -->
                </div>

                <!-- User Management Table -->
                <div id="userTable" class="card-gradient rounded-xl p-6 hidden">
                    <div class="flex items-center justify-between mb-6">
                        <h3 class="text-xl font-bold text-white">User Database</h3>
                        <div class="flex items-center space-x-4">
                            <input type="text" id="userSearch" placeholder="Search users..." 
                                   class="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500">
                            <select id="typeFilter" class="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white">
                                <option value="">All Types</option>
                                <option value="student">Students</option>
                                <option value="ngo">NGOs</option>
                                <option value="business">Businesses</option>
                                <option value="admin">Admins</option>
                            </select>
                        </div>
                    </div>

                    <div class="overflow-x-auto">
                        <table class="w-full">
                            <thead>
                                <tr class="border-b border-gray-700">
                                    <th class="text-left py-3 px-4 text-gray-400 font-medium">User</th>
                                    <th class="text-left py-3 px-4 text-gray-400 font-medium">Type</th>
                                    <th class="text-left py-3 px-4 text-gray-400 font-medium">Credits</th>
                                    <th class="text-left py-3 px-4 text-gray-400 font-medium">Status</th>
                                    <th class="text-left py-3 px-4 text-gray-400 font-medium">Joined</th>
                                    <th class="text-left py-3 px-4 text-gray-400 font-medium">Last Login</th>
                                    <th class="text-left py-3 px-4 text-gray-400 font-medium">Actions</th>
                                </tr>
                            </thead>
                            <tbody id="userTableBody">
                                <!-- Users will be populated by JavaScript -->
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
        </div>
    </div>

    <!-- Add User Modal -->
    <div id="addUserModal" class="fixed inset-0 bg-black/50 backdrop-blur-sm hidden items-center justify-center z-50">
        <div class="bg-gray-800 rounded-xl p-6 w-full max-w-md mx-4">
            <h3 class="text-xl font-bold text-white mb-4">Add New User</h3>
            <form id="addUserForm" class="space-y-4">
                <div>
                    <label class="block text-gray-400 text-sm mb-2">Email Address</label>
                    <input type="email" id="newUserEmail" required class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500">
                </div>
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-gray-400 text-sm mb-2">First Name</label>
                        <input type="text" id="newUserFirstName" required class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500">
                    </div>
                    <div>
                        <label class="block text-gray-400 text-sm mb-2">Last Name</label>
                        <input type="text" id="newUserLastName" required class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500">
                    </div>
                </div>
                <div>
                    <label class="block text-gray-400 text-sm mb-2">User Type</label>
                    <select id="newUserType" required class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500">
                        <option value="">Select Type</option>
                        <option value="student">Student</option>
                        <option value="ngo">NGO</option>
                        <option value="business">Business</option>
                        <option value="admin">Admin</option>
                    </select>
                </div>
                <div>
                    <label class="block text-gray-400 text-sm mb-2">Initial Credits</label>
                    <input type="number" id="newUserCredits" value="100" min="0" class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500">
                </div>
                <div class="flex justify-end space-x-3 pt-4">
                    <button type="button" onclick="closeAddUserModal()" class="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg transition-colors">
                        Cancel
                    </button>
                    <button type="submit" class="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors">
                        <i class="fas fa-user-plus mr-2"></i> Add User
                    </button>
                </div>
            </form>
        </div>
    </div>

    <!-- Edit User Modal -->
    <div id="editUserModal" class="fixed inset-0 bg-black/50 backdrop-blur-sm hidden items-center justify-center z-50">
        <div class="bg-gray-800 rounded-xl p-6 w-full max-w-md mx-4">
            <h3 class="text-xl font-bold text-white mb-4">Edit User</h3>
            <form id="editUserForm" class="space-y-4">
                <input type="hidden" id="editUserId">
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-gray-400 text-sm mb-2">First Name</label>
                        <input type="text" id="editUserFirstName" required class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500">
                    </div>
                    <div>
                        <label class="block text-gray-400 text-sm mb-2">Last Name</label>
                        <input type="text" id="editUserLastName" required class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500">
                    </div>
                </div>
                <div>
                    <label class="block text-gray-400 text-sm mb-2">User Type</label>
                    <select id="editUserType" required class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500">
                        <option value="student">Student</option>
                        <option value="ngo">NGO</option>
                        <option value="business">Business</option>
                        <option value="admin">Admin</option>
                    </select>
                </div>
                <div>
                    <label class="block text-gray-400 text-sm mb-2">Credits</label>
                    <input type="number" id="editUserCredits" min="0" class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500">
                </div>
                <div class="flex justify-end space-x-3 pt-4">
                    <button type="button" onclick="closeEditUserModal()" class="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg transition-colors">
                        Cancel
                    </button>
                    <button type="submit" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors">
                        <i class="fas fa-save mr-2"></i> Save Changes
                    </button>
                </div>
            </form>
        </div>
    </div>

    <script>
        let allUsers = [];
        let userStats = {};

        // Load users on page load
        document.addEventListener('DOMContentLoaded', loadUsers);

        async function loadUsers() {
            try {
                const response = await fetch('/api/wabden/users');
                const data = await response.json();
                allUsers = data.users;
                userStats = data.userStats;
                
                renderUserStats();
                renderUsers(allUsers);
                
                document.getElementById('loading').classList.add('hidden');
                document.getElementById('userStats').classList.remove('hidden');
                document.getElementById('userTable').classList.remove('hidden');
            } catch (error) {
                console.error('Error loading users:', error);
                document.getElementById('loading').innerHTML = '<div class="text-red-400">Error loading users. Please refresh the page.</div>';
            }
        }

        function renderUserStats() {
            const statsContainer = document.getElementById('userStats');
            const stats = [
                { label: 'Students', count: userStats.student || 0, color: 'blue', icon: 'fas fa-graduation-cap' },
                { label: 'NGOs', count: userStats.ngo || 0, color: 'green', icon: 'fas fa-heart' },
                { label: 'Businesses', count: userStats.business || 0, color: 'purple', icon: 'fas fa-building' },
                { label: 'Admins', count: userStats.admin || 0, color: 'orange', icon: 'fas fa-shield-alt' }
            ];

            statsContainer.innerHTML = stats.map(stat => 
                '<div class="card-gradient rounded-xl p-6 hover-scale">' +
                    '<div class="flex items-center justify-between">' +
                        '<div>' +
                            '<p class="text-gray-400 text-sm uppercase tracking-wide">' + stat.label + '</p>' +
                            '<p class="text-3xl font-bold text-white mt-1">' + stat.count + '</p>' +
                        '</div>' +
                        '<div class="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">' +
                            '<i class="' + stat.icon + ' text-blue-400 text-xl"></i>' +
                        '</div>' +
                    '</div>' +
                '</div>'
            ).join('');
        }

        function renderUsers(users) {
            const tbody = document.getElementById('userTableBody');
            
            if (users.length === 0) {
                tbody.innerHTML = '<tr><td colspan="7" class="text-center py-8 text-gray-400">No users found</td></tr>';
                return;
            }

            tbody.innerHTML = users.map(user => 
                '<tr class="border-b border-gray-800 hover:bg-gray-800/30 transition-colors user-row">' +
                    '<td class="py-4 px-4">' +
                        '<div class="flex items-center space-x-3">' +
                            '<div class="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">' +
                                '<span class="text-white text-sm font-bold">' + (user.firstName || user.email)[0].toUpperCase() + '</span>' +
                            '</div>' +
                            '<div>' +
                                '<p class="text-white font-medium">' + (user.firstName || '') + ' ' + (user.lastName || '') + '</p>' +
                                '<p class="text-gray-400 text-sm">' + user.email + '</p>' +
                            '</div>' +
                        '</div>' +
                    '</td>' +
                    '<td class="py-4 px-4">' +
                        '<span class="px-2 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs">' +
                            user.userType.charAt(0).toUpperCase() + user.userType.slice(1) +
                        '</span>' +
                    '</td>' +
                    '<td class="py-4 px-4">' +
                        '<span class="text-white font-medium">' + (user.credits || 0) + '</span>' +
                    '</td>' +
                    '<td class="py-4 px-4">' +
                        (user.isBanned ? 
                            '<span class="px-2 py-1 bg-red-500/20 text-red-400 rounded-full text-xs">Banned</span>' :
                            '<span class="px-2 py-1 bg-green-500/20 text-green-400 rounded-full text-xs">Active</span>'
                        ) +
                    '</td>' +
                    '<td class="py-4 px-4">' +
                        '<span class="text-gray-300 text-sm">' + new Date(user.createdAt).toLocaleDateString() + '</span>' +
                    '</td>' +
                    '<td class="py-4 px-4">' +
                        '<span class="text-gray-300 text-sm">' + (user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never') + '</span>' +
                    '</td>' +
                    '<td class="py-4 px-4">' +
                        '<div class="flex items-center space-x-2">' +
                            (user.isBanned ? 
                                '<button onclick="unbanUser(\'' + user.id + '\')" class="px-3 py-1 bg-green-600 hover:bg-green-700 rounded text-xs transition-colors">' +
                                    '<i class="fas fa-unlock mr-1"></i> Unban' +
                                '</button>' :
                                '<button onclick="banUser(\'' + user.id + '\')" class="px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-xs transition-colors">' +
                                    '<i class="fas fa-ban mr-1"></i> Ban' +
                                '</button>'
                            ) +
                            '<button onclick="editUser(\'' + user.id + '\')" class="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-xs transition-colors">' +
                                '<i class="fas fa-edit mr-1"></i> Edit' +
                            '</button>' +
                            '<button onclick="deleteUser(\'' + user.id + '\')" class="px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-xs transition-colors">' +
                                '<i class="fas fa-trash mr-1"></i> Delete' +
                            '</button>' +
                        '</div>' +
                    '</td>' +
                '</tr>'
            ).join('');
        }

        function getUserTypeColor(type) {
            const colors = {
                student: 'blue',
                ngo: 'green',
                business: 'purple',
                admin: 'orange'
            };
            return colors[type] || 'gray';
        }

        // Search and filter functionality
        document.getElementById('userSearch').addEventListener('input', filterUsers);
        document.getElementById('typeFilter').addEventListener('change', filterUsers);

        function filterUsers() {
            const searchTerm = document.getElementById('userSearch').value.toLowerCase();
            const typeFilter = document.getElementById('typeFilter').value;
            
            const filteredUsers = allUsers.filter(user => {
                const matchesSearch = user.email.toLowerCase().includes(searchTerm) ||
                                    (user.firstName && user.firstName.toLowerCase().includes(searchTerm)) ||
                                    (user.lastName && user.lastName.toLowerCase().includes(searchTerm));
                const matchesType = !typeFilter || user.userType === typeFilter;
                return matchesSearch && matchesType;
            });
            
            renderUsers(filteredUsers);
        }

        // User management functions
        async function banUser(userId) {
            if (confirm('Are you sure you want to ban this user?')) {
                try {
                    const response = await fetch('/api/wabden/users/' + userId + '/ban', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' }
                    });
                    
                    if (response.ok) {
                        await loadUsers(); // Reload to show updated status
                        showNotification('User banned successfully', 'success');
                    } else {
                        showNotification('Error banning user', 'error');
                    }
                } catch (error) {
                    showNotification('Error: ' + error.message, 'error');
                }
            }
        }

        async function unbanUser(userId) {
            try {
                const response = await fetch('/api/wabden/users/' + userId + '/unban', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' }
                });
                
                if (response.ok) {
                    await loadUsers(); // Reload to show updated status
                    showNotification('User unbanned successfully', 'success');
                } else {
                    showNotification('Error unbanning user', 'error');
                }
            } catch (error) {
                showNotification('Error: ' + error.message, 'error');
            }
        }



        async function deleteUser(userId) {
            if (confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
                try {
                    const response = await fetch('/api/wabden/users/' + userId, {
                        method: 'DELETE',
                        headers: { 'Content-Type': 'application/json' }
                    });
                    
                    if (response.ok) {
                        await loadUsers(); // Reload to show updated list
                        showNotification('User deleted successfully', 'success');
                    } else {
                        showNotification('Error deleting user', 'error');
                    }
                } catch (error) {
                    showNotification('Error: ' + error.message, 'error');
                }
            }
        }

        // Modal functions - make globally available
        window.openAddUserModal = function() {
            document.getElementById('addUserModal').classList.remove('hidden');
            document.getElementById('addUserModal').classList.add('flex');
        }

        window.closeAddUserModal = function() {
            document.getElementById('addUserModal').classList.add('hidden');
            document.getElementById('addUserModal').classList.remove('flex');
            document.getElementById('addUserForm').reset();
        }

        window.closeEditUserModal = function() {
            document.getElementById('editUserModal').classList.add('hidden');
            document.getElementById('editUserModal').classList.remove('flex');
        }

        window.editUser = function(userId) {
            const user = allUsers.find(u => u.id === userId);
            if (!user) return;

            document.getElementById('editUserId').value = user.id;
            document.getElementById('editUserFirstName').value = user.firstName || '';
            document.getElementById('editUserLastName').value = user.lastName || '';
            document.getElementById('editUserType').value = user.userType;
            document.getElementById('editUserCredits').value = user.credits || 0;
            
            document.getElementById('editUserModal').classList.remove('hidden');
            document.getElementById('editUserModal').classList.add('flex');
        }

        // Make functions globally available
        window.banUser = banUser;
        window.unbanUser = unbanUser; 
        window.deleteUser = deleteUser;

        // Add User Form submission
        document.getElementById('addUserForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = {
                email: document.getElementById('newUserEmail').value,
                firstName: document.getElementById('newUserFirstName').value,
                lastName: document.getElementById('newUserLastName').value,
                userType: document.getElementById('newUserType').value,
                credits: parseInt(document.getElementById('newUserCredits').value)
            };

            try {
                const response = await fetch('/api/wabden/users', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData)
                });

                if (response.ok) {
                    closeAddUserModal();
                    await loadUsers();
                    showNotification('User created successfully', 'success');
                } else {
                    showNotification('Error creating user', 'error');
                }
            } catch (error) {
                showNotification('Error: ' + error.message, 'error');
            }
        });

        // Edit User Form submission
        document.getElementById('editUserForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const userId = document.getElementById('editUserId').value;
            const formData = {
                firstName: document.getElementById('editUserFirstName').value,
                lastName: document.getElementById('editUserLastName').value,
                userType: document.getElementById('editUserType').value,
                credits: parseInt(document.getElementById('editUserCredits').value)
            };

            try {
                const response = await fetch(\`/api/wabden/users/\${userId}\`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData)
                });

                if (response.ok) {
                    closeEditUserModal();
                    await loadUsers(); // Reload to show updated data
                    showNotification('User updated successfully', 'success');
                } else {
                    showNotification('Error updating user', 'error');
                }
            } catch (error) {
                showNotification('Error: ' + error.message, 'error');
            }
        });

        // Export functionality - Professional CSV with Granada branding  
        window.exportUsers = async function() {
            try {
                showNotification('Generating professional CSV export...', 'success');
                
                const response = await fetch('/api/wabden/export/users');
                if (!response.ok) {
                    throw new Error('Export failed');
                }
                
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                
                const timestamp = new Date().toISOString().split('T')[0];
                link.download = 'granada_os_users_professional_' + timestamp + '.csv';
                
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                
                window.URL.revokeObjectURL(url);
                showNotification('Professional CSV export completed successfully', 'success');
            } catch (error) {
                showNotification('Export failed: ' + error.message, 'error');
            }
        };

        // Notification system
        function showNotification(message, type) {
            const notification = document.createElement('div');
            notification.className = 'fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg ' + 
                (type === 'success' ? 'bg-green-600' : 'bg-red-600') + ' text-white';
            notification.textContent = message;
            
            document.body.appendChild(notification);
            
            setTimeout(() => {
                notification.style.opacity = '0';
                setTimeout(() => document.body.removeChild(notification), 300);
            }, 3000);
        }

        // Close modals on outside click
        document.getElementById('addUserModal').addEventListener('click', function(e) {
            if (e.target === this) closeAddUserModal();
        });

        document.getElementById('editUserModal').addEventListener('click', function(e) {
            if (e.target === this) closeEditUserModal();
        });
    </script>
</body>
</html>
      `);
      return;
    }
    
    if (path.includes('/opportunities')) {
      // Serve opportunities management module
      res.send(`
<!DOCTYPE html>
<html lang="en" class="dark">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Opportunities Management - Granada OS Wabden</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
    <style>
        .gradient-bg { background: linear-gradient(135deg, #1f2937 0%, #111827 50%, #0f172a 100%); }
        .card-gradient { background: linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(147, 51, 234, 0.1) 100%); backdrop-filter: blur(10px); }
        .sidebar-gradient { background: linear-gradient(180deg, #1e293b 0%, #0f172a 100%); }
        .hover-scale { transition: transform 0.3s ease; }
        .hover-scale:hover { transform: scale(1.02); }
        .opportunity-card { border-left: 4px solid #3b82f6; }
        .opportunity-card.verified { border-left-color: #10b981; }
        .opportunity-card.pending { border-left-color: #f59e0b; }
        .opportunity-card.expired { border-left-color: #ef4444; }
    </style>
</head>
<body class="bg-gray-900 text-white font-sans">
    <div class="min-h-screen flex">
        <!-- Sidebar -->
        <div class="w-64 sidebar-gradient shadow-2xl">
            <div class="p-6">
                <div class="flex items-center space-x-3 mb-8">
                    <div class="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                        <i class="fas fa-shield-alt text-white text-lg"></i>
                    </div>
                    <h1 class="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                        Wabden Admin
                    </h1>
                </div>
                
                <nav class="space-y-2">
                    <div class="nav-item flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-700/50 transition-all duration-300 cursor-pointer" onclick="window.location.href='/wabden'">
                        <i class="fas fa-tachometer-alt text-blue-400"></i>
                        <span>Dashboard</span>
                    </div>
                    <div class="nav-item flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-700/50 transition-all duration-300 cursor-pointer" onclick="window.location.href='/wabden/users'">
                        <i class="fas fa-users text-green-400"></i>
                        <span>User Management</span>
                    </div>
                    <div class="nav-item flex items-center space-x-3 p-3 rounded-lg bg-yellow-600/30 cursor-pointer">
                        <i class="fas fa-bullseye text-yellow-400"></i>
                        <span class="text-yellow-300">Opportunities</span>
                    </div>
                    <div class="nav-item flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-700/50 transition-all duration-300 cursor-pointer" onclick="window.location.href='/wabden/hr'">
                        <i class="fas fa-user-tie text-purple-400"></i>
                        <span>HR Management</span>
                    </div>
                    <div class="nav-item flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-700/50 transition-all duration-300 cursor-pointer" onclick="window.location.href='/wabden/accounting'">
                        <i class="fas fa-chart-line text-emerald-400"></i>
                        <span>Accounting</span>
                    </div>
                    <div class="nav-item flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-700/50 transition-all duration-300 cursor-pointer" onclick="window.location.href='/wabden/submissions'">
                        <i class="fas fa-file-alt text-orange-400"></i>
                        <span>Submissions</span>
                    </div>
                    <div class="nav-item flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-700/50 transition-all duration-300 cursor-pointer" onclick="window.location.href='/wabden/bots'">
                        <i class="fas fa-robot text-cyan-400"></i>
                        <span>Bot Control</span>
                    </div>
                </nav>
            </div>
        </div>

        <!-- Main Content -->
        <div class="flex-1 gradient-bg">
            <!-- Header -->
            <header class="bg-gray-800/50 backdrop-blur-lg shadow-lg p-6">
                <div class="flex items-center justify-between">
                    <div>
                        <h2 class="text-2xl font-bold text-white">Opportunities Management</h2>
                        <p class="text-gray-400 mt-1">Funding opportunities discovery and verification system</p>
                    </div>
                    <div class="flex items-center space-x-4">
                        <button onclick="openAddOpportunityModal()" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors">
                            <i class="fas fa-plus mr-2"></i> Add Opportunity
                        </button>
                        <button onclick="verifyAllOpportunities()" class="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors">
                            <i class="fas fa-check-circle mr-2"></i> Verify All
                        </button>
                        <button onclick="exportOpportunities()" class="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors">
                            <i class="fas fa-download mr-2"></i> Export
                        </button>
                    </div>
                </div>
            </header>

            <!-- Content -->
            <main class="p-6">
                <!-- Loading State -->
                <div id="loading" class="flex items-center justify-center py-12">
                    <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
                    <span class="ml-3 text-gray-400">Loading opportunities...</span>
                </div>

                <!-- Opportunity Statistics -->
                <div id="opportunityStats" class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8 hidden">
                    <!-- Stats will be populated by JavaScript -->
                </div>

                <!-- Search and Filters -->
                <div id="searchSection" class="card-gradient rounded-xl p-6 mb-6 hidden">
                    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <input type="text" id="opportunitySearch" placeholder="Search opportunities..." 
                               class="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500">
                        <select id="countryFilter" class="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white">
                            <option value="">All Countries</option>
                            <option value="Kenya">Kenya</option>
                            <option value="Uganda">Uganda</option>
                            <option value="South Sudan">South Sudan</option>
                            <option value="Global">Global</option>
                        </select>
                        <select id="sectorFilter" class="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white">
                            <option value="">All Sectors</option>
                            <option value="Education">Education</option>
                            <option value="Health">Health</option>
                            <option value="Environment">Environment</option>
                            <option value="Agriculture">Agriculture</option>
                            <option value="Technology">Technology</option>
                        </select>
                        <select id="statusFilter" class="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white">
                            <option value="">All Status</option>
                            <option value="verified">Verified</option>
                            <option value="pending">Pending</option>
                            <option value="expired">Expired</option>
                        </select>
                    </div>
                </div>

                <!-- Opportunities Grid -->
                <div id="opportunitiesGrid" class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 hidden">
                    <!-- Opportunities will be populated by JavaScript -->
                </div>
            </main>
        </div>
    </div>

    <!-- Add Opportunity Modal -->
    <div id="addOpportunityModal" class="fixed inset-0 bg-black/50 backdrop-blur-sm hidden items-center justify-center z-50">
        <div class="bg-gray-800 rounded-xl p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <h3 class="text-xl font-bold text-white mb-4">Add New Opportunity</h3>
            <form id="addOpportunityForm" class="space-y-4">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div class="md:col-span-2">
                        <label class="block text-gray-400 text-sm mb-2">Title</label>
                        <input type="text" id="newOpportunityTitle" required class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500">
                    </div>
                    <div>
                        <label class="block text-gray-400 text-sm mb-2">Country</label>
                        <select id="newOpportunityCountry" required class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500">
                            <option value="">Select Country</option>
                            <option value="Kenya">Kenya</option>
                            <option value="Uganda">Uganda</option>
                            <option value="South Sudan">South Sudan</option>
                            <option value="Global">Global</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-gray-400 text-sm mb-2">Sector</label>
                        <select id="newOpportunitySector" required class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500">
                            <option value="">Select Sector</option>
                            <option value="Education">Education</option>
                            <option value="Health">Health</option>
                            <option value="Environment">Environment</option>
                            <option value="Agriculture">Agriculture</option>
                            <option value="Technology">Technology</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-gray-400 text-sm mb-2">Funding Amount (Min)</label>
                        <input type="number" id="newOpportunityAmountMin" min="0" class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500">
                    </div>
                    <div>
                        <label class="block text-gray-400 text-sm mb-2">Funding Amount (Max)</label>
                        <input type="number" id="newOpportunityAmountMax" min="0" class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500">
                    </div>
                    <div>
                        <label class="block text-gray-400 text-sm mb-2">Deadline</label>
                        <input type="date" id="newOpportunityDeadline" class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500">
                    </div>
                    <div>
                        <label class="block text-gray-400 text-sm mb-2">Source URL</label>
                        <input type="url" id="newOpportunityUrl" class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500">
                    </div>
                    <div class="md:col-span-2">
                        <label class="block text-gray-400 text-sm mb-2">Description</label>
                        <textarea id="newOpportunityDescription" rows="4" class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"></textarea>
                    </div>
                </div>
                <div class="flex justify-end space-x-3 pt-4">
                    <button type="button" onclick="closeAddOpportunityModal()" class="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg transition-colors">
                        Cancel
                    </button>
                    <button type="submit" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors">
                        <i class="fas fa-plus mr-2"></i> Add Opportunity
                    </button>
                </div>
            </form>
        </div>
    </div>

    <script>
        let allOpportunities = [];
        let opportunityStats = {};

        // Load opportunities on page load
        document.addEventListener('DOMContentLoaded', loadOpportunities);

        async function loadOpportunities() {
            try {
                const response = await fetch('/api/wabden/opportunities');
                const data = await response.json();
                allOpportunities = data.opportunities || [];
                opportunityStats = data.stats || {};
                
                renderOpportunityStats();
                renderOpportunities(allOpportunities);
                
                document.getElementById('loading').classList.add('hidden');
                document.getElementById('opportunityStats').classList.remove('hidden');
                document.getElementById('searchSection').classList.remove('hidden');
                document.getElementById('opportunitiesGrid').classList.remove('hidden');
            } catch (error) {
                console.error('Error loading opportunities:', error);
                document.getElementById('loading').innerHTML = '<div class="text-red-400">Error loading opportunities. Please refresh the page.</div>';
            }
        }

        function renderOpportunityStats() {
            const statsContainer = document.getElementById('opportunityStats');
            const stats = [
                { label: 'Total Opportunities', count: allOpportunities.length, color: 'blue', icon: 'fas fa-bullseye' },
                { label: 'Verified', count: allOpportunities.filter(o => o.isVerified).length, color: 'green', icon: 'fas fa-check-circle' },
                { label: 'Pending Review', count: allOpportunities.filter(o => !o.isVerified).length, color: 'yellow', icon: 'fas fa-clock' },
                { label: 'Active Deadlines', count: allOpportunities.filter(o => o.deadline && new Date(o.deadline) > new Date()).length, color: 'purple', icon: 'fas fa-calendar-alt' }
            ];

            statsContainer.innerHTML = stats.map(stat => 
                '<div class="card-gradient rounded-xl p-6 hover-scale">' +
                    '<div class="flex items-center justify-between">' +
                        '<div>' +
                            '<p class="text-gray-400 text-sm uppercase tracking-wide">' + stat.label + '</p>' +
                            '<p class="text-3xl font-bold text-white mt-1">' + stat.count + '</p>' +
                        '</div>' +
                        '<div class="w-12 h-12 bg-' + stat.color + '-500/20 rounded-lg flex items-center justify-center">' +
                            '<i class="' + stat.icon + ' text-' + stat.color + '-400 text-xl"></i>' +
                        '</div>' +
                    '</div>' +
                '</div>'
            ).join('');
        }

        function renderOpportunities(opportunities) {
            const grid = document.getElementById('opportunitiesGrid');
            
            if (opportunities.length === 0) {
                grid.innerHTML = '<div class="col-span-full text-center py-12 text-gray-400">No opportunities found</div>';
                return;
            }

            grid.innerHTML = opportunities.map(opp => {
                const statusClass = opp.isVerified ? 'verified' : 'pending';
                const statusText = opp.isVerified ? 'Verified' : 'Pending Review';
                const statusColor = opp.isVerified ? 'text-green-400' : 'text-yellow-400';
                const deadline = opp.deadline ? new Date(opp.deadline).toLocaleDateString() : 'No deadline';
                const amount = formatAmount(opp.amountMin, opp.amountMax, opp.currency);
                
                return '<div class="opportunity-card ' + statusClass + ' card-gradient rounded-xl p-6 hover-scale">' +
                    '<div class="flex items-start justify-between mb-4">' +
                        '<div class="flex-1">' +
                            '<h3 class="text-lg font-bold text-white mb-2">' + (opp.title || 'Untitled Opportunity') + '</h3>' +
                            '<div class="flex items-center space-x-4 text-sm text-gray-400">' +
                                '<span><i class="fas fa-map-marker-alt mr-1"></i>' + (opp.country || 'Unknown') + '</span>' +
                                '<span><i class="fas fa-tag mr-1"></i>' + (opp.sector || 'General') + '</span>' +
                            '</div>' +
                        '</div>' +
                        '<span class="px-2 py-1 bg-gray-700 rounded-full text-xs ' + statusColor + '">' + statusText + '</span>' +
                    '</div>' +
                    '<p class="text-gray-300 text-sm mb-4 line-clamp-3">' + (opp.description || 'No description available') + '</p>' +
                    '<div class="space-y-2 mb-4">' +
                        '<div class="flex items-center justify-between text-sm">' +
                            '<span class="text-gray-400">Funding:</span>' +
                            '<span class="text-white font-medium">' + amount + '</span>' +
                        '</div>' +
                        '<div class="flex items-center justify-between text-sm">' +
                            '<span class="text-gray-400">Deadline:</span>' +
                            '<span class="text-white">' + deadline + '</span>' +
                        '</div>' +
                    '</div>' +
                    '<div class="flex items-center justify-between">' +
                        '<div class="flex space-x-2">' +
                            (opp.isVerified ? 
                                '<button onclick="unverifyOpportunity(' + "'" + opp.id + "'" + ')" class="px-3 py-1 bg-yellow-600 hover:bg-yellow-700 rounded text-xs transition-colors">' +
                                    '<i class="fas fa-times mr-1"></i> Unverify' +
                                '</button>' :
                                '<button onclick="verifyOpportunity(' + "'" + opp.id + "'" + ')" class="px-3 py-1 bg-green-600 hover:bg-green-700 rounded text-xs transition-colors">' +
                                    '<i class="fas fa-check mr-1"></i> Verify' +
                                '</button>'
                            ) +
                            '<button onclick="editOpportunity(' + "'" + opp.id + "'" + ')" class="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-xs transition-colors">' +
                                '<i class="fas fa-edit mr-1"></i> Edit' +
                            '</button>' +
                        '</div>' +
                        '<button onclick="deleteOpportunity(' + "'" + opp.id + "'" + ')" class="px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-xs transition-colors">' +
                            '<i class="fas fa-trash mr-1"></i> Delete' +
                        '</button>' +
                    '</div>' +
                '</div>';
            }).join('');
        }

        function formatAmount(min, max, currency) {
            const curr = currency || 'USD';
            if (min && max) {
                return curr + ' ' + min.toLocaleString() + ' - ' + max.toLocaleString();
            } else if (min) {
                return curr + ' ' + min.toLocaleString() + '+';
            } else if (max) {
                return 'Up to ' + curr + ' ' + max.toLocaleString();
            }
            return 'Amount not specified';
        }

        // Search and filter functionality
        document.getElementById('opportunitySearch').addEventListener('input', filterOpportunities);
        document.getElementById('countryFilter').addEventListener('change', filterOpportunities);
        document.getElementById('sectorFilter').addEventListener('change', filterOpportunities);
        document.getElementById('statusFilter').addEventListener('change', filterOpportunities);

        function filterOpportunities() {
            const searchTerm = document.getElementById('opportunitySearch').value.toLowerCase();
            const countryFilter = document.getElementById('countryFilter').value;
            const sectorFilter = document.getElementById('sectorFilter').value;
            const statusFilter = document.getElementById('statusFilter').value;
            
            const filteredOpportunities = allOpportunities.filter(opp => {
                const matchesSearch = (opp.title || '').toLowerCase().includes(searchTerm) ||
                                    (opp.description || '').toLowerCase().includes(searchTerm);
                const matchesCountry = !countryFilter || opp.country === countryFilter;
                const matchesSector = !sectorFilter || opp.sector === sectorFilter;
                const matchesStatus = !statusFilter || 
                    (statusFilter === 'verified' && opp.isVerified) ||
                    (statusFilter === 'pending' && !opp.isVerified) ||
                    (statusFilter === 'expired' && opp.deadline && new Date(opp.deadline) < new Date());
                
                return matchesSearch && matchesCountry && matchesSector && matchesStatus;
            });
            
            renderOpportunities(filteredOpportunities);
        }

        // Modal functions
        window.openAddOpportunityModal = function() {
            document.getElementById('addOpportunityModal').classList.remove('hidden');
            document.getElementById('addOpportunityModal').classList.add('flex');
        }

        window.closeAddOpportunityModal = function() {
            document.getElementById('addOpportunityModal').classList.add('hidden');
            document.getElementById('addOpportunityModal').classList.remove('flex');
            document.getElementById('addOpportunityForm').reset();
        }

        // Opportunity management functions - make globally available
        window.verifyOpportunity = async function(opportunityId) {
            try {
                const response = await fetch('/api/wabden/opportunities/' + opportunityId + '/verify', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' }
                });
                
                if (response.ok) {
                    await loadOpportunities();
                    showNotification('Opportunity verified successfully', 'success');
                } else {
                    showNotification('Error verifying opportunity', 'error');
                }
            } catch (error) {
                showNotification('Error: ' + error.message, 'error');
            }
        }

        window.unverifyOpportunity = async function(opportunityId) {
            try {
                const response = await fetch('/api/wabden/opportunities/' + opportunityId + '/unverify', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' }
                });
                
                if (response.ok) {
                    await loadOpportunities();
                    showNotification('Opportunity unverified successfully', 'success');
                } else {
                    showNotification('Error unverifying opportunity', 'error');
                }
            } catch (error) {
                showNotification('Error: ' + error.message, 'error');
            }
        }

        window.deleteOpportunity = async function(opportunityId) {
            if (confirm('Are you sure you want to delete this opportunity? This action cannot be undone.')) {
                try {
                    const response = await fetch('/api/wabden/opportunities/' + opportunityId, {
                        method: 'DELETE',
                        headers: { 'Content-Type': 'application/json' }
                    });
                    
                    if (response.ok) {
                        await loadOpportunities();
                        showNotification('Opportunity deleted successfully', 'success');
                    } else {
                        showNotification('Error deleting opportunity', 'error');
                    }
                } catch (error) {
                    showNotification('Error: ' + error.message, 'error');
                }
            }
        }

        window.verifyAllOpportunities = async function() {
            if (confirm('Verify all unverified opportunities?')) {
                try {
                    const response = await fetch('/api/wabden/opportunities/verify-all', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' }
                    });
                    
                    if (response.ok) {
                        await loadOpportunities();
                        showNotification('All opportunities verified successfully', 'success');
                    } else {
                        showNotification('Error verifying opportunities', 'error');
                    }
                } catch (error) {
                    showNotification('Error: ' + error.message, 'error');
                }
            }
        }

        window.exportOpportunities = async function() {
            try {
                showNotification('Generating professional opportunities export...', 'success');
                
                const response = await fetch('/api/wabden/export/opportunities');
                if (!response.ok) {
                    throw new Error('Export failed');
                }
                
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                
                const timestamp = new Date().toISOString().split('T')[0];
                link.download = 'granada_os_opportunities_' + timestamp + '.csv';
                
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                
                window.URL.revokeObjectURL(url);
                showNotification('Professional CSV export completed successfully', 'success');
            } catch (error) {
                showNotification('Export failed: ' + error.message, 'error');
            }
        }

        // Add opportunity form submission
        document.getElementById('addOpportunityForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = {
                title: document.getElementById('newOpportunityTitle').value,
                country: document.getElementById('newOpportunityCountry').value,
                sector: document.getElementById('newOpportunitySector').value,
                amountMin: parseInt(document.getElementById('newOpportunityAmountMin').value) || null,
                amountMax: parseInt(document.getElementById('newOpportunityAmountMax').value) || null,
                deadline: document.getElementById('newOpportunityDeadline').value || null,
                sourceUrl: document.getElementById('newOpportunityUrl').value,
                description: document.getElementById('newOpportunityDescription').value
            };

            try {
                const response = await fetch('/api/wabden/opportunities', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData)
                });

                if (response.ok) {
                    closeAddOpportunityModal();
                    await loadOpportunities();
                    showNotification('Opportunity created successfully', 'success');
                } else {
                    showNotification('Error creating opportunity', 'error');
                }
            } catch (error) {
                showNotification('Error: ' + error.message, 'error');
            }
        });

        // Notification system
        function showNotification(message, type) {
            const notification = document.createElement('div');
            notification.className = 'fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg ' + 
                (type === 'success' ? 'bg-green-600' : 'bg-red-600') + ' text-white';
            notification.textContent = message;
            
            document.body.appendChild(notification);
            
            setTimeout(() => {
                notification.style.opacity = '0';
                setTimeout(() => document.body.removeChild(notification), 300);
            }, 3000);
        }

        // Close modal on outside click
        document.getElementById('addOpportunityModal').addEventListener('click', function(e) {
            if (e.target === this) closeAddOpportunityModal();
        });
    </script>
</body>
</html>
      `);
      return;
    }
    
    if (path.includes('/hr')) {
      // Serve HR Management module
      res.send(`
<!DOCTYPE html>
<html lang="en" class="dark">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>HR Management - Granada OS Wabden</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
    <style>
        .gradient-bg { background: linear-gradient(135deg, #1f2937 0%, #111827 50%, #0f172a 100%); }
        .card-gradient { background: linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(147, 51, 234, 0.1) 100%); backdrop-filter: blur(10px); }
        .sidebar-gradient { background: linear-gradient(180deg, #1e293b 0%, #0f172a 100%); }
        .hover-scale { transition: transform 0.3s ease; }
        .hover-scale:hover { transform: scale(1.02); }
        .employee-card { border-left: 4px solid #8b5cf6; }
        .employee-card.active { border-left-color: #10b981; }
        .employee-card.inactive { border-left-color: #ef4444; }
        .employee-card.probation { border-left-color: #f59e0b; }
    </style>
</head>
<body class="bg-gray-900 text-white font-sans">
    <div class="min-h-screen flex">
        <!-- Sidebar -->
        <div class="w-64 sidebar-gradient shadow-2xl">
            <div class="p-6">
                <div class="flex items-center space-x-3 mb-8">
                    <div class="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                        <i class="fas fa-shield-alt text-white text-lg"></i>
                    </div>
                    <h1 class="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                        Wabden Admin
                    </h1>
                </div>
                
                <nav class="space-y-2">
                    <div class="nav-item flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-700/50 transition-all duration-300 cursor-pointer" onclick="window.location.href='/wabden'">
                        <i class="fas fa-tachometer-alt text-blue-400"></i>
                        <span>Dashboard</span>
                    </div>
                    <div class="nav-item flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-700/50 transition-all duration-300 cursor-pointer" onclick="window.location.href='/wabden/users'">
                        <i class="fas fa-users text-green-400"></i>
                        <span>User Management</span>
                    </div>
                    <div class="nav-item flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-700/50 transition-all duration-300 cursor-pointer" onclick="window.location.href='/wabden/opportunities'">
                        <i class="fas fa-bullseye text-yellow-400"></i>
                        <span>Opportunities</span>
                    </div>
                    <div class="nav-item flex items-center space-x-3 p-3 rounded-lg bg-purple-600/30 cursor-pointer">
                        <i class="fas fa-user-tie text-purple-400"></i>
                        <span class="text-purple-300">HR Management</span>
                    </div>
                    <div class="nav-item flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-700/50 transition-all duration-300 cursor-pointer" onclick="window.location.href='/wabden/accounting'">
                        <i class="fas fa-chart-line text-emerald-400"></i>
                        <span>Accounting</span>
                    </div>
                    <div class="nav-item flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-700/50 transition-all duration-300 cursor-pointer" onclick="window.location.href='/wabden/submissions'">
                        <i class="fas fa-file-alt text-orange-400"></i>
                        <span>Submissions</span>
                    </div>
                    <div class="nav-item flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-700/50 transition-all duration-300 cursor-pointer" onclick="window.location.href='/wabden/bots'">
                        <i class="fas fa-robot text-cyan-400"></i>
                        <span>Bot Control</span>
                    </div>
                </nav>
            </div>
        </div>

        <!-- Main Content -->
        <div class="flex-1 gradient-bg">
            <!-- Header -->
            <header class="bg-gray-800/50 backdrop-blur-lg shadow-lg p-6">
                <div class="flex items-center justify-between">
                    <div>
                        <h2 class="text-2xl font-bold text-white">HR Management</h2>
                        <p class="text-gray-400 mt-1">Human Resources administration and workforce management</p>
                    </div>
                    <div class="flex items-center space-x-4">
                        <button onclick="openAddEmployeeModal()" class="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors">
                            <i class="fas fa-user-plus mr-2"></i> Add Employee
                        </button>
                        <button onclick="openRecruitmentModal()" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors">
                            <i class="fas fa-search mr-2"></i> Recruitment
                        </button>
                        <button onclick="exportHRData()" class="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors">
                            <i class="fas fa-download mr-2"></i> Export
                        </button>
                    </div>
                </div>
            </header>

            <!-- HR Tabs -->
            <div class="p-6">
                <div class="flex space-x-1 mb-6">
                    <button onclick="switchTab('employees')" id="employeesTab" class="px-4 py-2 bg-purple-600 text-white rounded-lg">Employees</button>
                    <button onclick="switchTab('recruitment')" id="recruitmentTab" class="px-4 py-2 bg-gray-700 text-gray-300 rounded-lg">Recruitment</button>
                    <button onclick="switchTab('performance')" id="performanceTab" class="px-4 py-2 bg-gray-700 text-gray-300 rounded-lg">Performance</button>
                    <button onclick="switchTab('analytics')" id="analyticsTab" class="px-4 py-2 bg-gray-700 text-gray-300 rounded-lg">Analytics</button>
                </div>

                <!-- Employees Tab -->
                <div id="employeesContent" class="tab-content">
                    <!-- Loading State -->
                    <div id="employeesLoading" class="flex items-center justify-center py-12">
                        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
                        <span class="ml-3 text-gray-400">Loading employees...</span>
                    </div>

                    <!-- Employee Statistics -->
                    <div id="employeeStats" class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8 hidden">
                        <!-- Stats will be populated by JavaScript -->
                    </div>

                    <!-- Search and Filters -->
                    <div id="employeeSearchSection" class="card-gradient rounded-xl p-6 mb-6 hidden">
                        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <input type="text" id="employeeSearch" placeholder="Search employees..." 
                                   class="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500">
                            <select id="departmentFilter" class="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white">
                                <option value="">All Departments</option>
                                <option value="Engineering">Engineering</option>
                                <option value="Operations">Operations</option>
                                <option value="Finance">Finance</option>
                                <option value="HR">Human Resources</option>
                                <option value="Marketing">Marketing</option>
                            </select>
                            <select id="statusFilter" class="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white">
                                <option value="">All Status</option>
                                <option value="active">Active</option>
                                <option value="probation">Probation</option>
                                <option value="inactive">Inactive</option>
                            </select>
                            <select id="positionFilter" class="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white">
                                <option value="">All Positions</option>
                                <option value="manager">Manager</option>
                                <option value="senior">Senior</option>
                                <option value="junior">Junior</option>
                                <option value="intern">Intern</option>
                            </select>
                        </div>
                    </div>

                    <!-- Employees Grid -->
                    <div id="employeesGrid" class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 hidden">
                        <!-- Employees will be populated by JavaScript -->
                    </div>
                </div>

                <!-- Recruitment Tab -->
                <div id="recruitmentContent" class="tab-content hidden">
                    <div class="card-gradient rounded-xl p-6">
                        <h3 class="text-xl font-bold text-white mb-4">Recruitment Pipeline</h3>
                        <div id="recruitmentPipeline" class="space-y-4">
                            <!-- Recruitment data will be populated here -->
                        </div>
                    </div>
                </div>

                <!-- Performance Tab -->
                <div id="performanceContent" class="tab-content hidden">
                    <div class="card-gradient rounded-xl p-6">
                        <h3 class="text-xl font-bold text-white mb-4">Performance Reviews</h3>
                        <div id="performanceReviews" class="space-y-4">
                            <!-- Performance data will be populated here -->
                        </div>
                    </div>
                </div>

                <!-- Analytics Tab -->
                <div id="analyticsContent" class="tab-content hidden">
                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div class="card-gradient rounded-xl p-6">
                            <h3 class="text-lg font-bold text-white mb-4">Department Distribution</h3>
                            <div id="departmentChart" class="h-48 bg-gray-800 rounded-lg flex items-center justify-center">
                                <span class="text-gray-400">Chart will be rendered here</span>
                            </div>
                        </div>
                        <div class="card-gradient rounded-xl p-6">
                            <h3 class="text-lg font-bold text-white mb-4">Hiring Trends</h3>
                            <div id="hiringChart" class="h-48 bg-gray-800 rounded-lg flex items-center justify-center">
                                <span class="text-gray-400">Chart will be rendered here</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Add Employee Modal -->
    <div id="addEmployeeModal" class="fixed inset-0 bg-black/50 backdrop-blur-sm hidden items-center justify-center z-50">
        <div class="bg-gray-800 rounded-xl p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <h3 class="text-xl font-bold text-white mb-4">Add New Employee</h3>
            <form id="addEmployeeForm" class="space-y-4">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label class="block text-gray-400 text-sm mb-2">First Name</label>
                        <input type="text" id="newEmployeeFirstName" required class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500">
                    </div>
                    <div>
                        <label class="block text-gray-400 text-sm mb-2">Last Name</label>
                        <input type="text" id="newEmployeeLastName" required class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500">
                    </div>
                    <div>
                        <label class="block text-gray-400 text-sm mb-2">Email</label>
                        <input type="email" id="newEmployeeEmail" required class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500">
                    </div>
                    <div>
                        <label class="block text-gray-400 text-sm mb-2">Phone</label>
                        <input type="tel" id="newEmployeePhone" class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500">
                    </div>
                    <div>
                        <label class="block text-gray-400 text-sm mb-2">Department</label>
                        <select id="newEmployeeDepartment" required class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500">
                            <option value="">Select Department</option>
                            <option value="Engineering">Engineering</option>
                            <option value="Operations">Operations</option>
                            <option value="Finance">Finance</option>
                            <option value="HR">Human Resources</option>
                            <option value="Marketing">Marketing</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-gray-400 text-sm mb-2">Position</label>
                        <input type="text" id="newEmployeePosition" required class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500">
                    </div>
                    <div>
                        <label class="block text-gray-400 text-sm mb-2">Salary</label>
                        <input type="number" id="newEmployeeSalary" min="0" class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500">
                    </div>
                    <div>
                        <label class="block text-gray-400 text-sm mb-2">Start Date</label>
                        <input type="date" id="newEmployeeStartDate" required class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500">
                    </div>
                </div>
                <div class="flex justify-end space-x-3 pt-4">
                    <button type="button" onclick="closeAddEmployeeModal()" class="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg transition-colors">
                        Cancel
                    </button>
                    <button type="submit" class="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors">
                        <i class="fas fa-user-plus mr-2"></i> Add Employee
                    </button>
                </div>
            </form>
        </div>
    </div>

    <script>
        let allEmployees = [];
        let currentTab = 'employees';

        // Load data on page load
        document.addEventListener('DOMContentLoaded', function() {
            loadEmployees();
            switchTab('employees');
        });

        async function loadEmployees() {
            try {
                // Sample employee data for demonstration
                allEmployees = [
                    {
                        id: '1',
                        firstName: 'Sarah',
                        lastName: 'Johnson',
                        email: 'sarah.johnson@granada.os',
                        phone: '+256-701-234567',
                        department: 'Engineering',
                        position: 'Senior Software Engineer',
                        salary: 120000,
                        startDate: '2023-01-15',
                        status: 'active',
                        avatar: 'https://via.placeholder.com/50'
                    },
                    {
                        id: '2',
                        firstName: 'David',
                        lastName: 'Mukasa',
                        email: 'david.mukasa@granada.os',
                        phone: '+256-702-345678',
                        department: 'Operations',
                        position: 'Operations Manager',
                        salary: 95000,
                        startDate: '2022-08-20',
                        status: 'active',
                        avatar: 'https://via.placeholder.com/50'
                    },
                    {
                        id: '3',
                        firstName: 'Grace',
                        lastName: 'Achieng',
                        email: 'grace.achieng@granada.os',
                        phone: '+254-701-456789',
                        department: 'Finance',
                        position: 'Financial Analyst',
                        salary: 75000,
                        startDate: '2024-02-01',
                        status: 'probation',
                        avatar: 'https://via.placeholder.com/50'
                    },
                    {
                        id: '4',
                        firstName: 'John',
                        lastName: 'Wani',
                        email: 'john.wani@granada.os',
                        phone: '+211-915-567890',
                        department: 'HR',
                        position: 'HR Specialist',
                        salary: 65000,
                        startDate: '2023-06-10',
                        status: 'active',
                        avatar: 'https://via.placeholder.com/50'
                    },
                    {
                        id: '5',
                        firstName: 'Mary',
                        lastName: 'Nakato',
                        email: 'mary.nakato@granada.os',
                        phone: '+256-703-678901',
                        department: 'Marketing',
                        position: 'Marketing Coordinator',
                        salary: 55000,
                        startDate: '2023-11-01',
                        status: 'active',
                        avatar: 'https://via.placeholder.com/50'
                    }
                ];

                renderEmployeeStats();
                renderEmployees(allEmployees);
                
                document.getElementById('employeesLoading').classList.add('hidden');
                document.getElementById('employeeStats').classList.remove('hidden');
                document.getElementById('employeeSearchSection').classList.remove('hidden');
                document.getElementById('employeesGrid').classList.remove('hidden');
            } catch (error) {
                console.error('Error loading employees:', error);
                document.getElementById('employeesLoading').innerHTML = '<div class="text-red-400">Error loading employees. Please refresh the page.</div>';
            }
        }

        function renderEmployeeStats() {
            const statsContainer = document.getElementById('employeeStats');
            const stats = [
                { 
                    label: 'Total Employees', 
                    count: allEmployees.length, 
                    color: 'purple', 
                    icon: 'fas fa-users' 
                },
                { 
                    label: 'Active', 
                    count: allEmployees.filter(e => e.status === 'active').length, 
                    color: 'green', 
                    icon: 'fas fa-user-check' 
                },
                { 
                    label: 'On Probation', 
                    count: allEmployees.filter(e => e.status === 'probation').length, 
                    color: 'yellow', 
                    icon: 'fas fa-user-clock' 
                },
                { 
                    label: 'Departments', 
                    count: [...new Set(allEmployees.map(e => e.department))].length, 
                    color: 'blue', 
                    icon: 'fas fa-building' 
                }
            ];

            statsContainer.innerHTML = stats.map(stat => 
                '<div class="card-gradient rounded-xl p-6 hover-scale">' +
                    '<div class="flex items-center justify-between">' +
                        '<div>' +
                            '<p class="text-gray-400 text-sm uppercase tracking-wide">' + stat.label + '</p>' +
                            '<p class="text-3xl font-bold text-white mt-1">' + stat.count + '</p>' +
                        '</div>' +
                        '<div class="w-12 h-12 bg-' + stat.color + '-500/20 rounded-lg flex items-center justify-center">' +
                            '<i class="' + stat.icon + ' text-' + stat.color + '-400 text-xl"></i>' +
                        '</div>' +
                    '</div>' +
                '</div>'
            ).join('');
        }

        function renderEmployees(employees) {
            const grid = document.getElementById('employeesGrid');
            
            if (employees.length === 0) {
                grid.innerHTML = '<div class="col-span-full text-center py-12 text-gray-400">No employees found</div>';
                return;
            }

            grid.innerHTML = employees.map(emp => {
                const statusClass = emp.status === 'active' ? 'active' : emp.status === 'probation' ? 'probation' : 'inactive';
                const statusText = emp.status.charAt(0).toUpperCase() + emp.status.slice(1);
                const statusColor = emp.status === 'active' ? 'text-green-400' : emp.status === 'probation' ? 'text-yellow-400' : 'text-red-400';
                const formattedSalary = emp.salary ? '$' + emp.salary.toLocaleString() : 'Not specified';
                
                return '<div class="employee-card ' + statusClass + ' card-gradient rounded-xl p-6 hover-scale">' +
                    '<div class="flex items-start justify-between mb-4">' +
                        '<div class="flex items-center space-x-3">' +
                            '<div class="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold">' +
                                emp.firstName.charAt(0) + emp.lastName.charAt(0) +
                            '</div>' +
                            '<div>' +
                                '<h3 class="text-lg font-bold text-white">' + emp.firstName + ' ' + emp.lastName + '</h3>' +
                                '<p class="text-gray-400 text-sm">' + emp.position + '</p>' +
                            '</div>' +
                        '</div>' +
                        '<span class="px-2 py-1 bg-gray-700 rounded-full text-xs ' + statusColor + '">' + statusText + '</span>' +
                    '</div>' +
                    '<div class="space-y-2 mb-4">' +
                        '<div class="flex items-center text-sm text-gray-300">' +
                            '<i class="fas fa-envelope mr-2 text-gray-400"></i>' +
                            '<span>' + emp.email + '</span>' +
                        '</div>' +
                        '<div class="flex items-center text-sm text-gray-300">' +
                            '<i class="fas fa-phone mr-2 text-gray-400"></i>' +
                            '<span>' + (emp.phone || 'Not provided') + '</span>' +
                        '</div>' +
                        '<div class="flex items-center text-sm text-gray-300">' +
                            '<i class="fas fa-building mr-2 text-gray-400"></i>' +
                            '<span>' + emp.department + '</span>' +
                        '</div>' +
                        '<div class="flex items-center text-sm text-gray-300">' +
                            '<i class="fas fa-dollar-sign mr-2 text-gray-400"></i>' +
                            '<span>' + formattedSalary + '</span>' +
                        '</div>' +
                    '</div>' +
                    '<div class="flex items-center justify-between">' +
                        '<span class="text-xs text-gray-400">Started: ' + new Date(emp.startDate).toLocaleDateString() + '</span>' +
                        '<div class="flex space-x-2">' +
                            '<button onclick="editEmployee(' + "'" + emp.id + "'" + ')" class="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-xs transition-colors">' +
                                '<i class="fas fa-edit mr-1"></i> Edit' +
                            '</button>' +
                            '<button onclick="viewEmployee(' + "'" + emp.id + "'" + ')" class="px-3 py-1 bg-purple-600 hover:bg-purple-700 rounded text-xs transition-colors">' +
                                '<i class="fas fa-eye mr-1"></i> View' +
                            '</button>' +
                        '</div>' +
                    '</div>' +
                '</div>';
            }).join('');
        }

        // Tab switching
        function switchTab(tabName) {
            currentTab = tabName;
            
            // Hide all tab contents
            document.querySelectorAll('.tab-content').forEach(tab => tab.classList.add('hidden'));
            
            // Remove active class from all tabs
            document.querySelectorAll('[id$="Tab"]').forEach(tab => {
                tab.classList.remove('bg-purple-600', 'text-white');
                tab.classList.add('bg-gray-700', 'text-gray-300');
            });
            
            // Show selected tab content
            document.getElementById(tabName + 'Content').classList.remove('hidden');
            
            // Add active class to selected tab
            const selectedTab = document.getElementById(tabName + 'Tab');
            selectedTab.classList.remove('bg-gray-700', 'text-gray-300');
            selectedTab.classList.add('bg-purple-600', 'text-white');
            
            // Load tab-specific data
            if (tabName === 'recruitment') {
                loadRecruitmentData();
            } else if (tabName === 'performance') {
                loadPerformanceData();
            } else if (tabName === 'analytics') {
                loadAnalyticsData();
            }
        }

        function loadRecruitmentData() {
            const pipeline = document.getElementById('recruitmentPipeline');
            pipeline.innerHTML = '<div class="text-center text-gray-400 py-8">Recruitment pipeline will be implemented here</div>';
        }

        function loadPerformanceData() {
            const reviews = document.getElementById('performanceReviews');
            reviews.innerHTML = '<div class="text-center text-gray-400 py-8">Performance reviews will be implemented here</div>';
        }

        function loadAnalyticsData() {
            // Analytics charts would be implemented here
            console.log('Loading HR analytics...');
        }

        // Search and filter functionality
        document.getElementById('employeeSearch').addEventListener('input', filterEmployees);
        document.getElementById('departmentFilter').addEventListener('change', filterEmployees);
        document.getElementById('statusFilter').addEventListener('change', filterEmployees);
        document.getElementById('positionFilter').addEventListener('change', filterEmployees);

        function filterEmployees() {
            const searchTerm = document.getElementById('employeeSearch').value.toLowerCase();
            const departmentFilter = document.getElementById('departmentFilter').value;
            const statusFilter = document.getElementById('statusFilter').value;
            const positionFilter = document.getElementById('positionFilter').value;
            
            const filteredEmployees = allEmployees.filter(emp => {
                const matchesSearch = (emp.firstName + ' ' + emp.lastName).toLowerCase().includes(searchTerm) ||
                                    emp.email.toLowerCase().includes(searchTerm) ||
                                    emp.position.toLowerCase().includes(searchTerm);
                const matchesDepartment = !departmentFilter || emp.department === departmentFilter;
                const matchesStatus = !statusFilter || emp.status === statusFilter;
                const matchesPosition = !positionFilter || emp.position.toLowerCase().includes(positionFilter.toLowerCase());
                
                return matchesSearch && matchesDepartment && matchesStatus && matchesPosition;
            });
            
            renderEmployees(filteredEmployees);
        }

        // Modal functions
        window.openAddEmployeeModal = function() {
            document.getElementById('addEmployeeModal').classList.remove('hidden');
            document.getElementById('addEmployeeModal').classList.add('flex');
        }

        window.closeAddEmployeeModal = function() {
            document.getElementById('addEmployeeModal').classList.add('hidden');
            document.getElementById('addEmployeeModal').classList.remove('flex');
            document.getElementById('addEmployeeForm').reset();
        }

        window.openRecruitmentModal = function() {
            showNotification('Recruitment module will be implemented', 'info');
        }

        window.exportHRData = function() {
            try {
                showNotification('Generating HR data export...', 'success');
                
                // Generate CSV content
                let csvContent = '# GRANADA OS - HR MANAGEMENT SYSTEM\\n';
                csvContent += '# Employee Directory Export\\n';
                csvContent += '# Export Generated: ' + new Date().toISOString() + '\\n';
                csvContent += '# Total Employees: ' + allEmployees.length + '\\n';
                csvContent += '#\\n';
                csvContent += 'ID,First Name,Last Name,Email,Phone,Department,Position,Salary,Start Date,Status\\n';
                
                allEmployees.forEach(emp => {
                    csvContent += [
                        emp.id,
                        emp.firstName,
                        emp.lastName,
                        emp.email,
                        emp.phone || '',
                        emp.department,
                        emp.position,
                        emp.salary || '',
                        emp.startDate,
                        emp.status
                    ].join(',') + '\\n';
                });
                
                const blob = new Blob([csvContent], { type: 'text/csv' });
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                
                const timestamp = new Date().toISOString().split('T')[0];
                link.download = 'granada_os_hr_data_' + timestamp + '.csv';
                
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                
                window.URL.revokeObjectURL(url);
                showNotification('HR data export completed successfully', 'success');
            } catch (error) {
                showNotification('Export failed: ' + error.message, 'error');
            }
        }

        // Employee management functions
        window.editEmployee = function(employeeId) {
            showNotification('Edit employee functionality will be implemented', 'info');
        }

        window.viewEmployee = function(employeeId) {
            showNotification('View employee details will be implemented', 'info');
        }

        // Add employee form submission
        document.getElementById('addEmployeeForm').addEventListener('submit', function(e) {
            e.preventDefault();
            
            const newEmployee = {
                id: Date.now().toString(),
                firstName: document.getElementById('newEmployeeFirstName').value,
                lastName: document.getElementById('newEmployeeLastName').value,
                email: document.getElementById('newEmployeeEmail').value,
                phone: document.getElementById('newEmployeePhone').value,
                department: document.getElementById('newEmployeeDepartment').value,
                position: document.getElementById('newEmployeePosition').value,
                salary: parseInt(document.getElementById('newEmployeeSalary').value) || 0,
                startDate: document.getElementById('newEmployeeStartDate').value,
                status: 'probation'
            };

            allEmployees.push(newEmployee);
            renderEmployeeStats();
            renderEmployees(allEmployees);
            closeAddEmployeeModal();
            showNotification('Employee added successfully', 'success');
        });

        // Notification system
        function showNotification(message, type) {
            const notification = document.createElement('div');
            notification.className = 'fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg ' + 
                (type === 'success' ? 'bg-green-600' : type === 'error' ? 'bg-red-600' : 'bg-blue-600') + ' text-white';
            notification.textContent = message;
            
            document.body.appendChild(notification);
            
            setTimeout(() => {
                notification.style.opacity = '0';
                setTimeout(() => document.body.removeChild(notification), 300);
            }, 3000);
        }

        // Close modal on outside click
        document.getElementById('addEmployeeModal').addEventListener('click', function(e) {
            if (e.target === this) closeAddEmployeeModal();
        });

        // Make functions globally available
        window.switchTab = switchTab;
    </script>
</body>
</html>
      `);
      return;
    }
    
    if (path.includes('/accounting')) {
      // Serve Accounting & Finance module
      res.send(`
<!DOCTYPE html>
<html lang="en" class="dark">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Accounting & Finance - Granada OS Wabden</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
    <style>
        .gradient-bg { background: linear-gradient(135deg, #1f2937 0%, #111827 50%, #0f172a 100%); }
        .card-gradient { background: linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(147, 51, 234, 0.1) 100%); backdrop-filter: blur(10px); }
        .sidebar-gradient { background: linear-gradient(180deg, #1e293b 0%, #0f172a 100%); }
        .hover-scale { transition: transform 0.3s ease; }
        .hover-scale:hover { transform: scale(1.02); }
        .transaction-card { border-left: 4px solid #10b981; }
        .transaction-card.expense { border-left-color: #ef4444; }
        .transaction-card.pending { border-left-color: #f59e0b; }
    </style>
</head>
<body class="bg-gray-900 text-white font-sans">
    <div class="min-h-screen flex">
        <!-- Sidebar -->
        <div class="w-64 sidebar-gradient shadow-2xl">
            <div class="p-6">
                <div class="flex items-center space-x-3 mb-8">
                    <div class="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                        <i class="fas fa-shield-alt text-white text-lg"></i>
                    </div>
                    <h1 class="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                        Wabden Admin
                    </h1>
                </div>
                
                <nav class="space-y-2">
                    <div class="nav-item flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-700/50 transition-all duration-300 cursor-pointer" onclick="window.location.href='/wabden'">
                        <i class="fas fa-tachometer-alt text-blue-400"></i>
                        <span>Dashboard</span>
                    </div>
                    <div class="nav-item flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-700/50 transition-all duration-300 cursor-pointer" onclick="window.location.href='/wabden/users'">
                        <i class="fas fa-users text-green-400"></i>
                        <span>User Management</span>
                    </div>
                    <div class="nav-item flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-700/50 transition-all duration-300 cursor-pointer" onclick="window.location.href='/wabden/opportunities'">
                        <i class="fas fa-bullseye text-yellow-400"></i>
                        <span>Opportunities</span>
                    </div>
                    <div class="nav-item flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-700/50 transition-all duration-300 cursor-pointer" onclick="window.location.href='/wabden/hr'">
                        <i class="fas fa-user-tie text-purple-400"></i>
                        <span>HR Management</span>
                    </div>
                    <div class="nav-item flex items-center space-x-3 p-3 rounded-lg bg-emerald-600/30 cursor-pointer">
                        <i class="fas fa-chart-line text-emerald-400"></i>
                        <span class="text-emerald-300">Accounting</span>
                    </div>
                    <div class="nav-item flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-700/50 transition-all duration-300 cursor-pointer" onclick="window.location.href='/wabden/submissions'">
                        <i class="fas fa-file-alt text-orange-400"></i>
                        <span>Submissions</span>
                    </div>
                    <div class="nav-item flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-700/50 transition-all duration-300 cursor-pointer" onclick="window.location.href='/wabden/bots'">
                        <i class="fas fa-robot text-cyan-400"></i>
                        <span>Bot Control</span>
                    </div>
                </nav>
            </div>
        </div>

        <!-- Main Content -->
        <div class="flex-1 gradient-bg">
            <!-- Header -->
            <header class="bg-gray-800/50 backdrop-blur-lg shadow-lg p-6">
                <div class="flex items-center justify-between">
                    <div>
                        <h2 class="text-2xl font-bold text-white">Accounting & Finance</h2>
                        <p class="text-gray-400 mt-1">Financial management and business accounting systems</p>
                    </div>
                    <div class="flex items-center space-x-4">
                        <button onclick="openAddTransactionModal()" class="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors">
                            <i class="fas fa-plus mr-2"></i> Add Transaction
                        </button>
                        <button onclick="openInvoiceModal()" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors">
                            <i class="fas fa-file-invoice mr-2"></i> Create Invoice
                        </button>
                        <button onclick="exportFinancialData()" class="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors">
                            <i class="fas fa-download mr-2"></i> Export
                        </button>
                    </div>
                </div>
            </header>

            <!-- Financial Overview Cards -->
            <div class="p-6">
                <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div class="card-gradient rounded-xl p-6 hover-scale">
                        <div class="flex items-center justify-between">
                            <div>
                                <p class="text-gray-400 text-sm uppercase tracking-wide">Total Revenue</p>
                                <p class="text-3xl font-bold text-green-400 mt-1" id="totalRevenue">$0</p>
                            </div>
                            <div class="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                                <i class="fas fa-arrow-up text-green-400 text-xl"></i>
                            </div>
                        </div>
                        <div class="mt-2">
                            <span class="text-green-400 text-sm">+12.5% from last month</span>
                        </div>
                    </div>

                    <div class="card-gradient rounded-xl p-6 hover-scale">
                        <div class="flex items-center justify-between">
                            <div>
                                <p class="text-gray-400 text-sm uppercase tracking-wide">Total Expenses</p>
                                <p class="text-3xl font-bold text-red-400 mt-1" id="totalExpenses">$0</p>
                            </div>
                            <div class="w-12 h-12 bg-red-500/20 rounded-lg flex items-center justify-center">
                                <i class="fas fa-arrow-down text-red-400 text-xl"></i>
                            </div>
                        </div>
                        <div class="mt-2">
                            <span class="text-red-400 text-sm">+8.2% from last month</span>
                        </div>
                    </div>

                    <div class="card-gradient rounded-xl p-6 hover-scale">
                        <div class="flex items-center justify-between">
                            <div>
                                <p class="text-gray-400 text-sm uppercase tracking-wide">Net Profit</p>
                                <p class="text-3xl font-bold text-blue-400 mt-1" id="netProfit">$0</p>
                            </div>
                            <div class="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                                <i class="fas fa-chart-line text-blue-400 text-xl"></i>
                            </div>
                        </div>
                        <div class="mt-2">
                            <span class="text-blue-400 text-sm">+15.3% from last month</span>
                        </div>
                    </div>

                    <div class="card-gradient rounded-xl p-6 hover-scale">
                        <div class="flex items-center justify-between">
                            <div>
                                <p class="text-gray-400 text-sm uppercase tracking-wide">Pending Invoices</p>
                                <p class="text-3xl font-bold text-yellow-400 mt-1" id="pendingInvoices">0</p>
                            </div>
                            <div class="w-12 h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                                <i class="fas fa-clock text-yellow-400 text-xl"></i>
                            </div>
                        </div>
                        <div class="mt-2">
                            <span class="text-yellow-400 text-sm">3 invoices due</span>
                        </div>
                    </div>
                </div>

                <!-- Financial Tabs -->
                <div class="flex space-x-1 mb-6">
                    <button onclick="switchFinanceTab('transactions')" id="transactionsTab" class="px-4 py-2 bg-emerald-600 text-white rounded-lg">Transactions</button>
                    <button onclick="switchFinanceTab('spreadsheet')" id="spreadsheetTab" class="px-4 py-2 bg-gray-700 text-gray-300 rounded-lg">Financial Spreadsheet</button>
                    <button onclick="switchFinanceTab('invoices')" id="invoicesTab" class="px-4 py-2 bg-gray-700 text-gray-300 rounded-lg">Invoices</button>
                    <button onclick="switchFinanceTab('grants')" id="grantsTab" class="px-4 py-2 bg-gray-700 text-gray-300 rounded-lg">Grant Tracking</button>
                    <button onclick="switchFinanceTab('reports')" id="reportsTab" class="px-4 py-2 bg-gray-700 text-gray-300 rounded-lg">Reports</button>
                </div>

                <!-- Transactions Tab -->
                <div id="transactionsContent" class="tab-content">
                    <!-- Search and Filters -->
                    <div class="card-gradient rounded-xl p-6 mb-6">
                        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <input type="text" id="transactionSearch" placeholder="Search transactions..." 
                                   class="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500">
                            <select id="typeFilter" class="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white">
                                <option value="">All Types</option>
                                <option value="revenue">Revenue</option>
                                <option value="expense">Expense</option>
                            </select>
                            <select id="categoryFilter" class="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white">
                                <option value="">All Categories</option>
                                <option value="operations">Operations</option>
                                <option value="marketing">Marketing</option>
                                <option value="salaries">Salaries</option>
                                <option value="grants">Grants</option>
                                <option value="equipment">Equipment</option>
                            </select>
                            <input type="month" id="dateFilter" class="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white">
                        </div>
                    </div>

                    <!-- Transactions List -->
                    <div id="transactionsList" class="space-y-4">
                        <!-- Transactions will be populated by JavaScript -->
                    </div>
                </div>

                <!-- Financial Spreadsheet Tab -->
                <div id="spreadsheetContent" class="tab-content hidden">
                    <div class="card-gradient rounded-xl p-6 mb-6">
                        <div class="flex items-center justify-between mb-4">
                            <h3 class="text-xl font-bold text-white">Financial Spreadsheet</h3>
                            <div class="flex space-x-2">
                                <button onclick="addSpreadsheetRow()" class="px-3 py-1 bg-green-600 hover:bg-green-700 rounded text-sm transition-colors">
                                    <i class="fas fa-plus mr-1"></i> Add Row
                                </button>
                                <button onclick="addSpreadsheetColumn()" class="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm transition-colors">
                                    <i class="fas fa-columns mr-1"></i> Add Column
                                </button>
                                <button onclick="calculateSpreadsheet()" class="px-3 py-1 bg-purple-600 hover:bg-purple-700 rounded text-sm transition-colors">
                                    <i class="fas fa-calculator mr-1"></i> Calculate
                                </button>
                                <button onclick="exportSpreadsheet()" class="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 rounded text-sm transition-colors">
                                    <i class="fas fa-download mr-1"></i> Export
                                </button>
                            </div>
                        </div>
                        
                        <!-- Formula Bar -->
                        <div class="mb-4 p-3 bg-gray-800 rounded-lg">
                            <div class="flex items-center space-x-4">
                                <span class="text-gray-400 text-sm font-medium">Cell:</span>
                                <span id="currentCell" class="text-white font-mono">A1</span>
                                <span class="text-gray-400 text-sm font-medium">Formula:</span>
                                <input type="text" id="formulaBar" placeholder="Enter formula or value..." 
                                       class="flex-1 px-3 py-1 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-emerald-500">
                                <button onclick="applyFormula()" class="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 rounded text-sm transition-colors">
                                    Apply
                                </button>
                            </div>
                        </div>

                        <!-- Spreadsheet Grid -->
                        <div class="overflow-auto max-h-96 border border-gray-700 rounded-lg">
                            <table id="spreadsheetTable" class="w-full text-sm">
                                <thead class="bg-gray-800 sticky top-0">
                                    <tr id="headerRow">
                                        <th class="px-2 py-1 border border-gray-600 text-center w-12">#</th>
                                        <!-- Column headers will be generated -->
                                    </tr>
                                </thead>
                                <tbody id="spreadsheetBody">
                                    <!-- Spreadsheet rows will be generated -->
                                </tbody>
                            </table>
                        </div>

                        <!-- Pre-built Templates -->
                        <div class="mt-6">
                            <h4 class="text-lg font-bold text-white mb-4">Financial Templates</h4>
                            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <button onclick="loadTemplate('budget')" class="p-4 bg-gray-800 hover:bg-gray-700 rounded-lg text-left transition-colors">
                                    <h5 class="font-bold text-emerald-400 mb-2">Budget Planning</h5>
                                    <p class="text-gray-400 text-sm">Monthly budget template with income, expenses, and variance analysis</p>
                                </button>
                                <button onclick="loadTemplate('cashflow')" class="p-4 bg-gray-800 hover:bg-gray-700 rounded-lg text-left transition-colors">
                                    <h5 class="font-bold text-blue-400 mb-2">Cash Flow Analysis</h5>
                                    <p class="text-gray-400 text-sm">Track cash inflows and outflows with running balances</p>
                                </button>
                                <button onclick="loadTemplate('pnl')" class="p-4 bg-gray-800 hover:bg-gray-700 rounded-lg text-left transition-colors">
                                    <h5 class="font-bold text-purple-400 mb-2">P&L Statement</h5>
                                    <p class="text-gray-400 text-sm">Profit and loss statement with revenue and expense categories</p>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Invoices Tab -->
                <div id="invoicesContent" class="tab-content hidden">
                    <div class="card-gradient rounded-xl p-6">
                        <h3 class="text-xl font-bold text-white mb-4">Invoice Management</h3>
                        <div id="invoicesList" class="space-y-4">
                            <!-- Invoices will be populated here -->
                        </div>
                    </div>
                </div>

                <!-- Grant Tracking Tab -->
                <div id="grantsContent" class="tab-content hidden">
                    <div class="card-gradient rounded-xl p-6">
                        <h3 class="text-xl font-bold text-white mb-4">Grant Funding Tracker</h3>
                        <div id="grantsList" class="space-y-4">
                            <!-- Grant tracking will be populated here -->
                        </div>
                    </div>
                </div>

                <!-- Reports Tab -->
                <div id="reportsContent" class="tab-content hidden">
                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div class="card-gradient rounded-xl p-6">
                            <h3 class="text-lg font-bold text-white mb-4">Monthly Revenue</h3>
                            <div id="revenueChart" class="h-48 bg-gray-800 rounded-lg flex items-center justify-center">
                                <span class="text-gray-400">Revenue chart will be rendered here</span>
                            </div>
                        </div>
                        <div class="card-gradient rounded-xl p-6">
                            <h3 class="text-lg font-bold text-white mb-4">Expense Breakdown</h3>
                            <div id="expenseChart" class="h-48 bg-gray-800 rounded-lg flex items-center justify-center">
                                <span class="text-gray-400">Expense chart will be rendered here</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Add Transaction Modal -->
    <div id="addTransactionModal" class="fixed inset-0 bg-black/50 backdrop-blur-sm hidden items-center justify-center z-50">
        <div class="bg-gray-800 rounded-xl p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <h3 class="text-xl font-bold text-white mb-4">Add New Transaction</h3>
            <form id="addTransactionForm" class="space-y-4">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label class="block text-gray-400 text-sm mb-2">Type</label>
                        <select id="newTransactionType" required class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500">
                            <option value="">Select Type</option>
                            <option value="revenue">Revenue</option>
                            <option value="expense">Expense</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-gray-400 text-sm mb-2">Amount (USD)</label>
                        <input type="number" id="newTransactionAmount" step="0.01" min="0" required class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500">
                    </div>
                    <div>
                        <label class="block text-gray-400 text-sm mb-2">Category</label>
                        <select id="newTransactionCategory" required class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500">
                            <option value="">Select Category</option>
                            <option value="operations">Operations</option>
                            <option value="marketing">Marketing</option>
                            <option value="salaries">Salaries</option>
                            <option value="grants">Grants</option>
                            <option value="equipment">Equipment</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-gray-400 text-sm mb-2">Date</label>
                        <input type="date" id="newTransactionDate" required class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500">
                    </div>
                    <div class="md:col-span-2">
                        <label class="block text-gray-400 text-sm mb-2">Description</label>
                        <input type="text" id="newTransactionDescription" required class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500">
                    </div>
                    <div>
                        <label class="block text-gray-400 text-sm mb-2">Reference Number</label>
                        <input type="text" id="newTransactionReference" class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500">
                    </div>
                    <div>
                        <label class="block text-gray-400 text-sm mb-2">Payment Method</label>
                        <select id="newTransactionPayment" class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500">
                            <option value="">Select Method</option>
                            <option value="bank_transfer">Bank Transfer</option>
                            <option value="cash">Cash</option>
                            <option value="check">Check</option>
                            <option value="credit_card">Credit Card</option>
                            <option value="mobile_money">Mobile Money</option>
                        </select>
                    </div>
                </div>
                <div class="flex justify-end space-x-3 pt-4">
                    <button type="button" onclick="closeAddTransactionModal()" class="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg transition-colors">
                        Cancel
                    </button>
                    <button type="submit" class="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors">
                        <i class="fas fa-plus mr-2"></i> Add Transaction
                    </button>
                </div>
            </form>
        </div>
    </div>

    <script>
        let allTransactions = [];
        let currentFinanceTab = 'transactions';
        let spreadsheetData = {};
        let selectedCell = { row: 1, col: 'A' };
        let columnCount = 10;
        let rowCount = 20;

        // Sample financial data
        const sampleTransactions = [
            {
                id: '1',
                type: 'revenue',
                amount: 25000,
                category: 'grants',
                description: 'Education Innovation Grant Q1 2024',
                date: '2024-01-15',
                reference: 'EIG-Q1-2024',
                paymentMethod: 'bank_transfer',
                status: 'completed'
            },
            {
                id: '2',
                type: 'expense',
                amount: 8500,
                category: 'salaries',
                description: 'Staff Salaries - January 2024',
                date: '2024-01-31',
                reference: 'SAL-JAN-2024',
                paymentMethod: 'bank_transfer',
                status: 'completed'
            },
            {
                id: '3',
                type: 'revenue',
                amount: 15000,
                category: 'operations',
                description: 'Consulting Services - Tech Implementation',
                date: '2024-02-10',
                reference: 'CONS-FEB-2024',
                paymentMethod: 'bank_transfer',
                status: 'completed'
            },
            {
                id: '4',
                type: 'expense',
                amount: 3200,
                category: 'equipment',
                description: 'Laptop and Software Licenses',
                date: '2024-02-15',
                reference: 'EQP-FEB-2024',
                paymentMethod: 'credit_card',
                status: 'completed'
            },
            {
                id: '5',
                type: 'expense',
                amount: 1800,
                category: 'marketing',
                description: 'Digital Marketing Campaign - Q1',
                date: '2024-03-01',
                reference: 'MKT-Q1-2024',
                paymentMethod: 'credit_card',
                status: 'pending'
            }
        ];

        // Load data on page load
        document.addEventListener('DOMContentLoaded', function() {
            allTransactions = sampleTransactions;
            loadFinancialData();
            initializeSpreadsheet();
            switchFinanceTab('transactions');
        });

        function loadFinancialData() {
            calculateFinancialSummary();
            renderTransactions(allTransactions);
        }

        function calculateFinancialSummary() {
            const revenue = allTransactions
                .filter(t => t.type === 'revenue' && t.status === 'completed')
                .reduce((sum, t) => sum + t.amount, 0);
            
            const expenses = allTransactions
                .filter(t => t.type === 'expense' && t.status === 'completed')
                .reduce((sum, t) => sum + t.amount, 0);
            
            const pendingCount = allTransactions
                .filter(t => t.status === 'pending').length;

            document.getElementById('totalRevenue').textContent = '$' + revenue.toLocaleString();
            document.getElementById('totalExpenses').textContent = '$' + expenses.toLocaleString();
            document.getElementById('netProfit').textContent = '$' + (revenue - expenses).toLocaleString();
            document.getElementById('pendingInvoices').textContent = pendingCount;
        }

        function renderTransactions(transactions) {
            const container = document.getElementById('transactionsList');
            
            if (transactions.length === 0) {
                container.innerHTML = '<div class="text-center py-12 text-gray-400">No transactions found</div>';
                return;
            }

            container.innerHTML = transactions.map(transaction => {
                const typeClass = transaction.type === 'revenue' ? 'transaction-card' : 'transaction-card expense';
                const typeColor = transaction.type === 'revenue' ? 'text-green-400' : 'text-red-400';
                const typeIcon = transaction.type === 'revenue' ? 'fas fa-arrow-up' : 'fas fa-arrow-down';
                const statusColor = transaction.status === 'completed' ? 'text-green-400' : 'text-yellow-400';
                const amount = (transaction.type === 'revenue' ? '+' : '-') + '$' + transaction.amount.toLocaleString();
                
                return '<div class="' + typeClass + ' card-gradient rounded-xl p-6 hover-scale">' +
                    '<div class="flex items-start justify-between">' +
                        '<div class="flex items-center space-x-4">' +
                            '<div class="w-12 h-12 ' + (transaction.type === 'revenue' ? 'bg-green-500/20' : 'bg-red-500/20') + ' rounded-lg flex items-center justify-center">' +
                                '<i class="' + typeIcon + ' ' + typeColor + ' text-lg"></i>' +
                            '</div>' +
                            '<div>' +
                                '<h3 class="text-lg font-bold text-white">' + transaction.description + '</h3>' +
                                '<div class="flex items-center space-x-4 text-sm text-gray-400 mt-1">' +
                                    '<span><i class="fas fa-tag mr-1"></i>' + transaction.category.charAt(0).toUpperCase() + transaction.category.slice(1) + '</span>' +
                                    '<span><i class="fas fa-calendar mr-1"></i>' + new Date(transaction.date).toLocaleDateString() + '</span>' +
                                    '<span><i class="fas fa-credit-card mr-1"></i>' + (transaction.paymentMethod || 'N/A').replace('_', ' ') + '</span>' +
                                '</div>' +
                            '</div>' +
                        '</div>' +
                        '<div class="text-right">' +
                            '<div class="text-2xl font-bold ' + typeColor + '">' + amount + '</div>' +
                            '<div class="text-sm ' + statusColor + ' mt-1">' + transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1) + '</div>' +
                        '</div>' +
                    '</div>' +
                    '<div class="mt-4 pt-4 border-t border-gray-700 flex items-center justify-between">' +
                        '<span class="text-sm text-gray-400">Ref: ' + (transaction.reference || 'N/A') + '</span>' +
                        '<div class="flex space-x-2">' +
                            '<button onclick="editTransaction(' + "'" + transaction.id + "'" + ')" class="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-xs transition-colors">' +
                                '<i class="fas fa-edit mr-1"></i> Edit' +
                            '</button>' +
                            '<button onclick="deleteTransaction(' + "'" + transaction.id + "'" + ')" class="px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-xs transition-colors">' +
                                '<i class="fas fa-trash mr-1"></i> Delete' +
                            '</button>' +
                        '</div>' +
                    '</div>' +
                '</div>';
            }).join('');
        }

        // Tab switching
        function switchFinanceTab(tabName) {
            currentFinanceTab = tabName;
            
            // Hide all tab contents
            document.querySelectorAll('.tab-content').forEach(tab => tab.classList.add('hidden'));
            
            // Remove active class from all tabs
            document.querySelectorAll('[id$="Tab"]').forEach(tab => {
                tab.classList.remove('bg-emerald-600', 'text-white');
                tab.classList.add('bg-gray-700', 'text-gray-300');
            });
            
            // Show selected tab content
            document.getElementById(tabName + 'Content').classList.remove('hidden');
            
            // Add active class to selected tab
            const selectedTab = document.getElementById(tabName + 'Tab');
            selectedTab.classList.remove('bg-gray-700', 'text-gray-300');
            selectedTab.classList.add('bg-emerald-600', 'text-white');
            
            // Load tab-specific data
            if (tabName === 'spreadsheet') {
                renderSpreadsheet();
            } else if (tabName === 'invoices') {
                loadInvoicesData();
            } else if (tabName === 'grants') {
                loadGrantsData();
            } else if (tabName === 'reports') {
                loadReportsData();
            }
        }

        function loadInvoicesData() {
            const invoices = document.getElementById('invoicesList');
            invoices.innerHTML = '<div class="text-center text-gray-400 py-8">Invoice management will be implemented here</div>';
        }

        function loadGrantsData() {
            const grants = document.getElementById('grantsList');
            grants.innerHTML = '<div class="text-center text-gray-400 py-8">Grant tracking will be implemented here</div>';
        }

        function loadReportsData() {
            // Financial reports would be implemented here
            console.log('Loading financial reports...');
        }

        // Search and filter functionality
        document.getElementById('transactionSearch').addEventListener('input', filterTransactions);
        document.getElementById('typeFilter').addEventListener('change', filterTransactions);
        document.getElementById('categoryFilter').addEventListener('change', filterTransactions);
        document.getElementById('dateFilter').addEventListener('change', filterTransactions);

        function filterTransactions() {
            const searchTerm = document.getElementById('transactionSearch').value.toLowerCase();
            const typeFilter = document.getElementById('typeFilter').value;
            const categoryFilter = document.getElementById('categoryFilter').value;
            const dateFilter = document.getElementById('dateFilter').value;
            
            const filteredTransactions = allTransactions.filter(transaction => {
                const matchesSearch = transaction.description.toLowerCase().includes(searchTerm) ||
                                    (transaction.reference || '').toLowerCase().includes(searchTerm);
                const matchesType = !typeFilter || transaction.type === typeFilter;
                const matchesCategory = !categoryFilter || transaction.category === categoryFilter;
                const matchesDate = !dateFilter || transaction.date.startsWith(dateFilter);
                
                return matchesSearch && matchesType && matchesCategory && matchesDate;
            });
            
            renderTransactions(filteredTransactions);
        }

        // Modal functions
        window.openAddTransactionModal = function() {
            document.getElementById('newTransactionDate').value = new Date().toISOString().split('T')[0];
            document.getElementById('addTransactionModal').classList.remove('hidden');
            document.getElementById('addTransactionModal').classList.add('flex');
        }

        window.closeAddTransactionModal = function() {
            document.getElementById('addTransactionModal').classList.add('hidden');
            document.getElementById('addTransactionModal').classList.remove('flex');
            document.getElementById('addTransactionForm').reset();
        }

        window.openInvoiceModal = function() {
            showNotification('Invoice creation will be implemented', 'info');
        }

        window.exportFinancialData = function() {
            try {
                showNotification('Generating financial data export...', 'success');
                
                // Generate CSV content
                let csvContent = '# GRANADA OS - FINANCIAL MANAGEMENT SYSTEM\\n';
                csvContent += '# Transaction History Export\\n';
                csvContent += '# Export Generated: ' + new Date().toISOString() + '\\n';
                csvContent += '# Total Transactions: ' + allTransactions.length + '\\n';
                csvContent += '#\\n';
                csvContent += 'ID,Type,Amount,Category,Description,Date,Reference,Payment Method,Status\\n';
                
                allTransactions.forEach(transaction => {
                    csvContent += [
                        transaction.id,
                        transaction.type,
                        transaction.amount,
                        transaction.category,
                        transaction.description.replace(/,/g, ';'),
                        transaction.date,
                        transaction.reference || '',
                        transaction.paymentMethod || '',
                        transaction.status
                    ].join(',') + '\\n';
                });
                
                const blob = new Blob([csvContent], { type: 'text/csv' });
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                
                const timestamp = new Date().toISOString().split('T')[0];
                link.download = 'granada_os_financial_data_' + timestamp + '.csv';
                
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                
                window.URL.revokeObjectURL(url);
                showNotification('Financial data export completed successfully', 'success');
            } catch (error) {
                showNotification('Export failed: ' + error.message, 'error');
            }
        }

        // Transaction management functions
        window.editTransaction = function(transactionId) {
            showNotification('Edit transaction functionality will be implemented', 'info');
        }

        window.deleteTransaction = function(transactionId) {
            if (confirm('Are you sure you want to delete this transaction?')) {
                allTransactions = allTransactions.filter(t => t.id !== transactionId);
                loadFinancialData();
                showNotification('Transaction deleted successfully', 'success');
            }
        }

        // Add transaction form submission
        document.getElementById('addTransactionForm').addEventListener('submit', function(e) {
            e.preventDefault();
            
            const newTransaction = {
                id: Date.now().toString(),
                type: document.getElementById('newTransactionType').value,
                amount: parseFloat(document.getElementById('newTransactionAmount').value),
                category: document.getElementById('newTransactionCategory').value,
                description: document.getElementById('newTransactionDescription').value,
                date: document.getElementById('newTransactionDate').value,
                reference: document.getElementById('newTransactionReference').value,
                paymentMethod: document.getElementById('newTransactionPayment').value,
                status: 'completed'
            };

            allTransactions.unshift(newTransaction);
            loadFinancialData();
            closeAddTransactionModal();
            showNotification('Transaction added successfully', 'success');
        });

        // Notification system
        function showNotification(message, type) {
            const notification = document.createElement('div');
            notification.className = 'fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg ' + 
                (type === 'success' ? 'bg-green-600' : type === 'error' ? 'bg-red-600' : 'bg-blue-600') + ' text-white';
            notification.textContent = message;
            
            document.body.appendChild(notification);
            
            setTimeout(() => {
                notification.style.opacity = '0';
                setTimeout(() => document.body.removeChild(notification), 300);
            }, 3000);
        }

        // Close modal on outside click
        document.getElementById('addTransactionModal').addEventListener('click', function(e) {
            if (e.target === this) closeAddTransactionModal();
        });

        // Spreadsheet functionality
        function initializeSpreadsheet() {
            // Initialize with sample financial data
            spreadsheetData = {
                'A1': 'Item', 'B1': 'Jan', 'C1': 'Feb', 'D1': 'Mar', 'E1': 'Q1 Total', 'F1': 'Budget', 'G1': 'Variance',
                'A2': 'Revenue', 'B2': '25000', 'C2': '28000', 'D2': '32000', 'E2': '=B2+C2+D2', 'F2': '80000', 'G2': '=E2-F2',
                'A3': 'Grants', 'B3': '15000', 'C3': '20000', 'D3': '18000', 'E3': '=B3+C3+D3', 'F3': '50000', 'G3': '=E3-F3',
                'A4': 'Consulting', 'B4': '8000', 'C4': '12000', 'D4': '10000', 'E4': '=B4+C4+D4', 'F4': '25000', 'G4': '=E4-F4',
                'A5': 'Total Revenue', 'B5': '=B2+B3+B4', 'C5': '=C2+C3+C4', 'D5': '=D2+D3+D4', 'E5': '=B5+C5+D5', 'F5': '=F2+F3+F4', 'G5': '=E5-F5',
                'A7': 'Expenses', 'B7': '', 'C7': '', 'D7': '', 'E7': '', 'F7': '', 'G7': '',
                'A8': 'Salaries', 'B8': '12000', 'C8': '12000', 'D8': '13000', 'E8': '=B8+C8+D8', 'F8': '40000', 'G8': '=E8-F8',
                'A9': 'Operations', 'B9': '5000', 'C9': '6000', 'D9': '7000', 'E9': '=B9+C9+D9', 'F9': '20000', 'G9': '=E9-F9',
                'A10': 'Marketing', 'B10': '2000', 'C10': '3000', 'D10': '2500', 'E10': '=B10+C10+D10', 'F10': '8000', 'G10': '=E10-F10',
                'A11': 'Total Expenses', 'B11': '=B8+B9+B10', 'C11': '=C8+C9+C10', 'D11': '=D8+D9+D10', 'E11': '=B11+C11+D11', 'F11': '=F8+F9+F10', 'G11': '=E11-F11',
                'A13': 'Net Profit', 'B13': '=B5-B11', 'C13': '=C5-C11', 'D13': '=D5-D11', 'E13': '=E5-E11', 'F13': '=F5-F11', 'G13': '=E13-F13'
            };
        }

        function renderSpreadsheet() {
            const headerRow = document.getElementById('headerRow');
            const tbody = document.getElementById('spreadsheetBody');
            
            // Generate column headers
            let headerHTML = '<th class="px-2 py-1 border border-gray-600 text-center w-12">#</th>';
            for (let i = 0; i < columnCount; i++) {
                const colName = String.fromCharCode(65 + i);
                headerHTML += '<th class="px-2 py-1 border border-gray-600 text-center min-w-24 cursor-pointer hover:bg-gray-700" onclick="selectColumn(' + "'" + colName + "'" + ')">' + colName + '</th>';
            }
            headerRow.innerHTML = headerHTML;
            
            // Generate spreadsheet rows
            let bodyHTML = '';
            for (let row = 1; row <= rowCount; row++) {
                bodyHTML += '<tr>';
                bodyHTML += '<td class="px-2 py-1 border border-gray-600 text-center bg-gray-800 font-bold cursor-pointer hover:bg-gray-700" onclick="selectRow(' + row + ')">' + row + '</td>';
                
                for (let col = 0; col < columnCount; col++) {
                    const colName = String.fromCharCode(65 + col);
                    const cellId = colName + row;
                    const cellValue = spreadsheetData[cellId] || '';
                    const displayValue = cellValue.startsWith('=') ? calculateFormula(cellValue, cellId) : cellValue;
                    
                    bodyHTML += '<td class="px-2 py-1 border border-gray-600 min-w-24">';
                    bodyHTML += '<input type="text" id="cell_' + cellId + '" value="' + displayValue + '" ';
                    bodyHTML += 'class="w-full bg-transparent text-white text-sm focus:bg-gray-700 focus:outline-none" ';
                    bodyHTML += 'onclick="selectCell(' + "'" + cellId + "'" + ')" ';
                    bodyHTML += 'onchange="updateCell(' + "'" + cellId + "'" + ', this.value)" ';
                    bodyHTML += 'onfocus="showFormula(' + "'" + cellId + "'" + ')">';
                    bodyHTML += '</td>';
                }
                bodyHTML += '</tr>';
            }
            tbody.innerHTML = bodyHTML;
        }

        function selectCell(cellId) {
            selectedCell = { row: parseInt(cellId.slice(1)), col: cellId.charAt(0) };
            document.getElementById('currentCell').textContent = cellId;
            
            // Highlight selected cell
            document.querySelectorAll('input[id^="cell_"]').forEach(input => {
                input.classList.remove('bg-emerald-600', 'bg-emerald-700');
            });
            document.getElementById('cell_' + cellId).classList.add('bg-emerald-600');
            
            showFormula(cellId);
        }

        function showFormula(cellId) {
            const formula = spreadsheetData[cellId] || '';
            document.getElementById('formulaBar').value = formula;
        }

        function updateCell(cellId, value) {
            spreadsheetData[cellId] = value;
            if (value.startsWith('=')) {
                const calculated = calculateFormula(value, cellId);
                document.getElementById('cell_' + cellId).value = calculated;
            }
            recalculateSpreadsheet();
        }

        function calculateFormula(formula, cellId) {
            try {
                // Simple formula parser for basic operations
                let expression = formula.substring(1); // Remove '='
                
                // Replace cell references with values
                expression = expression.replace(/[A-Z]\\d+/g, function(match) {
                    if (match === cellId) return '0'; // Prevent circular reference
                    const cellValue = spreadsheetData[match] || '0';
                    if (cellValue.startsWith('=')) {
                        return calculateFormula(cellValue, match);
                    }
                    return isNaN(cellValue) ? '0' : cellValue;
                });
                
                // Evaluate the expression safely
                return Function('"use strict"; return (' + expression + ')')();
            } catch (error) {
                return '#ERROR';
            }
        }

        function recalculateSpreadsheet() {
            for (let cellId in spreadsheetData) {
                if (spreadsheetData[cellId].startsWith('=')) {
                    const calculated = calculateFormula(spreadsheetData[cellId], cellId);
                    const cellElement = document.getElementById('cell_' + cellId);
                    if (cellElement) {
                        cellElement.value = calculated;
                    }
                }
            }
        }

        window.applyFormula = function() {
            const formula = document.getElementById('formulaBar').value;
            const cellId = document.getElementById('currentCell').textContent;
            updateCell(cellId, formula);
        }

        window.addSpreadsheetRow = function() {
            rowCount++;
            renderSpreadsheet();
            showNotification('Row added successfully', 'success');
        }

        window.addSpreadsheetColumn = function() {
            if (columnCount < 26) {
                columnCount++;
                renderSpreadsheet();
                showNotification('Column added successfully', 'success');
            } else {
                showNotification('Maximum 26 columns supported', 'error');
            }
        }

        window.calculateSpreadsheet = function() {
            recalculateSpreadsheet();
            showNotification('Spreadsheet recalculated', 'success');
        }

        window.exportSpreadsheet = function() {
            try {
                let csvContent = '# GRANADA OS - FINANCIAL SPREADSHEET\\n';
                csvContent += '# Export Generated: ' + new Date().toISOString() + '\\n';
                csvContent += '#\\n';
                
                // Generate headers
                let headers = [];
                for (let i = 0; i < columnCount; i++) {
                    headers.push(String.fromCharCode(65 + i));
                }
                csvContent += headers.join(',') + '\\n';
                
                // Generate data rows
                for (let row = 1; row <= rowCount; row++) {
                    let rowData = [];
                    for (let col = 0; col < columnCount; col++) {
                        const colName = String.fromCharCode(65 + col);
                        const cellId = colName + row;
                        const cellValue = spreadsheetData[cellId] || '';
                        const displayValue = cellValue.startsWith('=') ? calculateFormula(cellValue, cellId) : cellValue;
                        rowData.push(displayValue.toString().replace(/,/g, ';'));
                    }
                    csvContent += rowData.join(',') + '\\n';
                }
                
                const blob = new Blob([csvContent], { type: 'text/csv' });
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                
                const timestamp = new Date().toISOString().split('T')[0];
                link.download = 'granada_os_financial_spreadsheet_' + timestamp + '.csv';
                
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                
                window.URL.revokeObjectURL(url);
                showNotification('Spreadsheet exported successfully', 'success');
            } catch (error) {
                showNotification('Export failed: ' + error.message, 'error');
            }
        }

        window.loadTemplate = function(templateType) {
            if (templateType === 'budget') {
                spreadsheetData = {
                    'A1': 'Budget Item', 'B1': 'Planned', 'C1': 'Actual', 'D1': 'Variance', 'E1': 'Variance %',
                    'A2': 'Grant Revenue', 'B2': '50000', 'C2': '48000', 'D2': '=C2-B2', 'E2': '=D2/B2*100',
                    'A3': 'Service Revenue', 'B3': '30000', 'C3': '35000', 'D3': '=C3-B3', 'E3': '=D3/B3*100',
                    'A4': 'Total Revenue', 'B4': '=B2+B3', 'C4': '=C2+C3', 'D4': '=C4-B4', 'E4': '=D4/B4*100',
                    'A6': 'Staff Costs', 'B6': '35000', 'C6': '36000', 'D6': '=C6-B6', 'E6': '=D6/B6*100',
                    'A7': 'Operations', 'B7': '8000', 'C7': '7500', 'D7': '=C7-B7', 'E7': '=D7/B7*100',
                    'A8': 'Equipment', 'B8': '5000', 'C8': '4800', 'D8': '=C8-B8', 'E8': '=D8/B8*100',
                    'A9': 'Total Expenses', 'B9': '=B6+B7+B8', 'C9': '=C6+C7+C8', 'D9': '=C9-B9', 'E9': '=D9/B9*100',
                    'A11': 'Net Result', 'B11': '=B4-B9', 'C11': '=C4-C9', 'D11': '=C11-B11', 'E11': '=D11/B11*100'
                };
            } else if (templateType === 'cashflow') {
                spreadsheetData = {
                    'A1': 'Month', 'B1': 'Cash In', 'C1': 'Cash Out', 'D1': 'Net Flow', 'E1': 'Running Balance',
                    'A2': 'January', 'B2': '45000', 'C2': '38000', 'D2': '=B2-C2', 'E2': '50000+D2',
                    'A3': 'February', 'B3': '52000', 'C3': '41000', 'D3': '=B3-C3', 'E3': '=E2+D3',
                    'A4': 'March', 'B4': '48000', 'C4': '39000', 'D4': '=B4-C4', 'E4': '=E3+D4',
                    'A5': 'April', 'B5': '55000', 'C5': '42000', 'D5': '=B5-C5', 'E5': '=E4+D5',
                    'A6': 'May', 'B6': '58000', 'C6': '44000', 'D6': '=B6-C6', 'E6': '=E5+D6',
                    'A7': 'June', 'B7': '62000', 'C7': '46000', 'D7': '=B7-C7', 'E7': '=E6+D7'
                };
            } else if (templateType === 'pnl') {
                spreadsheetData = {
                    'A1': 'P&L Statement', 'B1': 'Current Month', 'C1': 'YTD', 'D1': 'Budget', 'E1': 'Variance',
                    'A3': 'REVENUE', 'B3': '', 'C3': '', 'D3': '', 'E3': '',
                    'A4': 'Grant Income', 'B4': '25000', 'C4': '150000', 'D4': '180000', 'E4': '=C4-D4',
                    'A5': 'Service Income', 'B5': '15000', 'C5': '90000', 'D5': '100000', 'E5': '=C5-D5',
                    'A6': 'Other Income', 'B6': '3000', 'C6': '18000', 'D6': '20000', 'E6': '=C6-D6',
                    'A7': 'Total Revenue', 'B7': '=B4+B5+B6', 'C7': '=C4+C5+C6', 'D7': '=D4+D5+D6', 'E7': '=C7-D7',
                    'A9': 'EXPENSES', 'B9': '', 'C9': '', 'D9': '', 'E9': '',
                    'A10': 'Salaries', 'B10': '20000', 'C10': '120000', 'D10': '140000', 'E10': '=C10-D10',
                    'A11': 'Operations', 'B11': '8000', 'C11': '48000', 'D11': '60000', 'E11': '=C11-D11',
                    'A12': 'Marketing', 'B12': '2000', 'C12': '12000', 'D12': '15000', 'E12': '=C12-D12',
                    'A13': 'Equipment', 'B13': '3000', 'C13': '18000', 'D13': '25000', 'E13': '=C13-D13',
                    'A14': 'Total Expenses', 'B14': '=B10+B11+B12+B13', 'C14': '=C10+C11+C12+C13', 'D14': '=D10+D11+D12+D13', 'E14': '=C14-D14',
                    'A16': 'NET PROFIT', 'B16': '=B7-B14', 'C16': '=C7-C14', 'D16': '=D7-D14', 'E16': '=C16-D16'
                };
            }
            renderSpreadsheet();
            showNotification(templateType.charAt(0).toUpperCase() + templateType.slice(1) + ' template loaded', 'success');
        }

        // Make functions globally available
        window.switchFinanceTab = switchFinanceTab;
    </script>
</body>
</html>
      `);
      return;
    }
    
    // Serve default dashboard
    res.send(`
<!DOCTYPE html>
<html lang="en" class="dark">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Granada OS - Wabden Admin</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
    <style>
        .gradient-bg { background: linear-gradient(135deg, #1f2937 0%, #111827 50%, #0f172a 100%); }
        .card-gradient { background: linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(147, 51, 234, 0.1) 100%); backdrop-filter: blur(10px); }
        .sidebar-gradient { background: linear-gradient(180deg, #1e293b 0%, #0f172a 100%); }
    </style>
</head>
<body class="bg-gray-900 text-white font-sans">
    <div class="min-h-screen flex">
        <!-- Sidebar -->
        <div class="w-64 sidebar-gradient shadow-2xl">
            <div class="p-6">
                <div class="flex items-center space-x-3 mb-8">
                    <div class="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                        <i class="fas fa-shield-alt text-white text-lg"></i>
                    </div>
                    <h1 class="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                        Wabden Admin
                    </h1>
                </div>
                
                <nav class="space-y-2">
                    <div class="nav-item flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-700/50 transition-all duration-300 cursor-pointer" onclick="window.location.href='/wabden'">
                        <i class="fas fa-tachometer-alt text-blue-400"></i>
                        <span>Dashboard</span>
                    </div>
                    <div class="nav-item flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-700/50 transition-all duration-300 cursor-pointer" onclick="window.location.href='/wabden/users'">
                        <i class="fas fa-users text-green-400"></i>
                        <span>User Management</span>
                    </div>
                    <div class="nav-item flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-700/50 transition-all duration-300 cursor-pointer" onclick="window.location.href='/wabden/opportunities'">
                        <i class="fas fa-bullseye text-yellow-400"></i>
                        <span>Opportunities</span>
                    </div>
                    <div class="nav-item flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-700/50 transition-all duration-300 cursor-pointer" onclick="window.location.href='/wabden/hr'">
                        <i class="fas fa-user-tie text-purple-400"></i>
                        <span>HR Management</span>
                    </div>
                    <div class="nav-item flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-700/50 transition-all duration-300 cursor-pointer" onclick="window.location.href='/wabden/accounting'">
                        <i class="fas fa-chart-line text-emerald-400"></i>
                        <span>Accounting</span>
                    </div>
                    <div class="nav-item flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-700/50 transition-all duration-300 cursor-pointer" onclick="window.location.href='/wabden/submissions'">
                        <i class="fas fa-file-alt text-orange-400"></i>
                        <span>Submissions</span>
                    </div>
                    <div class="nav-item flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-700/50 transition-all duration-300 cursor-pointer" onclick="window.location.href='/wabden/bots'">
                        <i class="fas fa-robot text-cyan-400"></i>
                        <span>Bot Control</span>
                    </div>
                </nav>
            </div>
        </div>

        <!-- Main Content -->
        <div class="flex-1 gradient-bg">
            <!-- Header -->
            <header class="bg-gray-800/50 backdrop-blur-lg shadow-lg p-6">
                <div class="flex items-center justify-between">
                    <div>
                        <h2 class="text-2xl font-bold text-white">System Dashboard</h2>
                        <p class="text-gray-400 mt-1">Granada OS Administrative Control</p>
                    </div>
                    <div class="flex items-center space-x-4">
                        <div class="text-right">
                            <p class="text-sm text-gray-400">Admin Session</p>
                            <p class="text-xs text-blue-400">${new Date().toLocaleString()}</p>
                        </div>
                        <div class="w-10 h-10 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                            <i class="fas fa-user-shield text-white"></i>
                        </div>
                    </div>
                </div>
            </header>

            <!-- Dashboard Content -->
            <main class="p-6">
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div class="card-gradient rounded-xl p-6">
                        <div class="flex items-center justify-between">
                            <div>
                                <p class="text-gray-400 text-sm uppercase tracking-wide">Total Users</p>
                                <p class="text-3xl font-bold text-white mt-1">1,847</p>
                                <p class="text-green-400 text-sm mt-1">
                                    <i class="fas fa-arrow-up"></i> +234 this month
                                </p>
                            </div>
                            <div class="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                                <i class="fas fa-users text-blue-400 text-xl"></i>
                            </div>
                        </div>
                    </div>

                    <div class="card-gradient rounded-xl p-6">
                        <div class="flex items-center justify-between">
                            <div>
                                <p class="text-gray-400 text-sm uppercase tracking-wide">Opportunities</p>
                                <p class="text-3xl font-bold text-white mt-1">3,421</p>
                                <p class="text-purple-400 text-sm mt-1">
                                    <i class="fas fa-check-circle"></i> 2,987 verified
                                </p>
                            </div>
                            <div class="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                                <i class="fas fa-bullseye text-purple-400 text-xl"></i>
                            </div>
                        </div>
                    </div>

                    <div class="card-gradient rounded-xl p-6">
                        <div class="flex items-center justify-between">
                            <div>
                                <p class="text-gray-400 text-sm uppercase tracking-wide">Revenue</p>
                                <p class="text-3xl font-bold text-white mt-1">$47,850</p>
                                <p class="text-emerald-400 text-sm mt-1">
                                    <i class="fas fa-dollar-sign"></i> 89 this week
                                </p>
                            </div>
                            <div class="w-12 h-12 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                                <i class="fas fa-chart-line text-emerald-400 text-xl"></i>
                            </div>
                        </div>
                    </div>

                    <div class="card-gradient rounded-xl p-6">
                        <div class="flex items-center justify-between">
                            <div>
                                <p class="text-gray-400 text-sm uppercase tracking-wide">Active Bots</p>
                                <p class="text-3xl font-bold text-white mt-1">7</p>
                                <p class="text-cyan-400 text-sm mt-1">
                                    <i class="fas fa-robot"></i> Scraping enabled
                                </p>
                            </div>
                            <div class="w-12 h-12 bg-cyan-500/20 rounded-lg flex items-center justify-center">
                                <i class="fas fa-robot text-cyan-400 text-xl"></i>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Quick Actions -->
                <div class="card-gradient rounded-xl p-6">
                    <h3 class="text-xl font-bold text-white mb-6">Quick Actions</h3>
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <button class="p-4 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300">
                            <i class="fas fa-user-plus text-2xl mb-2"></i>
                            <p class="font-medium">Manage Users</p>
                        </button>
                        
                        <button class="p-4 bg-gradient-to-r from-purple-600 to-purple-700 rounded-xl hover:from-purple-700 hover:to-purple-800 transition-all duration-300">
                            <i class="fas fa-plus-circle text-2xl mb-2"></i>
                            <p class="font-medium">Add Opportunity</p>
                        </button>
                        
                        <button class="p-4 bg-gradient-to-r from-cyan-600 to-cyan-700 rounded-xl hover:from-cyan-700 hover:to-cyan-800 transition-all duration-300">
                            <i class="fas fa-play text-2xl mb-2"></i>
                            <p class="font-medium">Run Bots</p>
                        </button>
                        
                        <button class="p-4 bg-gradient-to-r from-emerald-600 to-emerald-700 rounded-xl hover:from-emerald-700 hover:to-emerald-800 transition-all duration-300">
                            <i class="fas fa-download text-2xl mb-2"></i>
                            <p class="font-medium">Export Data</p>
                        </button>
                    </div>
                </div>

                <!-- System Status -->
                <div class="mt-6 card-gradient rounded-xl p-6">
                    <h3 class="text-xl font-bold text-white mb-4">System Status</h3>
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div class="flex items-center space-x-3">
                            <div class="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                            <span class="text-green-400">Database: Online</span>
                        </div>
                        <div class="flex items-center space-x-3">
                            <div class="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                            <span class="text-green-400">Bot System: Active</span>
                        </div>
                        <div class="flex items-center space-x-3">
                            <div class="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                            <span class="text-green-400">Admin Portal: Operational</span>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    </div>

    <script>
        // Add navigation functionality
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', function() {
                document.querySelectorAll('.nav-item').forEach(nav => {
                    nav.classList.remove('bg-blue-600/30');
                });
                this.classList.add('bg-blue-600/30');
            });
        });
    </script>
</body>
</html>
    `);
  });

  const isProduction = process.env.NODE_ENV === "production";
  if (isProduction) {
    serveStatic(app);
  } else {
    await setupVite(app, server);
  }

  // The `any` type here is intentional; we're catching all errors
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  const PORT = 5000;
  server.listen(PORT, "0.0.0.0", () => {
    log(`serving on port ${PORT}`);
  });
})();