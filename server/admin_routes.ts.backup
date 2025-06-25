import type { Express } from "express";
import { db } from "./db";
import { users, proposals, donorOpportunities, userInteractions, creditTransactions } from "../shared/schema";
import { eq, desc, count, sum } from "drizzle-orm";

export function registerAdminRoutes(app: Express) {
  // Get all real users from database
  app.get('/api/admin/users', async (req, res) => {
    try {
      const allUsers = await db.select({
        id: users.id,
        email: users.email,
        firstName: users.firstName,
        lastName: users.lastName,
        country: users.country,
        sector: users.sector,
        organizationType: users.organizationType,
        credits: users.credits,
        userType: users.userType,
        isActive: users.isActive,
        isBanned: users.isBanned,
        createdAt: users.createdAt
      }).from(users).orderBy(desc(users.createdAt));
      res.json(allUsers);
    } catch (error) {
      console.error('Database error fetching users:', error);
      res.status(500).json({ error: 'Database connection failed' });
    }
  });

  // Ban/unban users
  app.post('/api/admin/users/:id/ban', async (req, res) => {
    try {
      await db.update(users).set({ isBanned: true }).where(eq(users.id, req.params.id));
      res.json({ success: true });
    } catch (error) {
      console.error('Database error banning user:', error);
      res.status(500).json({ error: 'Failed to ban user' });
    }
  });

  app.post('/api/admin/users/:id/unban', async (req, res) => {
    try {
      await db.update(users).set({ isBanned: false }).where(eq(users.id, req.params.id));
      res.json({ success: true });
    } catch (error) {
      console.error('Database error unbanning user:', error);
      res.status(500).json({ error: 'Failed to unban user' });
    }
  });

  // Update user credits
  app.put('/api/admin/users/:id/credits', async (req, res) => {
    try {
      const { credits } = req.body;
      await db.update(users).set({ credits }).where(eq(users.id, req.params.id));
      res.json({ success: true });
    } catch (error) {
      console.error('Database error updating credits:', error);
      res.status(500).json({ error: 'Failed to update credits' });
    }
  });

  // Get all real proposals
  app.get('/api/admin/proposals', async (req, res) => {
    try {
      const allProposals = await db.select().from(proposals).orderBy(desc(proposals.createdAt));
      res.json(allProposals);
    } catch (error) {
      console.error('Database error fetching proposals:', error);
      res.status(500).json({ error: 'Database connection failed' });
    }
  });

  // Delete opportunity
  app.delete('/api/admin/opportunities/:id', async (req, res) => {
    try {
      await db.delete(donorOpportunities).where(eq(donorOpportunities.id, req.params.id));
      res.json({ success: true });
    } catch (error) {
      console.error('Database error deleting opportunity:', error);
      res.status(500).json({ error: 'Failed to delete opportunity' });
    }
  });

  // Get real user interactions
  app.get('/api/admin/interactions', async (req, res) => {
    try {
      const interactions = await db.select().from(userInteractions).orderBy(desc(userInteractions.timestamp)).limit(100);
      res.json(interactions);
    } catch (error) {
      console.error('Database error fetching interactions:', error);
      res.status(500).json({ error: 'Database connection failed' });
    }
  });

  // Get real credit transactions
  app.get('/api/admin/credits', async (req, res) => {
    try {
      const transactions = await db.select().from(creditTransactions).orderBy(desc(creditTransactions.timestamp)).limit(100);
      res.json(transactions);
    } catch (error) {
      console.error('Database error fetching credit transactions:', error);
      res.status(500).json({ error: 'Database connection failed' });
    }
  });

  // Get real system stats
  app.get('/api/admin/stats', async (req, res) => {
    try {
      const [userCount] = await db.select({ count: count() }).from(users);
      const [proposalCount] = await db.select({ count: count() }).from(proposals);
      const [opportunityCount] = await db.select({ count: count() }).from(donorOpportunities);
      const [activeUsers] = await db.select({ count: count() }).from(users).where(eq(users.isActive, true));
      const [bannedUsers] = await db.select({ count: count() }).from(users).where(eq(users.isBanned, true));
      
      res.json({
        totalUsers: userCount.count,
        totalProposals: proposalCount.count,
        totalOpportunities: opportunityCount.count,
        activeUsers: activeUsers.count,
        bannedUsers: bannedUsers.count
      });
    } catch (error) {
      console.error('Database error fetching stats:', error);
      res.status(500).json({ error: 'Database connection failed' });
    }
  });
}