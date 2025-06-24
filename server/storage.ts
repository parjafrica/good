import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { eq } from "drizzle-orm";
import { users, organizations, donors, donorCalls, proposals, projects, aiInteractions, donorOpportunities, searchBots, botRewards, searchTargets, opportunityVerifications, searchStatistics, type User, type InsertUser } from "@shared/schema";
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

  async createUser(insertUser: InsertUser): Promise<User> {
    const hashedPassword = await bcrypt.hash(insertUser.hashedPassword, 12);
    const result = await db.insert(users).values({
      ...insertUser,
      hashedPassword,
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
}

export const storage = new PostgresStorage();
