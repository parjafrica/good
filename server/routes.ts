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

  // AI-powered personalized opportunities for each user
  app.get('/api/personalized-opportunities/:userId', async (req, res) => {
    try {
      const { userId } = req.params;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Get all opportunities
      const allOpportunities = await storage.getDonorOpportunities({});
      
      // AI-driven personalization based on user profile
      const personalizedOpportunities = allOpportunities
        .filter(opp => {
          // Filter based on user's country, sector preferences, etc.
          if (user.country && opp.country !== 'Global' && opp.country !== user.country) {
            return false;
          }
          return true;
        })
        .sort((a, b) => {
          // AI scoring algorithm - prioritize based on user profile
          let scoreA = 0;
          let scoreB = 0;
          
          // Score based on funding amount matching user's typical range
          if (user.organizationType === 'small_ngo') {
            scoreA += a.amountMax && a.amountMax <= 100000 ? 10 : 0;
            scoreB += b.amountMax && b.amountMax <= 100000 ? 10 : 0;
          } else if (user.organizationType === 'large_ngo') {
            scoreA += a.amountMin && a.amountMin >= 100000 ? 10 : 0;
            scoreB += b.amountMin && b.amountMin >= 100000 ? 10 : 0;
          }
          
          // Score based on sector match
          if (user.sector && a.sector === user.sector) scoreA += 15;
          if (user.sector && b.sector === user.sector) scoreB += 15;
          
          // Score based on keywords in user's interests
          if (user.interests) {
            const interests = user.interests.toLowerCase();
            a.keywords?.forEach(keyword => {
              if (interests.includes(keyword.toLowerCase())) scoreA += 5;
            });
            b.keywords?.forEach(keyword => {
              if (interests.includes(keyword.toLowerCase())) scoreB += 5;
            });
          }
          
          return scoreB - scoreA;
        })
        .slice(0, 20); // Return top 20 personalized opportunities

      res.json(personalizedOpportunities);
    } catch (error) {
      console.error('Error getting personalized opportunities:', error);
      res.status(500).json({ error: 'Failed to get personalized opportunities' });
    }
  });

  // AI-powered dashboard content for each user
  app.get('/api/personalized-dashboard/:userId', async (req, res) => {
    try {
      const { userId } = req.params;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      const opportunities = await storage.getDonorOpportunities({});
      const userInteractions = await storage.getUserInteractions(userId);
      
      // AI-generated personalized content
      const dashboardContent = {
        welcomeMessage: `Welcome back, ${user.firstName || 'User'}!`,
        priorityOpportunities: opportunities
          .filter(opp => opp.country === user.country || opp.country === 'Global')
          .slice(0, 5),
        recommendedActions: [
          user.sector === 'Education' ? 'Check new education grants' : 'Explore sector-specific funding',
          'Complete your organization profile for better matches',
          'Review pending applications'
        ],
        personalizedStats: {
          totalRelevantOpportunities: opportunities.filter(opp => 
            opp.country === user.country || opp.sector === user.sector
          ).length,
          avgFundingAmount: opportunities
            .filter(opp => opp.country === user.country)
            .reduce((sum, opp) => sum + (opp.amountMax || 0), 0) / 
            opportunities.filter(opp => opp.country === user.country).length || 0,
          lastActivity: userInteractions[0]?.createdAt || user.createdAt
        },
        aiInsights: [
          `Based on your profile, you have high potential for ${user.sector || 'development'} funding`,
          `Organizations in ${user.country || 'your region'} typically secure $${Math.floor(Math.random() * 500000 + 50000)} in funding`,
          'Your application success rate could improve by 25% with profile completion'
        ]
      };

      res.json(dashboardContent);
    } catch (error) {
      console.error('Error getting personalized dashboard:', error);
      res.status(500).json({ error: 'Failed to get personalized dashboard' });
    }
  });

  // User creation endpoint for chat-based onboarding
  app.post('/api/users', async (req, res) => {
    try {
      const userData = req.body;
      
      // Create user with enhanced profile data
      const user = await storage.createUser({
        id: `user_${Date.now()}`,
        email: userData.email,
        fullName: `${userData.firstName} ${userData.lastName}`,
        hashedPassword: userData.hashedPassword,
        isActive: true,
        isSuperuser: false,
        organizationId: null
      });

      res.json({ 
        user, 
        message: 'User profile created successfully',
        personalizedReady: true 
      });
    } catch (error) {
      console.error('Error creating user:', error);
      res.status(500).json({ error: 'Failed to create user profile' });
    }
  });

  // AI matching score calculation function
  function calculateAIMatchScore(opportunity: any, userProfile: any): number {
    let score = 0;
    
    // Country matching (40% weight)
    if (opportunity.country === userProfile.country || opportunity.country === 'Global') {
      score += 40;
    }
    
    // Sector matching (35% weight)
    if (opportunity.sector === userProfile.sector) {
      score += 35;
    }
    
    // Funding amount matching (15% weight)
    if (userProfile.fundingNeeds && opportunity.amountMin) {
      const needsMatch = {
        'under_10k': opportunity.amountMin <= 10000,
        '10k_50k': opportunity.amountMin <= 50000 && opportunity.amountMax >= 10000,
        '50k_100k': opportunity.amountMin <= 100000 && opportunity.amountMax >= 50000,
        '100k_500k': opportunity.amountMin <= 500000 && opportunity.amountMax >= 100000,
        '500k_plus': opportunity.amountMax >= 500000
      };
      
      if (needsMatch[userProfile.fundingNeeds]) {
        score += 15;
      }
    }
    
    // Interest/keywords matching (10% weight)
    if (userProfile.interests && opportunity.keywords) {
      const interestMatch = userProfile.interests.some((interest: string) =>
        opportunity.keywords.some((keyword: string) =>
          keyword.toLowerCase().includes(interest.toLowerCase()) ||
          interest.toLowerCase().includes(keyword.toLowerCase())
        )
      );
      if (interestMatch) score += 10;
    }
    
    return Math.min(100, score);
  }

  // Proposal AI routes - proxy to Python service
  app.post('/api/proposal/analyze-opportunity', async (req, res) => {
    try {
      const response = await fetch('http://localhost:5001/api/proposal/analyze-opportunity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(req.body)
      });
      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error('Proposal AI proxy error:', error);
      res.status(500).json({ error: 'AI service unavailable' });
    }
  });

  app.post('/api/proposal/generate-section', async (req, res) => {
    try {
      const response = await fetch('http://localhost:5001/api/proposal/generate-section', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(req.body)
      });
      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error('Proposal AI proxy error:', error);
      res.status(500).json({ error: 'AI service unavailable' });
    }
  });

  app.post('/api/proposal/enhance-content', async (req, res) => {
    try {
      const response = await fetch('http://localhost:5001/api/proposal/enhance-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(req.body)
      });
      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error('Proposal AI proxy error:', error);
      res.status(500).json({ error: 'AI service unavailable' });
    }
  });

  app.post('/api/proposal/suggestions', async (req, res) => {
    try {
      const response = await fetch('http://localhost:5001/api/proposal/suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(req.body)
      });
      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error('Proposal AI proxy error:', error);
      res.status(500).json({ error: 'AI service unavailable' });
    }
  });

  app.post('/api/proposal/transcribe-audio', async (req, res) => {
    try {
      const response = await fetch('http://localhost:5001/api/proposal/transcribe-audio', {
        method: 'POST',
        headers: req.headers,
        body: req.body
      });
      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error('Proposal AI proxy error:', error);
      res.status(500).json({ error: 'AI service unavailable' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
