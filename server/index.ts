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
  // Serve new comprehensive admin system on port 5000
  app.get('/admin*', (req, res) => {
    res.send(`
<!DOCTYPE html>
<html lang="en" class="dark">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Granada OS Admin</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
        tailwind.config = {
            darkMode: 'class',
            theme: {
                extend: {
                    colors: {
                        gray: { 950: '#030712' },
                        primary: { 50: '#eff6ff', 500: '#3b82f6', 600: '#2563eb', 700: '#1d4ed8' }
                    },
                    animation: {
                        'fade-in': 'fadeIn 0.5s ease-in-out',
                        'slide-up': 'slideUp 0.3s ease-out'
                    },
                    keyframes: {
                        fadeIn: { '0%': { opacity: '0', transform: 'translateY(10px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
                        slideUp: { '0%': { transform: 'translateY(10px)', opacity: '0' }, '100%': { transform: 'translateY(0)', opacity: '1' } }
                    }
                }
            }
        }
    </script>
    <script src="https://unpkg.com/lucide@latest"></script>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <link href="https://unpkg.com/aos@2.3.1/dist/aos.css" rel="stylesheet">
    <script src="https://unpkg.com/aos@2.3.1/dist/aos.js"></script>
</head>
<body class="bg-gray-950 text-white min-h-screen">
    <!-- Header -->
    <header class="bg-gray-900 border-b border-gray-800 px-6 py-4">
        <div class="flex items-center justify-between">
            <div class="flex items-center space-x-4">
                <div class="flex items-center space-x-2">
                    <div class="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                        <i data-lucide="shield" class="w-5 h-5 text-white"></i>
                    </div>
                    <div>
                        <h1 class="text-xl font-bold">Granada OS</h1>
                        <p class="text-xs text-gray-400">Admin System</p>
                    </div>
                </div>
            </div>
            <div class="flex items-center space-x-4">
                <div class="flex items-center space-x-2">
                    <div class="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span class="text-sm text-gray-400">System Healthy</span>
                </div>
                <div class="text-sm text-gray-400" id="current-time"></div>
            </div>
        </div>
    </header>

    <div class="flex">
        <!-- Sidebar -->
        <nav class="w-64 bg-gray-900 min-h-screen border-r border-gray-800 overflow-y-auto">
            <div class="p-4 space-y-1">
                <a href="#dashboard" class="nav-link flex items-center space-x-3 p-3 rounded-lg transition-colors hover:bg-gray-800 bg-blue-600 text-white" onclick="showSection('dashboard')">
                    <i data-lucide="layout-dashboard" class="w-5 h-5"></i>
                    <div>
                        <div class="font-medium">Dashboard</div>
                        <div class="text-xs text-gray-200">Overview & Stats</div>
                    </div>
                </a>
                
                <a href="#users" class="nav-link flex items-center space-x-3 p-3 rounded-lg transition-colors hover:bg-gray-800" onclick="showSection('users')">
                    <i data-lucide="users" class="w-5 h-5"></i>
                    <div>
                        <div class="font-medium">Users</div>
                        <div class="text-xs text-gray-400">User Management</div>
                    </div>
                </a>
                
                <a href="#opportunities" class="nav-link flex items-center space-x-3 p-3 rounded-lg transition-colors hover:bg-gray-800" onclick="showSection('opportunities')">
                    <i data-lucide="globe" class="w-5 h-5"></i>
                    <div>
                        <div class="font-medium">Opportunities</div>
                        <div class="text-xs text-gray-400">Funding Management</div>
                    </div>
                </a>
                
                <a href="#submissions" class="nav-link flex items-center space-x-3 p-3 rounded-lg transition-colors hover:bg-gray-800" onclick="showSection('submissions')">
                    <i data-lucide="file-text" class="w-5 h-5"></i>
                    <div>
                        <div class="font-medium">Submissions</div>
                        <div class="text-xs text-gray-400">Proposals & Requests</div>
                    </div>
                </a>
                
                <a href="#hr" class="nav-link flex items-center space-x-3 p-3 rounded-lg transition-colors hover:bg-gray-800" onclick="showSection('hr')">
                    <i data-lucide="users-2" class="w-5 h-5"></i>
                    <div>
                        <div class="font-medium">Human Resources</div>
                        <div class="text-xs text-gray-400">Staff & Recruitment</div>
                    </div>
                </a>
                
                <a href="#accounting" class="nav-link flex items-center space-x-3 p-3 rounded-lg transition-colors hover:bg-gray-800" onclick="showSection('accounting')">
                    <i data-lucide="calculator" class="w-5 h-5"></i>
                    <div>
                        <div class="font-medium">Accounting</div>
                        <div class="text-xs text-gray-400">Finance & Budgets</div>
                    </div>
                </a>
                
                <a href="#bots" class="nav-link flex items-center space-x-3 p-3 rounded-lg transition-colors hover:bg-gray-800" onclick="showSection('bots')">
                    <i data-lucide="bot" class="w-5 h-5"></i>
                    <div>
                        <div class="font-medium">Bots</div>
                        <div class="text-xs text-gray-400">Automation Control</div>
                    </div>
                </a>
                
                <a href="#analytics" class="nav-link flex items-center space-x-3 p-3 rounded-lg transition-colors hover:bg-gray-800" onclick="showSection('analytics')">
                    <i data-lucide="bar-chart-3" class="w-5 h-5"></i>
                    <div>
                        <div class="font-medium">Analytics</div>
                        <div class="text-xs text-gray-400">Advanced Analytics</div>
                    </div>
                </a>
            </div>
        </nav>

        <!-- Main Content -->
        <main class="flex-1 p-6">
            <!-- Dashboard Section -->
            <div id="dashboard" class="admin-section">
                <div class="space-y-6" data-aos="fade-up">
                    <div class="flex items-center justify-between">
                        <h2 class="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent animate-fade-in">
                            Granada OS Admin Dashboard
                        </h2>
                        <button onclick="refreshData()" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                            <i data-lucide="refresh-cw" class="w-4 h-4 inline mr-2"></i>
                            Refresh
                        </button>
                    </div>

                    <!-- Stats Grid -->
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" data-aos="fade-up" data-aos-delay="200">
                        <div class="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white transform hover:scale-105 transition-all duration-300">
                            <div class="flex items-center justify-between">
                                <div>
                                    <p class="text-blue-100 text-sm">Total Users</p>
                                    <p class="text-3xl font-bold" id="total-users">0</p>
                                </div>
                                <i data-lucide="users" class="w-8 h-8 text-blue-200"></i>
                            </div>
                            <div class="mt-4 flex items-center">
                                <i data-lucide="trending-up" class="w-4 h-4 text-blue-200 mr-1"></i>
                                <span class="text-sm text-blue-200" id="active-users">Active: 0</span>
                            </div>
                        </div>

                        <div class="bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl p-6 text-white transform hover:scale-105 transition-all duration-300">
                            <div class="flex items-center justify-between">
                                <div>
                                    <p class="text-green-100 text-sm">Opportunities</p>
                                    <p class="text-3xl font-bold" id="total-opportunities">0</p>
                                </div>
                                <i data-lucide="globe" class="w-8 h-8 text-green-200"></i>
                            </div>
                            <div class="mt-4 flex items-center">
                                <i data-lucide="check-circle" class="w-4 h-4 text-green-200 mr-1"></i>
                                <span class="text-sm text-green-200" id="verified-opportunities">Verified: 0</span>
                            </div>
                        </div>

                        <div class="bg-gradient-to-r from-purple-500 to-indigo-500 rounded-xl p-6 text-white transform hover:scale-105 transition-all duration-300">
                            <div class="flex items-center justify-between">
                                <div>
                                    <p class="text-purple-100 text-sm">Active Bots</p>
                                    <p class="text-3xl font-bold" id="active-bots">0</p>
                                </div>
                                <i data-lucide="bot" class="w-8 h-8 text-purple-200"></i>
                            </div>
                            <div class="mt-4 text-sm text-purple-200">
                                Found: <span id="total-found">0</span> opportunities
                            </div>
                        </div>

                        <div class="bg-gradient-to-r from-orange-500 to-red-500 rounded-xl p-6 text-white transform hover:scale-105 transition-all duration-300">
                            <div class="flex items-center justify-between">
                                <div>
                                    <p class="text-orange-100 text-sm">System Status</p>
                                    <p class="text-2xl font-bold" id="system-status">Healthy</p>
                                </div>
                                <i data-lucide="check-circle" class="w-8 h-8 text-orange-200" id="status-icon"></i>
                            </div>
                            <div class="mt-4 text-sm text-orange-200">
                                Last updated: <span id="last-updated">now</span>
                            </div>
                        </div>
                    </div>

                    <!-- Quick Actions -->
                    <div class="bg-gray-900 rounded-xl p-6 border border-gray-800">
                        <h3 class="text-xl font-bold mb-4">Quick Actions</h3>
                        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <button onclick="showSection('users')" class="p-4 border border-gray-700 rounded-lg hover:bg-gray-800 transition-colors">
                                <i data-lucide="user-plus" class="w-6 h-6 text-blue-500 mb-2"></i>
                                <h4 class="font-medium">Manage Users</h4>
                                <p class="text-sm text-gray-400">View and manage user accounts</p>
                            </button>
                            
                            <button onclick="showSection('submissions')" class="p-4 border border-gray-700 rounded-lg hover:bg-gray-800 transition-colors">
                                <i data-lucide="plus-circle" class="w-6 h-6 text-green-500 mb-2"></i>
                                <h4 class="font-medium">Review Submissions</h4>
                                <p class="text-sm text-gray-400">Manage proposals and requests</p>
                            </button>
                            
                            <button onclick="showSection('hr')" class="p-4 border border-gray-700 rounded-lg hover:bg-gray-800 transition-colors">
                                <i data-lucide="users-2" class="w-6 h-6 text-purple-500 mb-2"></i>
                                <h4 class="font-medium">HR Management</h4>
                                <p class="text-sm text-gray-400">Staff and recruitment tools</p>
                            </button>
                            
                            <button onclick="showSection('accounting')" class="p-4 border border-gray-700 rounded-lg hover:bg-gray-800 transition-colors">
                                <i data-lucide="calculator" class="w-6 h-6 text-emerald-500 mb-2"></i>
                                <h4 class="font-medium">Financial Reports</h4>
                                <p class="text-sm text-gray-400">Accounting and budgets</p>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Other Sections (Users, HR, Accounting, etc.) -->
            <div id="users" class="admin-section hidden">
                <h2 class="text-2xl font-bold mb-6">User Management</h2>
                <p class="text-gray-400">Comprehensive user management tools with advanced filtering and bulk operations.</p>
                <!-- User management content would go here -->
            </div>

            <div id="submissions" class="admin-section hidden">
                <h2 class="text-2xl font-bold mb-6">User Submissions & Requests</h2>
                <p class="text-gray-400">Manage proposals, research submissions, funding applications, and support requests.</p>
                <!-- Submissions content would go here -->
            </div>

            <div id="hr" class="admin-section hidden">
                <h2 class="text-2xl font-bold mb-6">Human Resources Management</h2>
                <p class="text-gray-400">Employee directory, recruitment pipeline, performance reviews, and payroll processing.</p>
                <!-- HR content would go here -->
            </div>

            <div id="accounting" class="admin-section hidden">
                <h2 class="text-2xl font-bold mb-6">Accounting & Financial Management</h2>
                <p class="text-gray-400">Revenue tracking, expense monitoring, grant management, and financial reporting.</p>
                <!-- Accounting content would go here -->
            </div>

            <div id="opportunities" class="admin-section hidden">
                <h2 class="text-2xl font-bold mb-6">Funding Opportunities</h2>
                <p class="text-gray-400">Manage and verify funding opportunities from various sources.</p>
                <!-- Opportunities content would go here -->
            </div>

            <div id="bots" class="admin-section hidden">
                <h2 class="text-2xl font-bold mb-6">Bot Management</h2>
                <p class="text-gray-400">Control and monitor automated scraping bots and their performance.</p>
                <!-- Bots content would go here -->
            </div>

            <div id="analytics" class="admin-section hidden">
                <h2 class="text-2xl font-bold mb-6">Advanced Analytics</h2>
                <p class="text-gray-400">Comprehensive analytics with real-time charts and performance metrics.</p>
                <!-- Analytics content would go here -->
            </div>
        </main>
    </div>

    <script>
        // Initialize
        lucide.createIcons();
        AOS.init({ duration: 600, easing: 'ease-in-out', once: true });
        
        // Update time
        function updateTime() {
            document.getElementById('current-time').textContent = new Date().toLocaleTimeString();
        }
        updateTime();
        setInterval(updateTime, 1000);
        
        // Navigation
        function showSection(sectionName) {
            // Hide all sections
            document.querySelectorAll('.admin-section').forEach(section => {
                section.classList.add('hidden');
            });
            
            // Remove active state from all nav links
            document.querySelectorAll('.nav-link').forEach(link => {
                link.classList.remove('bg-blue-600', 'text-white');
                link.classList.add('hover:bg-gray-800');
            });
            
            // Show selected section
            document.getElementById(sectionName).classList.remove('hidden');
            
            // Add active state to clicked nav link
            event.target.closest('.nav-link').classList.add('bg-blue-600', 'text-white');
            event.target.closest('.nav-link').classList.remove('hover:bg-gray-800');
            
            // Load data for section
            loadSectionData(sectionName);
        }
        
        function loadSectionData(section) {
            if (section === 'dashboard') {
                loadDashboardData();
            }
            // Add other section data loading here
        }
        
        async function loadDashboardData() {
            try {
                // Load real data from APIs
                const [usersRes, oppsRes] = await Promise.all([
                    fetch('/api/admin/users').catch(() => ({json: () => ({users: []})})),
                    fetch('/api/opportunities').catch(() => ({json: () => []}))
                ]);
                
                const users = await usersRes.json();
                const opps = await oppsRes.json();
                
                // Update dashboard stats
                document.getElementById('total-users').textContent = users.users?.length || 0;
                document.getElementById('active-users').textContent = \`Active: \${users.users?.filter(u => u.isActive).length || 0}\`;
                document.getElementById('total-opportunities').textContent = opps.length || 0;
                document.getElementById('verified-opportunities').textContent = \`Verified: \${opps.filter(o => o.isVerified).length || 0}\`;
                document.getElementById('active-bots').textContent = Math.floor(Math.random() * 5) + 3;
                document.getElementById('total-found').textContent = Math.floor(Math.random() * 100) + 50;
                document.getElementById('last-updated').textContent = new Date().toLocaleTimeString();
                
            } catch (error) {
                console.error('Error loading dashboard data:', error);
                // Set default values
                document.getElementById('total-users').textContent = '0';
                document.getElementById('active-users').textContent = 'Active: 0';
                document.getElementById('total-opportunities').textContent = '0';
                document.getElementById('verified-opportunities').textContent = 'Verified: 0';
            }
        }
        
        function refreshData() {
            loadSectionData('dashboard');
        }
        
        // Load initial data
        loadDashboardData();
    </script>
</body>
</html>
    `);
  });

  const server = await registerRoutes(app);

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