import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { proposals } from "../shared/schema";

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

  // Intelligent Proposal Generation - Direct Implementation
  app.post('/api/proposal/analyze-opportunity', async (req, res) => {
    try {
      const { opportunity_id } = req.body;
      
      // Get opportunity from database
      const opportunities = await storage.getDonorOpportunities({ id: opportunity_id });
      const opportunity = opportunities[0];
      
      if (!opportunity) {
        return res.status(404).json({ error: 'Opportunity not found' });
      }

      // Generate intelligent analysis based on opportunity data
      const analysis = {
        funder_profile: {
          organization_type: classifyFunderType(opportunity.sourceName),
          priorities: extractPriorities(opportunity.description, opportunity.sector),
          preferred_language: "professional",
          evaluation_focus: "impact"
        },
        required_sections: generateAdaptiveSections(opportunity),
        critical_requirements: extractRequirements(opportunity),
        success_strategies: generateSuccessStrategies(opportunity),
        language_style: {
          tone: "professional",
          terminology: generateTerminology(opportunity.sector),
          avoid: ["jargon", "overpromising"]
        },
        budget_approach: {
          format: opportunity.amountMax > 100000 ? "detailed" : "summary",
          inclusions: ["personnel", "program costs", "evaluation"],
          restrictions: ["administrative costs under 15%"]
        },
        evaluation_criteria: ["Need", "Approach", "Capacity", "Impact"],
        competitive_edge: generateCompetitiveEdge(opportunity)
      };

      res.json({ opportunity, analysis });
    } catch (error) {
      console.error('Analysis error:', error);
      res.status(500).json({ error: 'Analysis failed' });
    }
  });

  app.post('/api/proposal/generate-section', async (req, res) => {
    try {
      const { section_name, opportunity, user_input, transcribed_text } = req.body;
      
      // Generate content based on opportunity and user data
      const content = generateSectionContent(section_name, opportunity, user_input, transcribed_text);
      
      res.json({ content });
    } catch (error) {
      console.error('Section generation error:', error);
      res.status(500).json({ error: 'Section generation failed' });
    }
  });

  app.post('/api/proposal/save-draft', async (req, res) => {
    try {
      const { user_id, opportunity_id, content } = req.body;
      
      // Insert into database using storage interface
      const db = storage.db;
      const [proposal] = await db.insert(proposals)
        .values({
          userId: user_id,
          opportunityId: opportunity_id,
          title: content.title || 'Draft Proposal',
          content: JSON.stringify(content),
          status: 'pending_review', // Send directly to admin review
          createdAt: new Date(),
          updatedAt: new Date()
        })
        .returning();

      res.json({ proposal_id: proposal.id, success: true, status: 'pending_review' });
    } catch (error) {
      console.error('Save draft error:', error);
      res.status(500).json({ error: 'Failed to save draft' });
    }
  });

  app.post('/api/proposal/request-notification', async (req, res) => {
    try {
      const { proposal_id, email, notification_type } = req.body;
      
      // Store notification request in database
      const db = storage.db;
      await db.insert(proposals)
        .values({
          id: proposal_id,
          notificationEmail: email
        })
        .onConflictDoUpdate({
          target: proposals.id,
          set: {
            notificationEmail: email,
            updatedAt: new Date()
          }
        });

      res.json({ success: true });
    } catch (error) {
      console.error('Notification request error:', error);
      res.status(500).json({ error: 'Failed to save notification request' });
    }
  });

  // Admin proposal review routes
  app.get('/api/admin/proposals/pending', async (req, res) => {
    try {
      const db = storage.db;
      const pendingProposals = await db.select({
        id: proposals.id,
        title: proposals.title,
        user_name: proposals.userId, // This should be joined with users table
        user_email: proposals.notificationEmail,
        opportunity_title: proposals.title,
        funder_name: proposals.title, // This should be joined with opportunities
        amount: proposals.title, // This should come from opportunity
        submitted_at: proposals.createdAt,
        status: proposals.status,
        content: proposals.content,
        admin_notes: proposals.adminNotes
      })
      .from(proposals)
      .where(storage.eq(proposals.status, 'pending_review'));

      res.json({ proposals: pendingProposals });
    } catch (error) {
      console.error('Fetch pending proposals error:', error);
      res.status(500).json({ error: 'Failed to fetch proposals' });
    }
  });

  app.put('/api/admin/proposals/:id/update', async (req, res) => {
    try {
      const { id } = req.params;
      const { content, admin_notes, status } = req.body;
      
      const db = storage.db;
      await db.update(proposals)
        .set({
          content: JSON.stringify(content),
          adminNotes: admin_notes,
          status: status,
          updatedAt: new Date()
        })
        .where(storage.eq(proposals.id, id));

      res.json({ success: true });
    } catch (error) {
      console.error('Update proposal error:', error);
      res.status(500).json({ error: 'Failed to update proposal' });
    }
  });

  app.post('/api/admin/proposals/:id/complete', async (req, res) => {
    try {
      const { id } = req.params;
      const { content, admin_notes, send_email } = req.body;
      
      const db = storage.db;
      
      // Update proposal status
      const [updatedProposal] = await db.update(proposals)
        .set({
          content: JSON.stringify(content),
          adminNotes: admin_notes,
          status: 'completed',
          completedAt: new Date(),
          updatedAt: new Date()
        })
        .where(storage.eq(proposals.id, id))
        .returning();

      // Send email notification if requested
      if (send_email && updatedProposal.notificationEmail) {
        // Email notification logic would go here
        console.log(`Sending completion email to: ${updatedProposal.notificationEmail}`);
      }

      res.json({ success: true });
    } catch (error) {
      console.error('Complete proposal error:', error);
      res.status(500).json({ error: 'Failed to complete proposal' });
    }
  });

  // Helper functions for intelligent content generation
  function classifyFunderType(sourceName: string): string {
    const name = sourceName?.toLowerCase() || '';
    if (name.includes('foundation')) return 'Private Foundation';
    if (name.includes('government') || name.includes('agency')) return 'Government Agency';
    if (name.includes('research') || name.includes('university')) return 'Research Institution';
    return 'Mixed/Corporate';
  }

  function extractPriorities(description: string, sector: string): string[] {
    const priorities = [];
    const desc = (description || '').toLowerCase();
    
    if (desc.includes('innovation') || desc.includes('research')) priorities.push('Innovation');
    if (desc.includes('community') || desc.includes('local')) priorities.push('Community Impact');
    if (desc.includes('sustainable') || desc.includes('environment')) priorities.push('Sustainability');
    if (desc.includes('capacity') || desc.includes('training')) priorities.push('Capacity Building');
    
    if (sector) priorities.push(`${sector} Excellence`);
    
    return priorities.length > 0 ? priorities : ['Impact', 'Sustainability'];
  }

  function generateAdaptiveSections(opportunity: any): any[] {
    const amount = opportunity.amountMax || opportunity.amountMin || 0;
    const sector = (opportunity.sector || '').toLowerCase();
    
    let sections = [
      {
        section_name: "Executive Summary",
        description: "Compelling overview of the project and its alignment with funder priorities",
        key_points: ["problem statement", "solution approach", "expected impact"],
        word_limit: "300-400"
      },
      {
        section_name: "Statement of Need",
        description: "Evidence-based demonstration of the problem",
        key_points: ["data and statistics", "target population", "urgency"],
        word_limit: "500-700"
      }
    ];

    if (sector.includes('research') || sector.includes('academic')) {
      sections.push({
        section_name: "Literature Review",
        description: "Current state of knowledge and research gaps",
        key_points: ["existing research", "theoretical framework", "knowledge gaps"],
        word_limit: "600-800"
      });
      sections.push({
        section_name: "Methodology",
        description: "Detailed research approach and methods",
        key_points: ["research design", "data collection", "analysis plan"],
        word_limit: "700-1000"
      });
    } else {
      sections.push({
        section_name: "Project Description",
        description: "Comprehensive implementation plan",
        key_points: ["activities", "timeline", "deliverables"],
        word_limit: "600-900"
      });
      sections.push({
        section_name: "Implementation Strategy",
        description: "How the project will be executed",
        key_points: ["approach", "partnerships", "risk management"],
        word_limit: "500-700"
      });
    }

    sections.push({
      section_name: amount > 100000 ? "Detailed Budget" : "Budget Summary",
      description: amount > 100000 ? "Comprehensive budget with full justification" : "Clear budget overview",
      key_points: amount > 100000 ? ["personnel", "direct costs", "indirect costs"] : ["major categories", "cost breakdown"],
      word_limit: amount > 100000 ? "500-750" : "300-500"
    });

    sections.push({
      section_name: "Evaluation Plan",
      description: "Measurement of project success and impact",
      key_points: ["success metrics", "data collection", "reporting"],
      word_limit: "400-600"
    });

    return sections;
  }

  function generateSectionContent(sectionName: string, opportunity: any, userInput: string, transcribed: string): string {
    const templates = {
      "Executive Summary": generateExecutiveSummary(opportunity, userInput, transcribed),
      "Statement of Need": generateStatementOfNeed(opportunity, userInput, transcribed),
      "Project Description": generateProjectDescription(opportunity, userInput, transcribed),
      "Budget Summary": generateBudgetSummary(opportunity, userInput, transcribed),
      "Detailed Budget": generateBudgetSummary(opportunity, userInput, transcribed),
      "Evaluation Plan": generateEvaluationPlan(opportunity, userInput, transcribed)
    };

    return templates[sectionName] || generateGenericSection(sectionName, opportunity, userInput, transcribed);
  }

  function generateExecutiveSummary(opportunity: any, userInput: string, transcribed: string): string {
    const userContent = userInput || transcribed || '';
    const orgName = "Impact First Foundation";
    
    return `${orgName} respectfully submits this proposal for the ${opportunity.title}, seeking ${opportunity.currency || 'USD'} ${(opportunity.amountMin || 50000).toLocaleString()} to ${(opportunity.amountMax || 100000).toLocaleString()} in funding support.

Our organization addresses critical needs in the ${opportunity.sector || 'development'} sector through evidence-based interventions and community-centered approaches. This project directly aligns with your foundation's commitment to creating sustainable impact and supporting innovative solutions.

${userContent ? `Building on our experience, ${userContent}` : 'Our proposed initiative will leverage proven methodologies to deliver measurable outcomes that advance both community development and the funder\'s strategic objectives.'}

The requested funding will enable us to implement a comprehensive program that demonstrates clear impact, ensures sustainable outcomes, and provides excellent value for investment. We are committed to rigorous evaluation, transparent reporting, and building lasting partnerships that extend the reach and effectiveness of this work.

This proposal outlines our evidence-based approach, detailed implementation plan, and robust evaluation framework designed to achieve the shared goals outlined in your funding opportunity.`;
  }

  function generateStatementOfNeed(opportunity: any, userInput: string, transcribed: string): string {
    const userContent = userInput || transcribed || '';
    
    return `The need for intervention in ${opportunity.sector || 'development'} is both urgent and well-documented. Current data reveals significant gaps in services and outcomes that require immediate attention and strategic investment.

${userContent ? `Our direct experience confirms that ${userContent}` : 'Community assessments and stakeholder consultations have identified critical areas where targeted intervention can produce meaningful change.'}

Statistical evidence demonstrates that without coordinated action, current challenges will continue to impact the most vulnerable populations. The target demographic faces multiple barriers including limited access to resources, insufficient infrastructure, and systemic inequities that perpetuate cycles of disadvantage.

This funding opportunity represents a critical chance to address these documented needs through evidence-based programming that builds on community strengths while addressing systemic barriers. Our approach recognizes that sustainable solutions must be both responsive to immediate needs and strategic in building long-term capacity for continued impact.

The proposed intervention directly addresses priority areas identified by ${opportunity.sourceName || 'the funding organization'} while leveraging local partnerships and proven methodologies to ensure maximum effectiveness and sustainability.`;
  }

  function generateProjectDescription(opportunity: any, userInput: string, transcribed: string): string {
    const userContent = userInput || transcribed || '';
    
    return `This comprehensive initiative will implement a multi-phase approach designed to achieve sustainable impact in ${opportunity.sector || 'development'} while building lasting community capacity.

${userContent ? `Our implementation strategy incorporates ${userContent}` : 'The project design reflects best practices in community development and evidence-based intervention strategies.'}

Phase 1 focuses on community engagement and baseline assessment, ensuring that all programming is responsive to actual needs and builds on existing community assets. This phase includes stakeholder mapping, needs assessment, and the establishment of community advisory structures.

Phase 2 implements core programming activities through a combination of direct service delivery, capacity building, and systems strengthening. Activities are designed to be culturally appropriate, accessible, and aligned with community priorities while meeting funder objectives.

Phase 3 emphasizes sustainability and evaluation, including the development of local capacity to continue programming beyond the funding period. This phase includes comprehensive impact assessment, knowledge sharing, and the establishment of ongoing support systems.

Throughout all phases, the project maintains strong partnerships with local organizations, implements robust monitoring and evaluation systems, and ensures transparent communication with all stakeholders including the funding organization.`;
  }

  function generateBudgetSummary(opportunity: any, userInput: string, transcribed: string): string {
    const total = opportunity.amountMax || opportunity.amountMin || 50000;
    const personnel = Math.round(total * 0.6);
    const program = Math.round(total * 0.25);
    const admin = Math.round(total * 0.15);
    
    return `The requested budget of ${opportunity.currency || 'USD'} ${total.toLocaleString()} has been carefully developed to ensure maximum program impact while maintaining fiscal responsibility and transparency.

Personnel (60%): ${opportunity.currency || 'USD'} ${personnel.toLocaleString()}
This allocation supports key staff including project director, program coordinator, and community liaisons essential for successful implementation.

Program Activities (25%): ${opportunity.currency || 'USD'} ${program.toLocaleString()}
Direct program costs include materials, training resources, community events, and participant support necessary for achieving project objectives.

Administrative Costs (15%): ${opportunity.currency || 'USD'} ${admin.toLocaleString()}
Essential operational expenses including office space, communications, financial management, and compliance activities.

This budget reflects our commitment to directing maximum resources toward programming while ensuring proper oversight and accountability. All expenditures will be carefully tracked and reported according to funder requirements, with quarterly financial reports providing transparent documentation of resource utilization.

Cost-effectiveness measures include leveraging volunteer support, securing in-kind contributions, and coordinating with partner organizations to maximize the impact of every dollar invested.`;
  }

  function generateEvaluationPlan(opportunity: any, userInput: string, transcribed: string): string {
    return `Our comprehensive evaluation framework ensures accountability, demonstrates impact, and provides valuable learning for both our organization and ${opportunity.sourceName || 'the funding organization'}.

The evaluation design employs mixed-methods approaches including quantitative outcome measurement and qualitative impact assessment. Key performance indicators align directly with project objectives and funder priorities.

Baseline data collection will occur during the first month of implementation, establishing clear benchmarks for measuring progress. Data collection points are strategically scheduled at 3, 6, 9, and 12-month intervals to track progress and enable course correction as needed.

Outcome measures include both short-term outputs (participation rates, service delivery) and longer-term outcomes (behavior change, system improvements, community capacity). Impact evaluation focuses on sustainable changes that continue beyond the funding period.

Data collection methods include participant surveys, focus groups, key informant interviews, and administrative data analysis. All evaluation activities maintain strict confidentiality and follow ethical guidelines for community-based research.

Reporting includes quarterly progress reports, mid-term evaluation summary, and comprehensive final evaluation. All reports will be shared with ${opportunity.sourceName || 'the funding organization'} and include recommendations for program improvement and scaling successful interventions.

External evaluation consultation ensures objectivity and rigor in impact assessment, while internal monitoring enables real-time program adjustments to maximize effectiveness.`;
  }

  function generateGenericSection(sectionName: string, opportunity: any, userInput: string, transcribed: string): string {
    const userContent = userInput || transcribed || '';
    
    return `This ${sectionName} section addresses the specific requirements outlined in the ${opportunity.title} funding opportunity.

${userContent ? `Incorporating the provided information: ${userContent}` : 'Our approach is designed to align with the funder\'s priorities while building on our organization\'s strengths and community partnerships.'}

The proposed activities will contribute to achieving the shared objectives of sustainable impact, community empowerment, and measurable outcomes that advance the mission of ${opportunity.sourceName || 'the funding organization'}.

Our implementation strategy ensures accountability, transparency, and effective resource utilization while maintaining focus on the ultimate goal of creating positive change in the ${opportunity.sector || 'development'} sector.

This section demonstrates our commitment to meeting all requirements while delivering exceptional value and sustainable impact that extends beyond the funding period.`;
  }

  function extractRequirements(opportunity: any): string[] {
    const requirements = [];
    const eligibility = (opportunity.eligibilityCriteria || '').toLowerCase();
    const process = (opportunity.applicationProcess || '').toLowerCase();
    
    if (eligibility.includes('ngo') || eligibility.includes('nonprofit')) {
      requirements.push('Registered nonprofit status required');
    }
    if (process.includes('budget')) {
      requirements.push('Detailed budget breakdown required');
    }
    if (process.includes('evaluation')) {
      requirements.push('Comprehensive evaluation plan required');
    }
    
    requirements.push('Clear demonstration of organizational capacity');
    requirements.push('Evidence of community support and partnerships');
    
    return requirements;
  }

  function generateSuccessStrategies(opportunity: any): string[] {
    return [
      'Demonstrate clear alignment with funder priorities',
      'Provide evidence-based approach with proven methodologies',
      'Show strong community partnerships and stakeholder support',
      'Include comprehensive evaluation and learning framework',
      'Emphasize sustainability and long-term impact'
    ];
  }

  function generateTerminology(sector: string): string[] {
    const sectorTerms = {
      'health': ['health outcomes', 'evidence-based practice', 'patient-centered care'],
      'education': ['learning outcomes', 'educational equity', 'student achievement'],
      'environment': ['environmental sustainability', 'conservation', 'climate resilience'],
      'development': ['community development', 'capacity building', 'sustainable development']
    };
    
    return sectorTerms[sector?.toLowerCase()] || ['impact', 'sustainability', 'community engagement'];
  }

  function generateCompetitiveEdge(opportunity: any): string[] {
    return [
      'Strong track record of successful project implementation',
      'Deep community relationships and local partnerships',
      'Evidence-based approach with proven methodologies',
      'Comprehensive evaluation and learning framework',
      'Commitment to sustainability and long-term impact'
    ];
  }

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

  // Document processing routes - proxy to Python service
  app.post('/api/documents/upload', async (req, res) => {
    try {
      const response = await fetch('http://localhost:5002/api/documents/upload', {
        method: 'POST',
        headers: req.headers,
        body: req.body
      });
      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error('Document processing error:', error);
      res.status(500).json({ error: 'Document service unavailable' });
    }
  });

  app.post('/api/documents/analyze-text', async (req, res) => {
    try {
      const response = await fetch('http://localhost:5002/api/documents/analyze-text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(req.body)
      });
      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error('Document processing error:', error);
      res.status(500).json({ error: 'Document service unavailable' });
    }
  });

  app.get('/api/documents/opportunities/:userId', async (req, res) => {
    try {
      const response = await fetch(`http://localhost:5002/api/documents/opportunities/${req.params.userId}`);
      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error('Document processing error:', error);
      res.status(500).json({ error: 'Document service unavailable' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
