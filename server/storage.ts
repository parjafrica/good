import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { eq, desc } from "drizzle-orm";
import { users, organizations, donors, donorCalls, proposals, projects, aiInteractions, donorOpportunities, searchBots, botRewards, searchTargets, opportunityVerifications, searchStatistics, userInteractions, creditTransactions, systemSettings, type User, type InsertUser } from "@shared/schema";
import * as bcrypt from "bcryptjs";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is required");
}

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  validateUser(email: string, password: string): Promise<User | null>;
  
  // Admin functions
  getAllUsers(): Promise<User[]>;
  updateUser(id: string, updates: Partial<User>): Promise<User>;
  deleteUser(id: string): Promise<boolean>;
  getUserInteractions(userId?: string): Promise<any[]>;
  getCreditTransactions(userId?: string): Promise<any[]>;
  getSystemSettings(): Promise<any>;
  updateSystemSettings(settings: any): Promise<any>;
}

export class PostgresStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
    return result[0];
  }

  async createUser(insertUser: any): Promise<User> {
    const hashedPassword = await bcrypt.hash(insertUser.hashedPassword || 'temp_password', 12);
    const result = await db.insert(users).values({
      ...insertUser,
      hashedPassword,
      createdAt: new Date(),
      updatedAt: new Date(),
    }).returning();
    return result[0];
  }

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.getUserByEmail(email);
    if (!user) return null;
    
    const isValid = await bcrypt.compare(password, user.hashedPassword);
    return isValid ? user : null;
  }

  // Additional methods for the application
  async getDonorOpportunities(filters: {
    country?: string;
    sector?: string;
    minAmount?: number;
    maxAmount?: number;
    verifiedOnly?: boolean;
    limit?: number;
    offset?: number;
  } = {}) {
    try {
      const result = await db.select().from(donorOpportunities).limit(filters.limit || 50).offset(filters.offset || 0);
      return result;
    } catch (error) {
      console.error('Error fetching donor opportunities:', error);
      return [];
    }
  }

  async createDonorOpportunity(opportunity: {
    title: string;
    description?: string;
    deadline?: Date;
    amountMin?: number;
    amountMax?: number;
    currency?: string;
    sourceUrl: string;
    sourceName: string;
    country: string;
    sector?: string;
    eligibilityCriteria?: string;
    applicationProcess?: string;
    contactEmail?: string;
    contactPhone?: string;
    keywords?: any;
    focusAreas?: any;
    contentHash: string;
  }) {
    try {
      const result = await db.insert(donorOpportunities).values(opportunity).returning();
      return result[0];
    } catch (error) {
      console.error('Error creating donor opportunity:', error);
      throw error;
    }
  }

  async getSearchBots() {
    return db.select().from(searchBots);
  }

  async getBotRewards() {
    return db.select().from(botRewards).orderBy(botRewards.awardedAt);
  }

  async getSearchStatistics() {
    return db.select().from(searchStatistics);
  }

  async addSearchTarget(target: {
    name: string;
    url: string;
    country: string;
    type: string;
    rate_limit: number;
    priority: number;
    is_active: boolean;
  }) {
    try {
      const result = await db.insert(searchTargets).values({
        name: target.name,
        url: target.url,
        country: target.country,
        type: target.type,
        rateLimit: target.rate_limit,
        priority: target.priority,
        isActive: target.is_active
      }).returning();
      return result[0];
    } catch (error) {
      console.error('Error adding search target:', error);
      throw error;
    }
  }

  async getSearchTargets() {
    try {
      const result = await db.select().from(searchTargets).orderBy(desc(searchTargets.priority));
      return result;
    } catch (error) {
      console.error('Error getting search targets:', error);
      return [];
    }
  }

  // Admin functions
  async getAllUsers(): Promise<User[]> {
    try {
      const result = await db.select().from(users).orderBy(users.createdAt);
      return result;
    } catch (error) {
      console.error('Error fetching all users:', error);
      return [];
    }
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User> {
    const [user] = await db.update(users).set(updates).where(eq(users.id, id)).returning();
    return user;
  }

  async deleteUser(id: string): Promise<boolean> {
    try {
      await db.delete(users).where(eq(users.id, id));
      return true;
    } catch (error) {
      console.error('Error deleting user:', error);
      return false;
    }
  }

  async getUserInteractions(userId?: string): Promise<any[]> {
    try {
      let query = db.select().from(aiInteractions);
      if (userId) {
        query = query.where(eq(aiInteractions.userId, userId));
      }
      const result = await query.orderBy(aiInteractions.createdAt).limit(1000);
      return result;
    } catch (error) {
      console.error('Error fetching user interactions:', error);
      return [];
    }
  }

  async getCreditTransactions(userId?: string): Promise<any[]> {
    try {
      // Query from actual database tables once implemented
      let query = db.select().from(aiInteractions);
      if (userId) {
        query = query.where(eq(aiInteractions.userId, userId));
      }
      const result = await query.orderBy(aiInteractions.createdAt).limit(100);
      
      // Transform to credit transaction format
      return result.map(interaction => ({
        id: interaction.id,
        userId: interaction.userId,
        type: interaction.type === 'proposal_generation' ? 'spent' : 'earned',
        amount: interaction.cost ? Math.round(parseFloat(interaction.cost.toString()) * 100) : 10,
        reason: `AI ${interaction.type}`,
        timestamp: interaction.createdAt,
      }));
    } catch (error) {
      console.error('Error fetching credit transactions:', error);
      return [];
    }
  }

  async getSystemSettings(): Promise<any> {
    return {
      siteName: 'Granada OS',
      theme: 'dark',
      aiModels: {
        primary: 'gpt-4',
        secondary: 'claude-3',
        backup: 'deepseek'
      },
      features: {
        botScraping: true,
        aiAssistant: true,
        creditSystem: true,
        analytics: true
      },
      limits: {
        maxUsers: 10000,
        maxOpportunities: 50000,
        creditsPerUser: 1000
      }
    };
  }

  async updateSystemSettings(settings: any): Promise<any> {
    try {
      // Update each setting in the database
      for (const [key, value] of Object.entries(settings)) {
        await db.insert(systemSettings).values({
          id: `setting_${key}_${Date.now()}`,
          key,
          value: JSON.stringify(value),
          description: `System setting: ${key}`,
          updatedBy: 'admin',
          updatedAt: new Date()
        }).onConflictDoUpdate({
          target: systemSettings.key,
          set: {
            value: JSON.stringify(value),
            updatedAt: new Date()
          }
        });
      }
      console.log('System settings updated in database:', settings);
      return settings;
    } catch (error) {
      console.error('Error updating system settings:', error);
      return settings;
    }
  }
}

export const storage = new PostgresStorage();
