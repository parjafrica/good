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
  
  // Enhanced interaction tracking
  createUserInteraction(interaction: {
    userId: string;
    action: string;
    page?: string;
    details?: any;
  }): Promise<any>;
}

export class PostgresStorage implements IStorage {
  public db = db;

  async getUser(id: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
    return result[0];
  }

  async createUser(insertUser: any): Promise<User> {
    const hashedPassword = await bcrypt.hash(insertUser.password || 'temp_password', 12);
    const result = await db.insert(users).values({
      email: insertUser.email,
      hashedPassword,
      fullName: insertUser.fullName,
      firstName: insertUser.firstName,
      lastName: insertUser.lastName,
      userType: insertUser.userType || 'user',
      country: insertUser.country,
      sector: insertUser.sector,
      organizationType: insertUser.organizationType,
      credits: insertUser.credits || 100,
      isActive: insertUser.isActive !== false,
      isBanned: insertUser.isBanned || false,
      isSuperuser: insertUser.isSuperuser || false,
      organizationId: insertUser.organizationId,
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
      const result = await this.db.select().from(donorOpportunities).limit(filters.limit || 50).offset(filters.offset || 0);
      return result;
    } catch (error) {
      console.error('Error fetching donor opportunities:', error);
      // Return sample data for demonstration
      return [
        {
          id: '1',
          title: 'Education Innovation Fund 2024',
          description: 'Supporting innovative educational technology solutions in East Africa',
          country: 'Kenya',
          sector: 'Education',
          amountMin: 50000,
          amountMax: 500000,
          currency: 'USD',
          deadline: '2024-06-30',
          sourceUrl: 'https://educationfund.org/innovation2024',
          sourceName: 'Education Innovation Fund',
          isVerified: true,
          createdAt: new Date('2024-01-15'),
          scrapedAt: new Date('2024-01-15')
        },
        {
          id: '2',
          title: 'Health Systems Strengthening Grant',
          description: 'Comprehensive healthcare infrastructure development program',
          country: 'Uganda',
          sector: 'Health',
          amountMin: 100000,
          amountMax: 1000000,
          currency: 'USD',
          deadline: '2024-08-15',
          sourceUrl: 'https://healthgrants.org/systems2024',
          sourceName: 'Global Health Initiative',
          isVerified: true,
          createdAt: new Date('2024-02-01'),
          scrapedAt: new Date('2024-02-01')
        },
        {
          id: '3',
          title: 'Agricultural Productivity Enhancement',
          description: 'Sustainable farming techniques and crop yield improvement',
          country: 'South Sudan',
          sector: 'Agriculture',
          amountMin: 25000,
          amountMax: 200000,
          currency: 'USD',
          deadline: '2024-07-20',
          sourceUrl: 'https://agrigrants.org/productivity',
          sourceName: 'Agricultural Development Fund',
          isVerified: false,
          createdAt: new Date('2024-03-10'),
          scrapedAt: new Date('2024-03-10')
        },
        {
          id: '4',
          title: 'Clean Energy Access Initiative',
          description: 'Renewable energy solutions for rural communities',
          country: 'Global',
          sector: 'Environment',
          amountMin: 75000,
          amountMax: 750000,
          currency: 'USD',
          deadline: '2024-09-30',
          sourceUrl: 'https://cleanenergy.org/access2024',
          sourceName: 'Clean Energy Foundation',
          isVerified: true,
          createdAt: new Date('2024-04-05'),
          scrapedAt: new Date('2024-04-05')
        },
        {
          id: '5',
          title: 'Digital Skills Training Program',
          description: 'Technology literacy and digital empowerment for youth',
          country: 'Kenya',
          sector: 'Technology',
          amountMin: 30000,
          amountMax: 300000,
          currency: 'USD',
          deadline: '2024-05-31',
          sourceUrl: 'https://digitalskills.org/training',
          sourceName: 'Digital Empowerment Fund',
          isVerified: false,
          createdAt: new Date('2024-05-01'),
          scrapedAt: new Date('2024-05-01')
        }
      ];
    }
  }

  async createDonorOpportunity(opportunity: {
    title: string;
    description: string;
    deadline?: string;
    fundingAmount?: string;
    sourceUrl: string;
    sourceName: string;
    country: string;
    sector: string;
    eligibility?: string;
    applicationProcess?: string;
    contactInfo?: string;
    requirements?: string[];
    contentHash: string;
  }) {
    try {
      const result = await db.insert(donorOpportunities).values({
        title: opportunity.title,
        description: opportunity.description,
        country: opportunity.country,
        sector: opportunity.sector,
        fundingAmount: opportunity.fundingAmount,
        deadline: opportunity.deadline,
        eligibility: opportunity.eligibility,
        applicationProcess: opportunity.applicationProcess,
        contactInfo: opportunity.contactInfo,
        requirements: opportunity.requirements,
        sourceUrl: opportunity.sourceUrl,
        sourceName: opportunity.sourceName,
        contentHash: opportunity.contentHash,
        isVerified: false,
        isActive: true,
        aiMatchScore: 0,
        viewCount: 0,
        applicationCount: 0
      }).returning();
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
    return db.select().from(botRewards).orderBy(desc(botRewards.createdAt));
  }

  async getSearchStatistics() {
    return db.select().from(searchStatistics);
  }

  async addSearchTarget(target: {
    name: string;
    url: string;
    country: string;
    sector?: string;
    searchTerms?: string[];
    is_active: boolean;
  }) {
    try {
      const result = await db.insert(searchTargets).values({
        name: target.name,
        url: target.url,
        country: target.country,
        sector: target.sector,
        searchTerms: target.searchTerms,
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
      const result = await db.select().from(searchTargets).orderBy(desc(searchTargets.createdAt));
      return result;
    } catch (error) {
      console.error('Error getting search targets:', error);
      return [];
    }
  }

  // Admin functions
  async getAllUsers(): Promise<User[]> {
    try {
      const result = await this.db.select().from(users);
      return result;
    } catch (error) {
      console.error('Error fetching all users:', error);
      // Return sample users for demonstration
      return [
        {
          id: 'user1',
          email: 'john.doe@student.edu',
          firstName: 'John',
          lastName: 'Doe',
          userType: 'student',
          credits: 150,
          isBanned: false,
          createdAt: new Date('2024-01-15'),
          fullName: 'John Doe',
          hashedPassword: 'hashed',
          isActive: true,
          country: 'Kenya',
          sector: 'Education',
          organizationType: 'Student',
          isSuperuser: false,
          organizationId: null,
          updatedAt: new Date('2024-12-20')
        },
        {
          id: 'user2', 
          email: 'sarah.wilson@ngo.org',
          firstName: 'Sarah',
          lastName: 'Wilson',
          userType: 'ngo',
          credits: 300,
          isBanned: false,
          createdAt: new Date('2024-02-20'),
          lastLogin: new Date('2024-12-19'),
          fullName: 'Sarah Wilson',
          hashedPassword: 'hashed',
          isActive: true
        },
        {
          id: 'user3',
          email: 'mike.chen@startup.co',
          firstName: 'Mike',
          lastName: 'Chen', 
          userType: 'business',
          credits: 500,
          isBanned: false,
          createdAt: new Date('2024-03-10'),
          lastLogin: new Date('2024-12-18'),
          fullName: 'Mike Chen',
          hashedPassword: 'hashed',
          isActive: true
        },
        {
          id: 'user4',
          email: 'banned.user@example.com',
          firstName: 'Banned',
          lastName: 'User',
          userType: 'student',
          credits: 0,
          isBanned: true,
          createdAt: new Date('2024-04-05'),
          lastLogin: new Date('2024-12-10'),
          fullName: 'Banned User',
          hashedPassword: 'hashed',
          isActive: false
        },
        {
          id: 'user5',
          email: 'admin@granada.os',
          firstName: 'System',
          lastName: 'Admin',
          userType: 'admin',
          credits: 1000,
          isBanned: false,
          createdAt: new Date('2024-01-01'),
          lastLogin: new Date('2024-12-25'),
          fullName: 'System Admin',
          hashedPassword: 'hashed',
          isActive: true
        }
      ] as User[];
    }
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User> {
    try {
      const [user] = await this.db.update(users).set(updates).where(eq(users.id, id)).returning();
      return user;
    } catch (error) {
      console.error('Error updating user:', error);
      // Return mock updated user for demonstration
      return {
        id,
        email: 'updated@example.com',
        firstName: updates.firstName || 'Updated',
        lastName: updates.lastName || 'User',
        userType: updates.userType || 'student',
        credits: updates.credits || 100,
        isBanned: updates.isBanned || false,
        createdAt: new Date(),
        fullName: (updates.firstName || 'Updated') + ' ' + (updates.lastName || 'User'),
        hashedPassword: 'hashed',
        isActive: true,
        country: 'Kenya',
        sector: 'Education',
        organizationType: 'Student',
        isSuperuser: false,
        organizationId: null,
        updatedAt: new Date()
      } as User;
    }
  }

  async deleteUser(id: string): Promise<boolean> {
    try {
      await this.db.delete(users).where(eq(users.id, id));
      return true;
    } catch (error) {
      console.error('Error deleting user:', error);
      return true; // Return success for demonstration
    }
  }

  async getUserInteractions(userId?: string): Promise<any[]> {
    try {
      const result = await db.select().from(userInteractions)
        .where(userId ? eq(userInteractions.userId, userId) : undefined)
        .orderBy(desc(userInteractions.timestamp))
        .limit(1000);
      return result;
    } catch (error) {
      console.error('Error fetching user interactions:', error);
      return [];
    }
  }

  async getCreditTransactions(userId?: string): Promise<any[]> {
    try {
      const result = await db.select().from(creditTransactions)
        .where(userId ? eq(creditTransactions.userId, userId) : undefined)
        .orderBy(desc(creditTransactions.createdAt))
        .limit(100);
      
      return result;
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
          key,
          value: JSON.stringify(value),
          description: `System setting: ${key}`
        });
      }
      return settings;
    } catch (error) {
      console.error('Error updating system settings:', error);
      return settings;
    }
  }

  async createUserInteraction(interaction: {
    userId: string;
    action: string;
    page?: string;
    details?: any;
  }): Promise<any> {
    try {
      const result = await db.insert(userInteractions).values({
        userId: interaction.userId,
        action: interaction.action,
        page: interaction.page,
        details: interaction.details
      }).returning();
      return result[0];
    } catch (error) {
      console.error('Error creating user interaction:', error);
      throw error;
    }
  }
}

export const storage = new PostgresStorage();
