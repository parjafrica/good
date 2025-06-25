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

  // Serve wabden admin directly without external redirect
  app.get('/wabden*', (req, res) => {
    // Serve the admin interface directly as HTML
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
                    <div class="nav-item flex items-center space-x-3 p-3 rounded-lg bg-blue-600/30 cursor-pointer">
                        <i class="fas fa-tachometer-alt text-blue-400"></i>
                        <span class="text-blue-300">Dashboard</span>
                    </div>
                    <div class="nav-item flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-700/50 transition-all duration-300 cursor-pointer">
                        <i class="fas fa-users text-green-400"></i>
                        <span>User Management</span>
                    </div>
                    <div class="nav-item flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-700/50 transition-all duration-300 cursor-pointer">
                        <i class="fas fa-bullseye text-yellow-400"></i>
                        <span>Opportunities</span>
                    </div>
                    <div class="nav-item flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-700/50 transition-all duration-300 cursor-pointer">
                        <i class="fas fa-user-tie text-purple-400"></i>
                        <span>HR Management</span>
                    </div>
                    <div class="nav-item flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-700/50 transition-all duration-300 cursor-pointer">
                        <i class="fas fa-chart-line text-emerald-400"></i>
                        <span>Accounting</span>
                    </div>
                    <div class="nav-item flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-700/50 transition-all duration-300 cursor-pointer">
                        <i class="fas fa-file-alt text-orange-400"></i>
                        <span>Submissions</span>
                    </div>
                    <div class="nav-item flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-700/50 transition-all duration-300 cursor-pointer">
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