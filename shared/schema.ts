import { pgTable, text, integer, boolean, timestamp, uuid, jsonb, decimal, varchar, numeric, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table for Replit Auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(), // Replit user ID (string, not UUID)
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  
  // Additional profile fields from original schema
  fullName: text("full_name"),
  userType: text("user_type").notNull().default("user"),
  hashedPassword: text("hashed_password"), // For email/password authentication

  // Contact Information - Comprehensive Collection
  primaryPhoneNumber: text("primary_phone_number"),
  whatsappNumber: text("whatsapp_number"),
  telegramHandle: text("telegram_handle"),
  countryCode: text("country_code"),
  alternateEmail: text("alternate_email"),
  linkedinProfile: text("linkedin_profile"),
  twitterHandle: text("twitter_handle"),
  facebookProfile: text("facebook_profile"),
  instagramHandle: text("instagram_handle"),
  personalWebsite: text("personal_website"),
  emergencyContactName: text("emergency_contact_name"),
  emergencyContactPhone: text("emergency_contact_phone"),
  emergencyContactRelation: text("emergency_contact_relation"),

  // Location & Demographics - Enhanced
  country: text("country"),
  region: text("region"),
  city: text("city"),
  postalCode: text("postal_code"),
  address: text("address"),
  timezone: text("timezone"),
  language: text("language"),
  preferredLanguage: text("preferred_language"),
  age: integer("age"),
  dateOfBirth: text("date_of_birth"),
  gender: text("gender"),
  nationality: text("nationality"),
  
  // Core Classification
  sector: text("sector"),
  organizationType: text("organization_type"),
  fundingExperience: text("funding_experience"),
  
  // Student-specific fields - Comprehensive
  educationLevel: text("education_level"),
  fieldOfStudy: text("field_of_study"),
  currentInstitution: text("current_institution"),
  institutionCountry: text("institution_country"),
  studentId: text("student_id"),
  graduationYear: text("graduation_year"),
  currentYear: text("current_year"),
  gpa: text("gpa"),
  academicAchievements: text("academic_achievements").array(),
  researchInterests: text("research_interests").array(),
  extracurricularActivities: text("extracurricular_activities").array(),
  scholarshipsReceived: text("scholarships_received").array(),
  mentorName: text("mentor_name"),
  mentorContact: text("mentor_contact"),
  parentGuardianName: text("parent_guardian_name"),
  parentGuardianPhone: text("parent_guardian_phone"),
  parentGuardianEmail: text("parent_guardian_email"),
  financialNeed: text("financial_need"),
  partTimeWork: boolean("part_time_work"),
  workExperience: text("work_experience"),
  careerGoals: text("career_goals").array(),
  
  // Organization fields - Enhanced
  organizationName: text("organization_name"),
  organizationLegalName: text("organization_legal_name"),
  organizationSize: text("organization_size"),
  organizationBudget: text("organization_budget"),
  yearsInOperation: text("years_in_operation"),
  organizationMission: text("organization_mission"),
  organizationVision: text("organization_vision"),
  targetBeneficiaries: text("target_beneficiaries").array(),
  organizationRegistrationNumber: text("organization_registration_number"),
  taxExemptStatus: text("tax_exempt_status"),
  organizationPhone: text("organization_phone"),
  organizationEmail: text("organization_email"),
  organizationWebsite: text("organization_website"),
  organizationAddress: text("organization_address"),
  boardMembers: jsonb("board_members"),
  keyStaff: jsonb("key_staff"),
  partnerOrganizations: text("partner_organizations").array(),
  mainPrograms: text("main_programs").array(),
  position: text("position"),
  responsibilities: text("responsibilities").array(),
  organizationAchievements: text("organization_achievements").array(),
  socialMediaPresence: jsonb("social_media_presence"),
  
  // Business fields - Comprehensive
  businessType: text("business_type"),
  businessName: text("business_name"),
  businessLegalName: text("business_legal_name"),
  businessStage: text("business_stage"),
  industry: text("industry"),
  subIndustry: text("sub_industry"),
  businessModel: text("business_model"),
  teamSize: text("team_size"),
  fullTimeEmployees: integer("full_time_employees"),
  partTimeEmployees: integer("part_time_employees"),
  contractors: integer("contractors"),
  annualRevenue: text("annual_revenue"),
  monthlyRevenue: text("monthly_revenue"),
  fundingHistory: jsonb("funding_history"),
  businessRegistrationNumber: text("business_registration_number"),
  businessLicense: text("business_license"),
  businessPhone: text("business_phone"),
  businessEmail: text("business_email"),
  businessWebsite: text("business_website"),
  businessAddress: text("business_address"),
  businessDescription: text("business_description"),
  valueProposition: text("value_proposition"),
  targetMarket: text("target_market"),
  competitiveAdvantage: text("competitive_advantage"),
  mainProducts: text("main_products").array(),
  mainServices: text("main_services").array(),
  keyPartners: text("key_partners").array(),
  businessAchievements: text("business_achievements").array(),
  intellectualProperty: text("intellectual_property").array(),
  coFounders: jsonb("co_founders"),
  advisors: jsonb("advisors"),
  investorsInterested: text("investors_interested").array(),
  
  // Financial & Payment Preferences - Enhanced
  preferredPaymentMethod: text("preferred_payment_method"),
  mobileMoneyprovider: text("mobile_money_provider"),
  mobileMoneyNumber: text("mobile_money_number"),
  bankName: text("bank_name"),
  bankCountry: text("bank_country"),
  bankAccountType: text("bank_account_type"),
  monthlyBudget: text("monthly_budget"),
  fundingGoals: text("funding_goals").array(),
  urgencyLevel: text("urgency_level"),
  previousGrantExperience: boolean("previous_grant_experience"),
  grantApplicationHistory: jsonb("grant_application_history"),
  fundingAmountNeeded: text("funding_amount_needed"),
  willingness_to_pay: text("willingness_to_pay"),
  budgetConstraints: text("budget_constraints"),
  
  // Personalization & Behavioral Data
  interests: text("interests").array(),
  primaryGoals: text("primary_goals").array(),
  communicationPreferences: jsonb("communication_preferences"),
  marketingConsent: boolean("marketing_consent").default(false),
  newsletterSubscription: boolean("newsletter_subscription").default(false),
  dataProcessingConsent: boolean("data_processing_consent").default(false),
  
  // Technical & System Data
  deviceType: text("device_type"),
  operatingSystem: text("operating_system"),
  browserType: text("browser_type"),
  referralSource: text("referral_source"),
  referralCode: text("referral_code"),
  lastLoginAt: timestamp("last_login_at"),
  engagementScore: integer("engagement_score").default(0),
  onboardingCompleted: boolean("onboarding_completed").default(false),
  profileCompleteness: integer("profile_completeness").default(0),
  
  // System administration
  credits: integer("credits").default(100),
  isActive: boolean("is_active").default(true),
  isBanned: boolean("is_banned").default(false),
  isSuperuser: boolean("is_superuser").default(false),
  organizationId: uuid("organization_id"),
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

export const notifications = pgTable("notifications", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id),
  title: text("title").notNull(),
  message: text("message").notNull(),
  type: text("type").notNull(), // info, warning, success, error, message, alert
  priority: text("priority").default("medium"), // low, medium, high, urgent
  isRead: boolean("is_read").default(false),
  isClicked: boolean("is_clicked").default(false),
  clickCount: integer("click_count").default(0),
  messageUrl: text("message_url"), // URL to navigate to when clicked
  relatedId: uuid("related_id"), // ID of related entity (opportunity, proposal, etc.)
  relatedType: text("related_type"), // type of related entity
  expiresAt: timestamp("expires_at"),
  readAt: timestamp("read_at"),
  clickedAt: timestamp("clicked_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const savedPaymentMethods = pgTable("saved_payment_methods", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  cardholderName: text("cardholder_name").notNull(),
  lastFourDigits: varchar("last_four_digits", { length: 4 }).notNull(),
  cardType: text("card_type").notNull(), // visa, mastercard, amex, discover
  expiryMonth: integer("expiry_month").notNull(),
  expiryYear: integer("expiry_year").notNull(),
  isDefault: boolean("is_default").default(false),
  encryptedCardToken: text("encrypted_card_token").notNull(), // encrypted card details
  billingZip: varchar("billing_zip", { length: 10 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const paymentTransactions = pgTable("payment_transactions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  paymentMethodId: uuid("payment_method_id").references(() => savedPaymentMethods.id),
  packageId: text("package_id").notNull(),
  originalAmount: decimal("original_amount", { precision: 10, scale: 2 }).notNull(),
  discountAmount: decimal("discount_amount", { precision: 10, scale: 2 }).default("0"),
  finalAmount: decimal("final_amount", { precision: 10, scale: 2 }).notNull(),
  couponCode: text("coupon_code"),
  creditsAdded: integer("credits_added").notNull(),
  status: text("status").notNull(), // pending, completed, failed, refunded
  transactionId: text("transaction_id").unique().notNull(),
  processorResponse: text("processor_response"), // JSON response from payment processor
  failureReason: text("failure_reason"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Replit Auth types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

// Zod schemas for validation (updated for Replit Auth)
export const insertUserSchema = createInsertSchema(users).pick({
  id: true,
  email: true,
  firstName: true,
  lastName: true,
  profileImageUrl: true,
});

// User Behavior Tracking for AI bot training
export const userBehaviorTracking = pgTable("user_behavior_tracking", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id),
  action: varchar("action").notNull(),
  page: varchar("page").notNull(),
  metadata: jsonb("metadata"),
  timestamp: timestamp("timestamp").defaultNow(),
});

// Comprehensive User Personalization for AI bot training
export const userPersonalization = pgTable("user_personalization", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id).unique(),
  // Visual personalization
  themeColors: jsonb("theme_colors"),
  preferredLayout: text("preferred_layout"),
  // Content personalization
  contentPreferences: jsonb("content_preferences"),
  fundingInterests: text("funding_interests").array(),
  communicationStyle: text("communication_style"),
  // AI bot training data
  botTrainingData: jsonb("bot_training_data"),
  learningInsights: jsonb("learning_insights"),
  systemAdaptations: jsonb("system_adaptations"),
  // Behavioral patterns
  activityPatterns: jsonb("activity_patterns"),
  successPatterns: jsonb("success_patterns"),
  preferredFundingTypes: text("preferred_funding_types").array(),
  targetSectors: text("target_sectors").array(),
  // Location and demographic insights
  locationInsights: jsonb("location_insights"),
  demographicProfile: jsonb("demographic_profile"),
  // Engagement metrics
  engagementScore: decimal("engagement_score").default("0"),
  lastUpdated: timestamp("last_updated").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Personal AI Bot instances - one per user
export const personalAIBots = pgTable("personal_ai_bots", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id).unique(),
  botName: text("bot_name").notNull(),
  personality: jsonb("personality"),
  learningModel: jsonb("learning_model"),
  trainingData: jsonb("training_data"),
  performanceMetrics: jsonb("performance_metrics"),
  specializations: text("specializations").array(),
  isActive: boolean("is_active").default(true),
  lastTraining: timestamp("last_training").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type SavedPaymentMethod = typeof savedPaymentMethods.$inferSelect;
export type InsertSavedPaymentMethod = typeof savedPaymentMethods.$inferInsert;
export type PaymentTransaction = typeof paymentTransactions.$inferSelect;
export type InsertPaymentTransaction = typeof paymentTransactions.$inferInsert;
export type UserBehaviorTracking = typeof userBehaviorTracking.$inferSelect;
export type InsertUserBehaviorTracking = typeof userBehaviorTracking.$inferInsert;
export type UserPersonalization = typeof userPersonalization.$inferSelect;
export type InsertUserPersonalization = typeof userPersonalization.$inferInsert;
export type PersonalAIBot = typeof personalAIBots.$inferSelect;
export type InsertPersonalAIBot = typeof personalAIBots.$inferInsert;
export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;

// Mood tracking tables
export const userMoodHistory = pgTable("user_mood_history", {
  id: varchar("id").primaryKey().$defaultFn(() => `mood_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`),
  userId: varchar("user_id").notNull(),
  detectedMood: varchar("detected_mood").notNull(),
  confidence: numeric("confidence").notNull(),
  interactionData: jsonb("interaction_data"),
  themeApplied: jsonb("theme_applied"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const userThemePreferences = pgTable("user_theme_preferences", {
  id: varchar("id").primaryKey().$defaultFn(() => `pref_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`),
  userId: varchar("user_id").notNull().unique(),
  preferences: jsonb("preferences").notNull(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type UserMoodHistory = typeof userMoodHistory.$inferSelect;
export type InsertUserMoodHistory = typeof userMoodHistory.$inferInsert;
export type UserThemePreferences = typeof userThemePreferences.$inferSelect;
export type InsertUserThemePreferences = typeof userThemePreferences.$inferInsert;