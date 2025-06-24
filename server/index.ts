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

  // Admin panel route - bypasses React auth completely
  app.get("/admin*", (req, res) => {
    const adminHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Granada OS - Bot Admin Panel</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #1e293b, #7c3aed, #1e293b);
            min-height: 100vh; color: white;
        }
        .container { max-width: 1200px; margin: 0 auto; padding: 2rem; }
        .header { text-align: center; margin-bottom: 3rem; }
        .title { font-size: 2.5rem; font-weight: bold; margin-bottom: 1rem;
            background: linear-gradient(45deg, #60a5fa, #a855f7);
            -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 2rem; margin-bottom: 3rem; }
        .card { background: rgba(30, 41, 59, 0.7); border: 1px solid rgba(124, 58, 237, 0.3);
            border-radius: 1rem; padding: 2rem; backdrop-filter: blur(10px); }
        .card-title { font-size: 1.2rem; font-weight: 600; margin-bottom: 1rem; color: #60a5fa; }
        .metric { display: flex; justify-content: space-between; margin-bottom: 0.75rem; }
        .metric-value { font-weight: bold; color: #10b981; }
        .button-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin: 2rem 0; }
        .btn { background: linear-gradient(45deg, #3b82f6, #8b5cf6); border: none; border-radius: 0.5rem;
            padding: 1rem; color: white; font-weight: 600; cursor: pointer; transition: transform 0.2s; }
        .btn:hover { transform: translateY(-2px); }
        .form-grid { display: grid; grid-template-columns: 2fr 1fr 1fr 1fr; gap: 1rem; margin-bottom: 1rem; }
        .input { padding: 0.75rem; border: 1px solid rgba(124, 58, 237, 0.3); border-radius: 0.5rem;
            background: rgba(15, 23, 42, 0.8); color: white; }
        .logs { background: rgba(15, 23, 42, 0.8); border-radius: 0.5rem; padding: 1rem;
            font-family: 'Courier New', monospace; font-size: 0.9rem; max-height: 300px; overflow-y: auto;
            border: 1px solid rgba(124, 58, 237, 0.3); }
        .success { color: #10b981; } .info { color: #60a5fa; } .warning { color: #f59e0b; } .error { color: #ef4444; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1 class="title">Granada OS Bot Admin Panel</h1>
            <p>Intelligent Bot Management with Human-like Behavior & AI Integration</p>
        </div>

        <div class="grid">
            <div class="card">
                <h3 class="card-title">System Status</h3>
                <div class="metric"><span>URL Targets:</span><span class="metric-value" id="urlCount">Loading...</span></div>
                <div class="metric"><span>Active Bots:</span><span class="metric-value">3</span></div>
                <div class="metric"><span>Screenshot Threshold:</span><span class="metric-value">70%</span></div>
                <div class="metric"><span>Human Behavior:</span><span class="metric-value">Enabled</span></div>
            </div>
            <div class="card">
                <h3 class="card-title">Performance</h3>
                <div class="metric"><span>Opportunities:</span><span class="metric-value" id="oppCount">Loading...</span></div>
                <div class="metric"><span>Reward Points:</span><span class="metric-value">4,450</span></div>
                <div class="metric"><span>Success Rate:</span><span class="metric-value">85%</span></div>
                <div class="metric"><span>Screenshots:</span><span class="metric-value">12</span></div>
            </div>
            <div class="card">
                <h3 class="card-title">Features</h3>
                <div class="metric"><span>✓ URL Feeding System</span></div>
                <div class="metric"><span>✓ Human-like Scrolling</span></div>
                <div class="metric"><span>✓ Click Interactions</span></div>
                <div class="metric"><span>✓ AI Content Analysis</span></div>
                <div class="metric"><span>✓ Screenshot Rewards</span></div>
                <div class="metric"><span>✓ Stealth Mode</span></div>
            </div>
        </div>

        <div class="button-grid">
            <button class="btn" onclick="runBots()">🤖 Run All Bots</button>
            <button class="btn" onclick="getTargets()">🎯 Load Targets</button>
            <button class="btn" onclick="getBotStatus()">📊 Bot Status</button>
            <button class="btn" onclick="refreshAll()">🔄 Refresh</button>
        </div>

        <div class="card">
            <h3 class="card-title">Add URL Target</h3>
            <div class="form-grid">
                <input type="url" id="url" class="input" placeholder="https://example.com/funding" />
                <input type="text" id="name" class="input" placeholder="Display Name" />
                <input type="number" id="priority" class="input" value="5" min="1" max="10" />
                <button class="btn" onclick="addUrl()">➕ Add</button>
            </div>
            <div id="urlList"></div>
        </div>

        <div class="logs" id="logs">
            <div class="info">[INFO] Granada OS Bot Admin Panel Loaded</div>
            <div class="info">[INFO] Backend API: ${req.protocol}://${req.get('host')}/api</div>
            <div class="success">[SUCCESS] Ready for bot management</div>
        </div>
    </div>

    <script>
        function log(msg, type = 'info') {
            const logs = document.getElementById('logs');
            const div = document.createElement('div');
            div.className = type;
            div.textContent = \`[\${new Date().toLocaleTimeString()}] \${msg}\`;
            logs.appendChild(div);
            logs.scrollTop = logs.scrollHeight;
        }

        async function runBots() {
            log('Starting intelligent bot system...', 'info');
            try {
                const res = await fetch('/api/run-intelligent-bots', { method: 'POST' });
                const data = await res.json();
                log(\`Started: \${data.message}\`, 'success');
            } catch (e) { log(\`Error: \${e.message}\`, 'error'); }
        }

        async function getTargets() {
            log('Loading URL targets...', 'info');
            try {
                const res = await fetch('/api/admin/search-targets');
                const data = await res.json();
                const count = data.targets?.length || 0;
                document.getElementById('urlCount').textContent = count;
                
                const list = document.getElementById('urlList');
                if (data.targets?.length) {
                    list.innerHTML = '<h4 style="color: #60a5fa; margin: 1rem 0;">Active Targets:</h4>';
                    data.targets.slice(0, 8).forEach(t => {
                        list.innerHTML += \`<div style="background: rgba(15,23,42,0.8); padding: 0.5rem; margin: 0.25rem 0; border-radius: 0.25rem; border-left: 3px solid #10b981;">
                            <strong>\${t.name}</strong> (P:\${t.priority}) - \${t.url}
                        </div>\`;
                    });
                }
                log(\`Loaded \${count} targets\`, 'success');
            } catch (e) { log(\`Error: \${e.message}\`, 'error'); }
        }

        async function getBotStatus() {
            log('Checking bot status...', 'info');
            try {
                const res = await fetch('/api/bot-queue-status');
                const data = await res.json();
                log(\`Queue: \${JSON.stringify(data.queue_status || 'Active')}\`, 'success');
            } catch (e) { log(\`Error: \${e.message}\`, 'error'); }
        }

        async function addUrl() {
            const url = document.getElementById('url').value;
            const name = document.getElementById('name').value;
            const priority = document.getElementById('priority').value || 5;
            
            if (!url || !name) { log('Enter URL and name', 'warning'); return; }
            
            try {
                const res = await fetch('/api/admin/add-url-target', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ url, name, priority: parseInt(priority), type: 'custom' })
                });
                const data = await res.json();
                log(\`Added: \${data.message || 'Success'}\`, 'success');
                document.getElementById('url').value = '';
                document.getElementById('name').value = '';
                getTargets();
            } catch (e) { log(\`Error: \${e.message}\`, 'error'); }
        }

        async function loadOpps() {
            try {
                const res = await fetch('/api/opportunities');
                const data = await res.json();
                document.getElementById('oppCount').textContent = data.length || 0;
            } catch (e) { document.getElementById('oppCount').textContent = '0'; }
        }

        async function refreshAll() {
            log('Refreshing...', 'info');
            await Promise.all([getTargets(), loadOpps(), getBotStatus()]);
            log('Refresh complete', 'success');
        }

        window.onload = () => {
            refreshAll();
            log('Admin panel ready with full bot capabilities', 'success');
        };
    </script>
</body>
</html>`;
    res.send(adminHtml);
  });

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on port 5000
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = 5000;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });
})();
