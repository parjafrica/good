import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface HelpTip {
  id: string;
  title: string;
  content: string;
  type: 'tip' | 'warning' | 'info' | 'success';
  trigger: 'hover' | 'click' | 'auto' | 'focus';
  position: 'top' | 'bottom' | 'left' | 'right';
  delay?: number;
  context: string;
  priority: number;
  showCount?: number;
  lastShown?: Date;
  actions?: Array<{
    label: string;
    action: () => void;
    primary?: boolean;
  }>;
}

interface UserProgress {
  onboardingComplete: boolean;
  loginCount: number;
  opportunitiesViewed: number;
  proposalsCreated: number;
  timeSpent: number;
  lastActive: Date;
  strugglingAreas: string[];
}

interface HelpContextType {
  tips: HelpTip[];
  userProgress: UserProgress;
  addTip: (tip: HelpTip) => void;
  removeTip: (id: string) => void;
  updateUserProgress: (progress: Partial<UserProgress>) => void;
  getContextualTips: (context: string) => HelpTip[];
  markTipShown: (id: string) => void;
  shouldShowHelp: (context: string) => boolean;
  getUserSkillLevel: () => 'beginner' | 'intermediate' | 'advanced';
}

const HelpContext = createContext<HelpContextType | undefined>(undefined);

export const useHelp = () => {
  const context = useContext(HelpContext);
  if (!context) {
    throw new Error('useHelp must be used within a HelpProvider');
  }
  return context;
};

interface HelpProviderProps {
  children: ReactNode;
}

export const HelpProvider: React.FC<HelpProviderProps> = ({ children }) => {
  const [tips, setTips] = useState<HelpTip[]>([]);
  const [userProgress, setUserProgress] = useState<UserProgress>({
    onboardingComplete: false,
    loginCount: 0,
    opportunitiesViewed: 0,
    proposalsCreated: 0,
    timeSpent: 0,
    lastActive: new Date(),
    strugglingAreas: []
  });

  // Initialize default help tips
  useEffect(() => {
    const defaultTips: HelpTip[] = [
      {
        id: 'login-welcome',
        title: 'Welcome to Granada!',
        content: 'Click here to access your personalized funding opportunities dashboard.',
        type: 'success',
        trigger: 'auto',
        position: 'bottom',
        context: 'login',
        priority: 1,
        delay: 2000,
        actions: [
          {
            label: 'Get Started',
            action: () => window.location.href = '/dashboard',
            primary: true
          }
        ]
      },
      {
        id: 'dashboard-first-visit',
        title: 'Find Your Perfect Funding',
        content: 'Browse through thousands of verified funding opportunities tailored to your profile.',
        type: 'tip',
        trigger: 'auto',
        position: 'right',
        context: 'dashboard',
        priority: 2,
        delay: 3000,
        actions: [
          {
            label: 'Explore Opportunities',
            action: () => window.location.href = '/opportunities',
            primary: true
          },
          {
            label: 'Later',
            action: () => {}
          }
        ]
      },
      {
        id: 'opportunities-filtering',
        title: 'Smart Filtering',
        content: 'Use filters to find opportunities that match your sector, location, and funding needs.',
        type: 'tip',
        trigger: 'hover',
        position: 'top',
        context: 'opportunities',
        priority: 3
      },
      {
        id: 'proposal-creation',
        title: 'AI-Powered Proposals',
        content: 'Let our expert system help you create winning proposals with personalized guidance.',
        type: 'info',
        trigger: 'click',
        position: 'left',
        context: 'proposals',
        priority: 4,
        actions: [
          {
            label: 'Start Proposal',
            action: () => {},
            primary: true
          }
        ]
      },
      {
        id: 'deadline-warning',
        title: 'Approaching Deadline',
        content: 'This opportunity deadline is in 3 days. Consider applying soon!',
        type: 'warning',
        trigger: 'auto',
        position: 'top',
        context: 'opportunity-detail',
        priority: 5,
        delay: 1000
      },
      {
        id: 'profile-incomplete',
        title: 'Complete Your Profile',
        content: 'Add more details to receive better-matched funding opportunities.',
        type: 'warning',
        trigger: 'auto',
        position: 'bottom',
        context: 'profile',
        priority: 6,
        delay: 5000,
        actions: [
          {
            label: 'Complete Profile',
            action: () => window.location.href = '/profile',
            primary: true
          }
        ]
      },
      {
        id: 'search-tips',
        title: 'Advanced Search',
        content: 'Use keywords like "education", "health", or "climate" to find relevant opportunities.',
        type: 'tip',
        trigger: 'focus',
        position: 'bottom',
        context: 'search',
        priority: 7
      }
    ];

    setTips(defaultTips);
  }, []);

  // Load user progress from localStorage
  useEffect(() => {
    const savedProgress = localStorage.getItem('granada_user_progress');
    if (savedProgress) {
      try {
        const progress = JSON.parse(savedProgress);
        setUserProgress({
          ...progress,
          lastActive: new Date(progress.lastActive)
        });
      } catch (error) {
        console.error('Failed to parse saved user progress:', error);
      }
    }
  }, []);

  // Save user progress to localStorage
  useEffect(() => {
    localStorage.setItem('granada_user_progress', JSON.stringify(userProgress));
  }, [userProgress]);

  const addTip = (tip: HelpTip) => {
    setTips(prev => [...prev, tip]);
  };

  const removeTip = (id: string) => {
    setTips(prev => prev.filter(tip => tip.id !== id));
  };

  const updateUserProgress = (progress: Partial<UserProgress>) => {
    setUserProgress(prev => ({
      ...prev,
      ...progress,
      lastActive: new Date()
    }));
  };

  const getContextualTips = (context: string): HelpTip[] => {
    const contextTips = tips.filter(tip => tip.context === context);
    const skillLevel = getUserSkillLevel();
    
    // Filter tips based on user skill level and show history
    return contextTips.filter(tip => {
      // Don't show tips that have been shown too many times
      if (tip.showCount && tip.showCount > 3) return false;
      
      // Show beginner tips for new users
      if (skillLevel === 'beginner' && tip.type === 'info') return true;
      
      // Show advanced tips for experienced users
      if (skillLevel === 'advanced' && tip.type === 'tip') return true;
      
      // Always show warnings and success messages
      if (tip.type === 'warning' || tip.type === 'success') return true;
      
      // Show tips based on user's struggling areas
      if (userProgress.strugglingAreas.includes(context)) return true;
      
      return true;
    }).sort((a, b) => a.priority - b.priority);
  };

  const markTipShown = (id: string) => {
    setTips(prev => prev.map(tip => 
      tip.id === id 
        ? { 
            ...tip, 
            showCount: (tip.showCount || 0) + 1,
            lastShown: new Date()
          }
        : tip
    ));
  };

  const shouldShowHelp = (context: string): boolean => {
    const skillLevel = getUserSkillLevel();
    const contextTips = getContextualTips(context);
    
    // Always show help for beginners
    if (skillLevel === 'beginner') return true;
    
    // Show help if user is struggling in this area
    if (userProgress.strugglingAreas.includes(context)) return true;
    
    // Show help if there are high-priority tips
    return contextTips.some(tip => tip.priority <= 3);
  };

  const getUserSkillLevel = (): 'beginner' | 'intermediate' | 'advanced' => {
    const { loginCount, opportunitiesViewed, proposalsCreated, onboardingComplete } = userProgress;
    
    if (!onboardingComplete || loginCount < 3) return 'beginner';
    
    if (loginCount >= 3 && loginCount < 10 && opportunitiesViewed < 20) return 'intermediate';
    
    if (loginCount >= 10 || opportunitiesViewed >= 20 || proposalsCreated >= 3) return 'advanced';
    
    return 'intermediate';
  };

  const value: HelpContextType = {
    tips,
    userProgress,
    addTip,
    removeTip,
    updateUserProgress,
    getContextualTips,
    markTipShown,
    shouldShowHelp,
    getUserSkillLevel
  };

  return (
    <HelpContext.Provider value={value}>
      {children}
    </HelpContext.Provider>
  );
};