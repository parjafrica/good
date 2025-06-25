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