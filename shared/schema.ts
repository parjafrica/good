import { pgTable, text, integer, boolean, timestamp, uuid, jsonb, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const sessions = pgTable("sessions", {
  sid: text("sid").primaryKey(),
  sess: jsonb("sess").notNull(),
  expire: timestamp("expire").notNull(),
});

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").unique().notNull(),
  password: text("password").notNull(),
  fullName: text("full_name").notNull(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  userType: text("user_type").notNull().default("student"),
  organization: text("organization"),
  country: text("country"),
  sector: text("sector"),
  credits: integer("credits").default(100),
  isActive: boolean("is_active").default(true),
  isBanned: boolean("is_banned").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const organizations = pgTable("organizations", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  type: text("type").notNull(),
  country: text("country").notNull(),
  sector: text("sector").notNull(),
  description: text("description"),
  website: text("website"),
  contactEmail: text("contact_email"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const donors = pgTable("donors", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  type: text("type").notNull(),
  country: text("country"),
  focusAreas: text("focus_areas").array(),
  website: text("website"),
  contactEmail: text("contact_email"),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const donorCalls = pgTable("donor_calls", {
  id: uuid("id").primaryKey().defaultRandom(),
  donorId: uuid("donor_id").references(() => donors.id),
  title: text("title").notNull(),
  description: text("description").notNull(),
  eligibilityCriteria: text("eligibility_criteria"),
  fundingAmount: decimal("funding_amount"),
  deadline: timestamp("deadline"),
  applicationProcess: text("application_process"),
  contactInfo: text("contact_info"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const proposals = pgTable("proposals", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id),
  opportunityId: uuid("opportunity_id").references(() => donorOpportunities.id),
  title: text("title").notNull(),
  content: text("content").notNull(),
  status: text("status").default("draft"),
  submittedAt: timestamp("submitted_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const projects = pgTable("projects", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id),
  organizationId: uuid("organization_id").references(() => organizations.id),
  title: text("title").notNull(),
  description: text("description").notNull(),
  sector: text("sector").notNull(),
  budget: decimal("budget"),
  duration: text("duration"),
  status: text("status").default("planning"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const aiInteractions = pgTable("ai_interactions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id),
  type: text("type").notNull(),
  input: text("input").notNull(),
  output: text("output").notNull(),
  creditsUsed: integer("credits_used").default(1),
  createdAt: timestamp("created_at").defaultNow(),
});

export const donorOpportunities = pgTable("donor_opportunities", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  sourceName: text("source_name").notNull(),
  sourceUrl: text("source_url").notNull(),
  country: text("country").notNull(),
  sector: text("sector").notNull(),
  fundingAmount: text("funding_amount"),
  deadline: text("deadline"),
  eligibility: text("eligibility"),
  applicationProcess: text("application_process"),
  requirements: text("requirements").array(),
  contactInfo: text("contact_info"),
  isVerified: boolean("is_verified").default(false),
  isActive: boolean("is_active").default(true),
  contentHash: text("content_hash").unique(),
  aiMatchScore: integer("ai_match_score").default(0),
  viewCount: integer("view_count").default(0),
  applicationCount: integer("application_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const searchBots = pgTable("search_bots", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  country: text("country").notNull(),
  sector: text("sector"),
  isActive: boolean("is_active").default(true),
  lastRun: timestamp("last_run"),
  opportunitiesFound: integer("opportunities_found").default(0),
  successRate: decimal("success_rate").default("0"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const botRewards = pgTable("bot_rewards", {
  id: uuid("id").primaryKey().defaultRandom(),
  botId: uuid("bot_id").references(() => searchBots.id),
  rewardType: text("reward_type").notNull(),
  amount: integer("amount").notNull(),
  reason: text("reason"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const searchTargets = pgTable("search_targets", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  url: text("url").notNull(),
  country: text("country").notNull(),
  sector: text("sector"),
  searchTerms: text("search_terms").array(),
  isActive: boolean("is_active").default(true),
  lastScraped: timestamp("last_scraped"),
  successCount: integer("success_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const opportunityVerifications = pgTable("opportunity_verifications", {
  id: uuid("id").primaryKey().defaultRandom(),
  opportunityId: uuid("opportunity_id").references(() => donorOpportunities.id),
  verifiedBy: uuid("verified_by").references(() => users.id),
  status: text("status").notNull(),
  notes: text("notes"),
  verifiedAt: timestamp("verified_at").defaultNow(),
});

export const searchStatistics = pgTable("search_statistics", {
  id: uuid("id").primaryKey().defaultRandom(),
  botId: uuid("bot_id").references(() => searchBots.id),
  targetId: uuid("target_id").references(() => searchTargets.id),
  searchDate: timestamp("search_date").defaultNow(),
  opportunitiesFound: integer("opportunities_found").default(0),
  processingTime: integer("processing_time"),
  success: boolean("success").default(false),
  errorMessage: text("error_message"),
});

export const userInteractions = pgTable("user_interactions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id),
  action: text("action").notNull(),
  page: text("page"),
  details: jsonb("details"),
  timestamp: timestamp("timestamp").defaultNow(),
});

export const creditTransactions = pgTable("credit_transactions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id),
  type: text("type").notNull(),
  amount: integer("amount").notNull(),
  description: text("description"),
  balanceAfter: integer("balance_after"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const systemSettings = pgTable("system_settings", {
  id: uuid("id").primaryKey().defaultRandom(),
  key: text("key").unique().notNull(),
  value: jsonb("value").notNull(),
  description: text("description"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Zod schemas for validation
export const insertUserSchema = createInsertSchema(users).pick({
  email: true,
  password: true,
  fullName: true,
  firstName: true,
  lastName: true,
  userType: true,
  organization: true,
  country: true,
  sector: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;