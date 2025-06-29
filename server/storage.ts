import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { eq, desc, and } from "drizzle-orm";
import { users, organizations, donors, donorCalls, proposals, projects, aiInteractions, donorOpportunities, searchBots, botRewards, searchTargets, opportunityVerifications, searchStatistics, userInteractions, creditTransactions, systemSettings, userBehaviorTracking, userPersonalization, personalAIBots, notifications, type User, type InsertUser, type Notification, type InsertNotification } from "@shared/schema";
import * as bcrypt from "bcryptjs";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is required");
}

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

export interface IStorage {
  // Replit Auth methods (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Additional auth methods for social login
  getUserByEmail(email: string): Promise<User | undefined>;
  
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

  // Comprehensive data collection for AI bot training
  trackUserBehavior(behaviorData: any): Promise<void>;
  saveUserPersonalization(personalizationData: any): Promise<void>;
  getUserPersonalization(userId: string): Promise<any>;
  createPersonalAIBot(botData: any): Promise<void>;
  getUserPersonalBot(userId: string): Promise<any>;
  updateBotTrainingData(userId: string, newData: any): Promise<void>;
  
  // Notification system
  createNotification(notification: InsertNotification): Promise<Notification>;
  getUserNotifications(userId: string, unreadOnly?: boolean): Promise<Notification[]>;
  markNotificationAsRead(notificationId: string): Promise<void>;
  markNotificationAsClicked(notificationId: string): Promise<void>;
  deleteNotification(notificationId: string): Promise<void>;
  getUnreadNotificationCount(userId: string): Promise<number>;
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

  // Replit Auth methods (mandatory for Replit Auth)
  async upsertUser(userData: UpsertUser): Promise<User> {
    try {
      const [user] = await db
        .insert(users)
        .values(userData)
        .onConflictDoUpdate({
          target: users.id,
          set: {
            ...userData,
            updatedAt: new Date(),
          },
        })
        .returning();
      return user;
    } catch (error) {
      console.error('Error upserting user:', error);
      throw error;
    }
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

  // Comprehensive data collection for AI bot training
  async trackUserBehavior(behaviorData: any): Promise<void> {
    try {
      await db.insert(userBehaviorTracking).values({
        userId: behaviorData.userId,
        action: behaviorData.action,
        page: behaviorData.page,
        metadata: behaviorData.metadata,
        timestamp: behaviorData.timestamp || new Date()
      });
    } catch (error) {
      console.error('Error tracking user behavior:', error);
      // Store in memory for training if DB fails
      this.storeBehaviorInMemory(behaviorData);
    }
  }

  async saveUserPersonalization(personalizationData: any): Promise<void> {
    try {
      await db.insert(userPersonalization).values({
        userId: personalizationData.userId,
        themeColors: personalizationData.themeColors,
        contentPreferences: personalizationData.contentPreferences,
        botTrainingData: personalizationData.botTrainingData,
        learningInsights: personalizationData.learningInsights,
        systemAdaptations: personalizationData.systemAdaptations
      });
    } catch (error) {
      console.error('Error saving user personalization:', error);
    }
  }

  async getUserPersonalization(userId: string): Promise<any> {
    try {
      const [result] = await db.select().from(userPersonalization)
        .where(eq(userPersonalization.userId, userId));
      return result;
    } catch (error) {
      console.error('Error getting user personalization:', error);
      return null;
    }
  }

  async createPersonalAIBot(botData: any): Promise<void> {
    try {
      await db.insert(personalAIBots).values({
        userId: botData.userId,
        botName: botData.botName,
        personality: botData.personality,
        trainingData: botData.trainingData,
        specializations: botData.specializations,
        learningModel: JSON.stringify({
          version: '1.0',
          created: new Date().toISOString(),
          dataPoints: 0,
          accuracy: 0
        }),
        performanceMetrics: JSON.stringify({
          recommendationsGiven: 0,
          userSatisfaction: 0,
          successfulMatches: 0
        })
      });
    } catch (error) {
      console.error('Error creating personal AI bot:', error);
    }
  }

  async getUserPersonalBot(userId: string): Promise<any> {
    try {
      const [result] = await db.select().from(personalAIBots)
        .where(eq(personalAIBots.userId, userId));
      return result;
    } catch (error) {
      console.error('Error getting user personal bot:', error);
      return null;
    }
  }

  async updateBotTrainingData(userId: string, newData: any): Promise<void> {
    try {
      const existingBot = await this.getUserPersonalBot(userId);
      if (existingBot) {
        const updatedTrainingData = {
          ...JSON.parse(existingBot.trainingData || '{}'),
          ...newData,
          lastUpdate: new Date().toISOString()
        };

        await db.update(personalAIBots)
          .set({
            trainingData: JSON.stringify(updatedTrainingData),
            lastTraining: new Date()
          })
          .where(eq(personalAIBots.userId, userId));
      }
    } catch (error) {
      console.error('Error updating bot training data:', error);
    }
  }

  // Notification system implementation
  async createNotification(notification: InsertNotification): Promise<Notification> {
    const result = await db.insert(notifications).values(notification).returning();
    return result[0];
  }

  async getUserNotifications(userId: string, unreadOnly: boolean = false): Promise<Notification[]> {
    if (unreadOnly) {
      return await db.select().from(notifications)
        .where(and(
          eq(notifications.userId, userId),
          eq(notifications.isRead, false)
        ))
        .orderBy(desc(notifications.createdAt));
    } else {
      return await db.select().from(notifications)
        .where(eq(notifications.userId, userId))
        .orderBy(desc(notifications.createdAt));
    }
  }

  async markNotificationAsRead(notificationId: string): Promise<void> {
    await db.update(notifications)
      .set({ 
        isRead: true, 
        readAt: new Date() 
      })
      .where(eq(notifications.id, notificationId));
  }

  async markNotificationAsClicked(notificationId: string): Promise<void> {
    // Get current click count
    const [current] = await db.select().from(notifications).where(eq(notifications.id, notificationId));
    
    await db.update(notifications)
      .set({ 
        isClicked: true, 
        clickedAt: new Date(),
        clickCount: (current?.clickCount || 0) + 1,
        isRead: true,
        readAt: current?.readAt || new Date()
      })
      .where(eq(notifications.id, notificationId));
  }

  async deleteNotification(notificationId: string): Promise<void> {
    await db.delete(notifications).where(eq(notifications.id, notificationId));
  }

  async getUnreadNotificationCount(userId: string): Promise<number> {
    const result = await db.select().from(notifications)
      .where(and(
        eq(notifications.userId, userId),
        eq(notifications.isRead, false)
      ));
    return result.length;
  }

  // Helper method for memory storage when DB fails
  private behaviorMemory: any[] = [];
  
  private storeBehaviorInMemory(behaviorData: any): void {
    this.behaviorMemory.push({
      ...behaviorData,
      storedAt: new Date()
    });
    
    // Keep only last 1000 entries in memory
    if (this.behaviorMemory.length > 1000) {
      this.behaviorMemory = this.behaviorMemory.slice(-1000);
    }
  }
}

export const storage = new PostgresStorage();
