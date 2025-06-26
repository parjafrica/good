export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName?: string;
  credits: number;
  isTrialUser?: boolean;
  trialDaysRemaining?: number;
  is_superuser?: boolean;
  userType: 'student' | 'ngo' | 'business' | 'general' | 'admin';
  country: string;
  sector: string;
  organizationType: string;
  isActive: boolean;
  isBanned: boolean;
  createdAt: Date;
  lastLogin: Date;
  preferences?: any;
  organization?: Organization;
}

export interface Organization {
  id: string;
  name: string;
  description?: string;
  sector?: string;
  country?: string;
}

export interface CreditTransaction {
  id: string;
  userId: string;
  amount: number;
  type: 'purchase' | 'usage' | 'refund';
  description: string;
  timestamp: Date;
}

export interface DonorMatch {
  id: string;
  name: string;
  type: string;
  matchScore: number;
  focusAreas: string[];
  typicalGrantSize: string;
  deadline?: string;
  activeOpportunities: number;
  isBookmarked: boolean;
  lastUpdated: string;
}

export interface ProposalGeneration {
  id: string;
  title: string;
  description: string;
  organizationName: string;
  fundingAmount: number;
  status: 'draft' | 'generating' | 'completed' | 'error';
  creditsUsed: number;
  generatedContent?: string;
  createdAt: Date;
}

export interface DashboardStats {
  totalFundingSecured: number;
  fundingGrowth: number;
  activeProposals: number;
  proposalGrowth: number;
  matchedDonors: number;
  donorGrowth: number;
  successRate: number;
}

export interface ActivityItem {
  id: string;
  type: 'grant_approved' | 'proposal_submitted' | 'donor_match' | 'ai_proposal';
  title: string;
  description: string;
  timestamp: Date;
  icon: string;
}

export type ProposalStatus = 'draft' | 'review' | 'submitted' | 'awarded' | 'declined';

export interface Proposal {
  id: string;
  title: string;
  donor: string;
  status: ProposalStatus;
  amount: number;
  deadline: Date;
  progress: number;
  lastModified: Date;
  description?: string;
  createdAt: Date;
  aiScore?: number;
  matchScore?: number;
  content?: {
    executiveSummary?: string;
    problemStatement?: string;
    objectives?: string;
    methodology?: string;
    budget?: string;
    timeline?: string;
    evaluation?: string;
  };
  team?: string[];
}

export interface Notification {
  id: string;
  type: 'alert' | 'success' | 'info' | 'deadline';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
}

export interface AdminStats {
  users: {
    total: number;
    active: number;
    admins: number;
  };
  opportunities: {
    total: number;
    verified: number;
    countries: number;
  };
  bots: {
    total: number;
    active: number;
    totalFinds: number;
  };
  system: {
    uptime: number;
    lastUpdate: Date;
    status: 'healthy' | 'warning' | 'error';
  };
}

export interface BotStatus {
  id: string;
  name: string;
  country: string;
  status: 'active' | 'paused' | 'error' | 'maintenance';
  lastRun?: Date;
  opportunitiesFound: number;
  rewardPoints: number;
  successRate: number;
  errorCount: number;
}

export interface BotReward {
  id: string;
  botId: string;
  country: string;
  opportunitiesFound: number;
  rewardPoints: number;
  awardedAt: Date;
}