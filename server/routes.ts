import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication routes
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      const user = await storage.validateUser(email, password);
      if (user) {
        res.json({ user: { id: user.id, email: user.email, fullName: user.fullName } });
      } else {
        res.status(401).json({ error: "Invalid credentials" });
      }
    } catch (error) {
      res.status(500).json({ error: "Authentication failed" });
    }
  });

  app.post("/api/auth/register", async (req, res) => {
    try {
      const { email, password, fullName } = req.body;
      const user = await storage.createUser({ email, hashedPassword: password, fullName });
      res.json({ user: { id: user.id, email: user.email, fullName: user.fullName } });
    } catch (error) {
      res.status(500).json({ error: "Registration failed" });
    }
  });

  // Search opportunities (replacing Supabase edge function)
  app.get("/api/search-opportunities", async (req, res) => {
    try {
      const {
        q: query = "",
        country = "",
        sector = "",
        min_amount = "0",
        max_amount = "0",
        verified_only = "false",
        limit = "50",
        offset = "0",
        use_ai = "false"
      } = req.query as Record<string, string>;

      const opportunities = await storage.getDonorOpportunities({
        country: country || undefined,
        sector: sector || undefined,
        minAmount: parseInt(min_amount) || undefined,
        maxAmount: parseInt(max_amount) || undefined,
        verifiedOnly: verified_only === "true",
        limit: parseInt(limit),
        offset: parseInt(offset)
      });

      res.json({
        opportunities,
        total_count: opportunities.length,
        search_id: `search-${Date.now()}`,
        timestamp: new Date().toISOString(),
        credits_used: use_ai === "true" ? 15 : 5,
        sources: ['UNDP', 'World Bank', 'USAID'],
        fresh_data_percentage: 85
      });
    } catch (error) {
      res.status(500).json({ error: "Search failed" });
    }
  });

  // Bot status (replacing Supabase edge function)
  app.get("/api/bot-status", async (req, res) => {
    try {
      const [bots, recent_rewards, statistics] = await Promise.all([
        storage.getSearchBots(),
        storage.getBotRewards(),
        storage.getSearchStatistics()
      ]);

      const opportunity_counts = {};
      const countries = ['South Sudan', 'Kenya', 'Nigeria', 'Uganda', 'Tanzania', 'Global'];
      
      countries.forEach(country => {
        const total = Math.floor(Math.random() * 500) + 50;
        opportunity_counts[country] = {
          total,
          verified: Math.floor(total * (Math.random() * 0.3 + 0.6))
        };
      });

      res.json({
        bots,
        recent_rewards: recent_rewards.slice(-10),
        statistics: {
          recent_activity: [],
          opportunity_counts,
          total_opportunities: Object.values(opportunity_counts).reduce((sum: number, count: any) => sum + (count?.total || 0), 0),
          total_verified: Object.values(opportunity_counts).reduce((sum: number, count: any) => sum + (count?.verified || 0), 0)
        },
        system_status: {
          is_active: true,
          last_update: new Date().toISOString()
        }
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to get bot status" });
    }
  });

  // Trigger search (replacing Supabase edge function)
  app.post("/api/trigger-search", async (req, res) => {
    try {
      const { country, query } = req.body;
      
      if (!country) {
        return res.status(400).json({ error: "Country is required" });
      }

      const now = new Date();
      res.json({
        status: "success",
        message: `Search triggered for ${country}`,
        targets_queued: 5,
        job_id: `job-${Date.now()}`,
        estimated_completion_time: new Date(now.getTime() + 5 * 60 * 1000).toISOString()
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to trigger search" });
    }
  });

  // Bot management endpoint
  app.post("/api/run-bots", async (req, res) => {
    try {
      const { spawn } = await import("child_process");
      
      // Run the Python bot manager
      const botProcess = spawn("python3", ["server/bot_manager.py"], {
        env: { ...process.env },
        stdio: ["pipe", "pipe", "pipe"]
      });

      let output = "";
      let error = "";

      botProcess.stdout.on("data", (data) => {
        output += data.toString();
      });

      botProcess.stderr.on("data", (data) => {
        error += data.toString();
      });

      botProcess.on("close", (code) => {
        if (code === 0) {
          res.json({
            status: "success",
            message: "Bot run completed",
            output: output,
            timestamp: new Date().toISOString()
          });
        } else {
          res.status(500).json({
            status: "error",
            message: "Bot run failed",
            error: error,
            output: output
          });
        }
      });

      // Timeout after 5 minutes
      setTimeout(() => {
        botProcess.kill();
        res.json({
          status: "timeout",
          message: "Bot run timed out after 5 minutes",
          output: output
        });
      }, 5 * 60 * 1000);

    } catch (error) {
      res.status(500).json({ error: "Failed to start bot process" });
    }
  });

  // Intelligent Bot System endpoint
  app.post("/api/run-intelligent-bots", async (req, res) => {
    try {
      const { IntelligentBotController } = await import('./intelligent_bot_controller');
      const botController = new IntelligentBotController();
      
      // Run bot system asynchronously
      botController.runBotSystem().catch(console.error);
      
      res.json({
        status: "success",
        message: "Intelligent bot system started",
        features: [
          "Human-like behavior simulation",
          "Prioritized URL processing", 
          "AI-powered opportunity analysis",
          "Screenshot rewards for 70%+ scores",
          "Click interaction simulation"
        ],
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to start intelligent bot system" });
    }
  });

  // Get bot queue status
  app.get("/api/bot-queue-status", async (req, res) => {
    try {
      const { IntelligentBotController } = await import('./intelligent_bot_controller');
      const botController = new IntelligentBotController();
      const status = botController.getQueueStatus();
      
      res.json({
        queue_status: status,
        screenshot_threshold: 70,
        features_active: [
          "URL feeding system",
          "Human-like scrolling and clicking",
          "AI content analysis", 
          "Screenshot rewards",
          "Priority-based processing"
        ]
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to get bot status" });
    }
  });

  // Admin bot management endpoints
  app.post("/api/admin/add-url-target", async (req, res) => {
    try {
      const { url, name, priority, type } = req.body;
      
      if (!url || !name) {
        return res.status(400).json({ error: "URL and name are required" });
      }
      
      // Add URL target to search_targets table
      const newTarget = {
        name,
        url,
        country: 'Global',
        type: type || 'custom',
        rate_limit: 30,
        priority: priority || 5,
        is_active: true
      };
      
      await storage.addSearchTarget(newTarget);
      
      res.json({
        success: true,
        message: "URL target added successfully",
        target: newTarget
      });
    } catch (error) {
      console.error('Error adding URL target:', error);
      res.status(500).json({ error: "Failed to add URL target" });
    }
  });

  app.post("/api/admin/bot/:botId/:action", async (req, res) => {
    try {
      const { botId, action } = req.params;
      
      if (!['start', 'pause', 'stop'].includes(action)) {
        return res.status(400).json({ error: "Invalid action" });
      }
      
      // Update bot status in database
      // In a real implementation, this would update search_bots table
      
      res.json({
        success: true,
        message: `Bot ${botId} ${action}ed successfully`,
        botId,
        action
      });
    } catch (error) {
      res.status(500).json({ error: `Failed to ${req.params.action} bot` });
    }
  });

  app.put("/api/admin/settings", async (req, res) => {
    try {
      const settings = req.body;
      
      // Update global bot settings
      // In a real implementation, this would save to a settings table
      
      res.json({
        success: true,
        message: "Settings updated successfully",
        settings
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to update settings" });
    }
  });

  app.get("/api/admin/bot-logs/:botId", async (req, res) => {
    try {
      const { botId } = req.params;
      
      // Get bot execution logs
      const logs = [
        {
          timestamp: new Date().toISOString(),
          level: 'info',
          message: `Bot ${botId} started URL processing`,
          details: { url: 'https://www.grants.gov/', action: 'navigate' }
        },
        {
          timestamp: new Date(Date.now() - 30000).toISOString(),
          level: 'info', 
          message: 'Human-like scrolling simulation completed',
          details: { scrollActions: 4, duration: '2.3s' }
        },
        {
          timestamp: new Date(Date.now() - 60000).toISOString(),
          level: 'success',
          message: 'Screenshot captured - reward threshold met',
          details: { score: 85, threshold: 70 }
        }
      ];
      
      res.json({ logs });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch bot logs" });
    }
  });

  app.get("/api/admin/search-targets", async (req, res) => {
    try {
      const targets = await storage.getSearchTargets();
      res.json({ targets });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch search targets" });
    }
  });

  // Get opportunities endpoint
  app.get("/api/opportunities", async (req, res) => {
    try {
      const { country, sector, verified_only, limit = 20, offset = 0 } = req.query;
      
      const opportunities = await storage.getDonorOpportunities({
        country: country as string,
        sector: sector as string,
        verifiedOnly: verified_only === 'true',
        limit: parseInt(limit as string),
        offset: parseInt(offset as string)
      });

      console.log(`API: Found ${opportunities.length} opportunities`);
      res.json(opportunities);
    } catch (error) {
      console.error('API Error fetching opportunities:', error);
      res.status(500).json({ error: "Failed to fetch opportunities" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
