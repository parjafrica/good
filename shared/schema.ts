import { pgTable, text, serial, integer, boolean, uuid, timestamp, bigint, date, jsonb, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table for authentication
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  hashedPassword: text("hashed_password").notNull(),
  fullName: text("full_name").notNull(),
  isActive: boolean("is_active").default(true),
  isSuperuser: boolean("is_superuser").default(false),
  organizationId: uuid("organization_id"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Organizations table
export const organizations = pgTable("organizations", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  description: text("description"),
  missionStatement: text("mission_statement"),
  sector: text("sector"),
  country: text("country"),
  website: text("website"),
  logoUrl: text("logo_url"),
  brandColors: jsonb("brand_colors").default({}),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Donors table
export const donors = pgTable("donors", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  type: text("type").notNull(),
  country: text("country"),
  description: text("description"),
  website: text("website"),
  focusAreas: jsonb("focus_areas").default([]),
  geographicFocus: jsonb("geographic_focus").default([]),
  fundingRangeMin: integer("funding_range_min"),
  fundingRangeMax: integer("funding_range_max"),
  contactInfo: jsonb("contact_info").default({}),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Donor calls (funding opportunities)
export const donorCalls = pgTable("donor_calls", {
  id: uuid("id").primaryKey().defaultRandom(),
  donorId: uuid("donor_id").references(() => donors.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description"),
  totalFunding: bigint("total_funding", { mode: "number" }),
  maxGrantSize: integer("max_grant_size"),
  minGrantSize: integer("min_grant_size"),
  applicationDeadline: timestamp("application_deadline"),
  announcementDate: timestamp("announcement_date").defaultNow(),
  keywords: jsonb("keywords").default([]),
  sdgAlignment: jsonb("sdg_alignment").default([]),
  eligibilityCriteria: text("eligibility_criteria"),
  applicationProcess: text("application_process"),
  status: text("status").default("open"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Proposals table
export const proposals = pgTable("proposals", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id").references(() => organizations.id, { onDelete: "cascade" }),
  donorCallId: uuid("donor_call_id").references(() => donorCalls.id, { onDelete: "set null" }),
  title: text("title").notNull(),
  description: text("description"),
  status: text("status").default("draft"),
  totalBudget: bigint("total_budget", { mode: "number" }),
  durationMonths: integer("duration_months"),
  startDate: date("start_date"),
  endDate: date("end_date"),
  content: jsonb("content").default({}),
  aiScore: integer("ai_score"),
  aiFeedback: jsonb("ai_feedback").default({}),
  version: integer("version").default(1),
  createdBy: uuid("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Projects table
export const projects = pgTable("projects", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id").references(() => organizations.id, { onDelete: "cascade" }),
  proposalId: uuid("proposal_id").references(() => proposals.id, { onDelete: "set null" }),
  title: text("title").notNull(),
  description: text("description"),
  status: text("status").default("planning"),
  totalBudget: bigint("total_budget", { mode: "number" }),
  spentBudget: bigint("spent_budget", { mode: "number" }).default(0),
  startDate: date("start_date"),
  endDate: date("end_date"),
  completionPercentage: integer("completion_percentage").default(0),
  teamMembers: jsonb("team_members").default([]),
  milestones: jsonb("milestones").default([]),
  risks: jsonb("risks").default([]),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// AI interactions for chat history
export const aiInteractions = pgTable("ai_interactions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }),
  organizationId: uuid("organization_id").references(() => organizations.id, { onDelete: "cascade" }),
  message: text("message").notNull(),
  response: text("response").notNull(),
  contextType: text("context_type"),
  contextId: uuid("context_id"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Donor opportunities (scraped funding opportunities)
export const donorOpportunities = pgTable("donor_opportunities", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  description: text("description"),
  deadline: timestamp("deadline"),
  amountMin: bigint("amount_min", { mode: "number" }),
  amountMax: bigint("amount_max", { mode: "number" }),
  currency: text("currency").default("USD"),
  sourceUrl: text("source_url").notNull(),
  sourceName: text("source_name").notNull(),
  country: text("country").notNull(),
  sector: text("sector"),
  eligibilityCriteria: text("eligibility_criteria"),
  applicationProcess: text("application_process"),
  contactEmail: text("contact_email"),
  contactPhone: text("contact_phone"),
  keywords: jsonb("keywords"),
  focusAreas: jsonb("focus_areas"),
  contentHash: text("content_hash").notNull().unique(),
  scrapedAt: timestamp("scraped_at").defaultNow(),
  lastVerified: timestamp("last_verified"),
  isVerified: boolean("is_verified").default(false),
  isActive: boolean("is_active").default(true),
  verificationScore: real("verification_score").default(0.0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Search bots
export const searchBots = pgTable("search_bots", {
  id: uuid("id").primaryKey().defaultRandom(),
  botId: text("bot_id").notNull().unique(),
  name: text("name").notNull(),
  country: text("country").notNull(),
  status: text("status").default("active"),
  targetsConfig: jsonb("targets_config"),
  lastRun: timestamp("last_run"),
  totalOpportunitiesFound: integer("total_opportunities_found").default(0),
  totalRewardPoints: integer("total_reward_points").default(0),
  errorCount: integer("error_count").default(0),
  successRate: real("success_rate").default(0.0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Bot rewards
export const botRewards = pgTable("bot_rewards", {
  id: uuid("id").primaryKey().defaultRandom(),
  botId: text("bot_id").notNull(),
  country: text("country").notNull(),
  opportunitiesFound: integer("opportunities_found").notNull(),
  rewardPoints: integer("reward_points").notNull(),
  bonusMultiplier: real("bonus_multiplier").default(1.0),
  awardedAt: timestamp("awarded_at").defaultNow(),
  notes: text("notes"),
});

// Search targets
export const searchTargets = pgTable("search_targets", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  url: text("url").notNull(),
  country: text("country").notNull(),
  type: text("type").notNull(),
  selectors: jsonb("selectors"),
  headers: jsonb("headers"),
  rateLimit: integer("rate_limit").default(30),
  priority: integer("priority").default(5),
  apiKey: text("api_key"),
  isActive: boolean("is_active").default(true),
  successRate: real("success_rate").default(0.0),
  lastSuccessfulRun: timestamp("last_successful_run"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Opportunity verifications
export const opportunityVerifications = pgTable("opportunity_verifications", {
  id: uuid("id").primaryKey().defaultRandom(),
  opportunityId: uuid("opportunity_id").notNull(),
  verificationType: text("verification_type").notNull(),
  status: text("status").notNull(),
  score: real("score").default(0.0),
  details: jsonb("details"),
  verifiedAt: timestamp("verified_at").defaultNow(),
  verifiedBy: text("verified_by"),
});

// Search statistics
export const searchStatistics = pgTable("search_statistics", {
  id: uuid("id").primaryKey().defaultRandom(),
  date: timestamp("date").defaultNow(),
  country: text("country").notNull(),
  sourceName: text("source_name").notNull(),
  opportunitiesFound: integer("opportunities_found").default(0),
  opportunitiesVerified: integer("opportunities_verified").default(0),
  successRate: real("success_rate").default(0.0),
  responseTimeAvg: real("response_time_avg").default(0.0),
  errorsCount: integer("errors_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  email: true,
  hashedPassword: true,
  fullName: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
