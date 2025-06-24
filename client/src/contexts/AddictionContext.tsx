import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trophy, 
  Star, 
  Gift, 
  Zap, 
  Target, 
  Heart, 
  Sparkles,
  TrendingUp,
  Award,
  Crown,
  Flame as Fire
} from 'lucide-react';

interface UserBehavior {
  clicks: number;
  timeSpent: number;
  pagesVisited: string[];
  actionsCompleted: string[];
  streak: number;
  level: number;
  xp: number;
  credits: number;
  lastActive: Date;
  achievements: string[];
  milestones: string[];
}

interface Notification {
  id: string;
  type: 'achievement' | 'reward' | 'milestone' | 'encouragement' | 'credit' | 'streak';
  title: string;
  message: string;
  icon: React.ReactNode;
  duration?: number;
  reward?: {
    type: 'xp' | 'credits' | 'achievement';
    amount: number;
  };
}

interface AddictionContextType {
  behavior: UserBehavior;
  trackClick: (action: string, element: string) => void;
  trackPageVisit: (page: string) => void;
  trackAction: (action: string) => void;
  addCredits: (amount: number, reason: string) => void;
  deductCredits: (amount: number, reason: string) => boolean;
  addXP: (amount: number, reason: string) => void;
  notifications: Notification[];
  clearNotification: (id: string) => void;
  isAddicted: boolean;
}

const AddictionContext = createContext<AddictionContextType | undefined>(undefined);

export const useAddiction = () => {
  const context = useContext(AddictionContext);
  if (!context) {
    return {
      behavior: {
        clicks: 0,
        timeSpent: 0,
        pagesVisited: [],
        actionsCompleted: [],
        streak: 0,
        level: 1,
        xp: 0,
        credits: 1000,
        lastActive: new Date(),
        achievements: [],
        milestones: []
      },
      trackClick: () => {},
      trackPageVisit: () => {},
      trackAction: () => {},
      addCredits: () => {},
      deductCredits: () => false,
      addXP: () => {},
      notifications: [],
      clearNotification: () => {},
      isAddicted: false
    };
  }
  return context;
};

const encouragementMessages = [
  "You're on fire! Keep exploring!",
  "Amazing progress! You're becoming a funding master!",
  "Wow! You're unlocking so many opportunities!",
  "Incredible dedication! Success is coming your way!",
  "You're building an empire of opportunities!",
  "Outstanding! Every click brings you closer to funding!",
  "Brilliant! You're becoming unstoppable!",
  "Phenomenal work! The funding universe awaits you!",
  "Spectacular! You're on the path to greatness!",
  "Magnificent! Your persistence will pay off!"
];

const AddictionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [behavior, setBehavior] = useState<UserBehavior>(() => {
    const saved = localStorage.getItem('granada_behavior');
    return saved ? JSON.parse(saved) : {
      clicks: 0,
      timeSpent: 0,
      pagesVisited: [],
      actionsCompleted: [],
      streak: 1,
      level: 1,
      xp: 0,
      credits: 1000,
      lastActive: new Date(),
      achievements: [],
      milestones: []
    };
  });

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const sessionStartTime = useRef(Date.now());
  const lastClickTime = useRef(Date.now());

  // Save behavior to localStorage
  useEffect(() => {
    localStorage.setItem('granada_behavior', JSON.stringify(behavior));
  }, [behavior]);

  // Track session time
  useEffect(() => {
    const interval = setInterval(() => {
      setBehavior(prev => ({
        ...prev,
        timeSpent: prev.timeSpent + 1
      }));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Check for achievements and milestones
  useEffect(() => {
    checkAchievements();
    checkMilestones();
  }, [behavior.clicks, behavior.xp, behavior.level, behavior.timeSpent]);

  const addNotification = (notification: Omit<Notification, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newNotification = { ...notification, id };
    
    setNotifications(prev => [...prev, newNotification]);
    
    // Auto-remove after duration
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, notification.duration || 5000);
  };

  const trackClick = (action: string, element: string) => {
    const now = Date.now();
    const timeSinceLastClick = now - lastClickTime.current;
    
    setBehavior(prev => {
      const newClicks = prev.clicks + 1;
      let newXP = prev.xp;
      let newLevel = prev.level;
      
      // XP rewards based on click frequency and type
      if (timeSinceLastClick < 2000) {
        newXP += 5; // Fast clicking bonus
      } else {
        newXP += 2; // Regular XP
      }
      
      // Level up calculation
      const xpForNextLevel = newLevel * 100;
      if (newXP >= xpForNextLevel) {
        newLevel += 1;
        newXP = newXP - xpForNextLevel;
        
        addNotification({
          type: 'milestone',
          title: 'LEVEL UP!',
          message: `Congratulations! You've reached Level ${newLevel}!`,
          icon: <Crown className="w-6 h-6" />,
          duration: 8000,
          reward: { type: 'credits', amount: newLevel * 50 }
        });
      }
      
      // Random encouragement
      if (newClicks % 10 === 0) {
        const message = encouragementMessages[Math.floor(Math.random() * encouragementMessages.length)];
        addNotification({
          type: 'encouragement',
          title: 'Keep Going!',
          message,
          icon: <Fire className="w-6 h-6" />,
          duration: 4000
        });
      }
      
      // Special action rewards
      if (element.includes('opportunity') || element.includes('grant')) {
        newXP += 10;
        addNotification({
          type: 'reward',
          title: 'Opportunity Hunter!',
          message: 'Great choice! +10 XP for exploring opportunities!',
          icon: <Target className="w-6 h-6" />,
          reward: { type: 'xp', amount: 10 }
        });
      }
      
      return {
        ...prev,
        clicks: newClicks,
        xp: newXP,
        level: newLevel,
        lastActive: new Date(),
        actionsCompleted: [...prev.actionsCompleted, `${action}:${element}`]
      };
    });
    
    lastClickTime.current = now;
  };

  const trackPageVisit = (page: string) => {
    setBehavior(prev => {
      if (!prev.pagesVisited.includes(page)) {
        addNotification({
          type: 'achievement',
          title: 'Explorer!',
          message: `New area discovered: ${page}`,
          icon: <Sparkles className="w-6 h-6" />,
          reward: { type: 'xp', amount: 5 }
        });
        
        return {
          ...prev,
          pagesVisited: [...prev.pagesVisited, page],
          xp: prev.xp + 5
        };
      }
      return prev;
    });
  };

  const trackAction = (action: string) => {
    setBehavior(prev => ({
      ...prev,
      actionsCompleted: [...prev.actionsCompleted, action],
      lastActive: new Date()
    }));
    
    // Action-specific rewards
    if (action.includes('apply')) {
      addNotification({
        type: 'achievement',
        title: 'Action Taker!',
        message: 'Amazing! You\'re taking action towards funding!',
        icon: <TrendingUp className="w-6 h-6" />,
        reward: { type: 'credits', amount: 100 }
      });
    }
  };

  const addCredits = (amount: number, reason: string) => {
    setBehavior(prev => ({
      ...prev,
      credits: prev.credits + amount
    }));
    
    addNotification({
      type: 'credit',
      title: 'Credits Earned!',
      message: `+${amount} credits for ${reason}`,
      icon: <Gift className="w-6 h-6" />,
      reward: { type: 'credits', amount }
    });
  };

  const deductCredits = (amount: number, reason: string): boolean => {
    if (behavior.credits >= amount) {
      setBehavior(prev => ({
        ...prev,
        credits: prev.credits - amount
      }));
      
      addNotification({
        type: 'credit',
        title: 'Credits Used',
        message: `-${amount} credits for ${reason}`,
        icon: <Zap className="w-6 h-6" />
      });
      
      return true;
    }
    
    addNotification({
      type: 'credit',
      title: 'Insufficient Credits',
      message: 'You need more credits for this action!',
      icon: <Heart className="w-6 h-6" />
    });
    
    return false;
  };

  const addXP = (amount: number, reason: string) => {
    setBehavior(prev => {
      const newXP = prev.xp + amount;
      let newLevel = prev.level;
      
      const xpForNextLevel = newLevel * 100;
      if (newXP >= xpForNextLevel) {
        newLevel += 1;
      }
      
      return {
        ...prev,
        xp: newXP >= xpForNextLevel ? newXP - xpForNextLevel : newXP,
        level: newLevel
      };
    });
    
    addNotification({
      type: 'reward',
      title: 'XP Gained!',
      message: `+${amount} XP for ${reason}`,
      icon: <Star className="w-6 h-6" />,
      reward: { type: 'xp', amount }
    });
  };

  const checkAchievements = () => {
    const { clicks, xp, level, timeSpent, achievements } = behavior;
    
    const newAchievements = [];
    
    if (clicks >= 50 && !achievements.includes('click_master')) {
      newAchievements.push('click_master');
      addNotification({
        type: 'achievement',
        title: 'Click Master!',
        message: 'You\'ve made 50 clicks! You\'re getting addicted!',
        icon: <Trophy className="w-6 h-6" />,
        duration: 10000,
        reward: { type: 'credits', amount: 200 }
      });
    }
    
    if (timeSpent >= 300 && !achievements.includes('time_warrior')) { // 5 minutes
      newAchievements.push('time_warrior');
      addNotification({
        type: 'achievement',
        title: 'Time Warrior!',
        message: 'You\'ve spent 5 minutes exploring! Time flies when having fun!',
        icon: <Award className="w-6 h-6" />,
        duration: 10000,
        reward: { type: 'credits', amount: 300 }
      });
    }
    
    if (newAchievements.length > 0) {
      setBehavior(prev => ({
        ...prev,
        achievements: [...prev.achievements, ...newAchievements]
      }));
    }
  };

  const checkMilestones = () => {
    // Level milestones
    if (behavior.level >= 5 && !behavior.milestones.includes('level_5')) {
      setBehavior(prev => ({
        ...prev,
        milestones: [...prev.milestones, 'level_5']
      }));
      
      addNotification({
        type: 'milestone',
        title: 'MILESTONE REACHED!',
        message: 'Level 5! You\'re becoming a true funding expert!',
        icon: <Crown className="w-6 h-6" />,
        duration: 12000,
        reward: { type: 'credits', amount: 500 }
      });
    }
  };

  const clearNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const isAddicted = behavior.clicks > 20 || behavior.timeSpent > 180; // 3 minutes

  return (
    <AddictionContext.Provider value={{
      behavior,
      trackClick,
      trackPageVisit,
      trackAction,
      addCredits,
      deductCredits,
      addXP,
      notifications,
      clearNotification,
      isAddicted
    }}>
      {children}
      
      {/* Notification System */}
      <div className="fixed top-20 right-4 z-[9999] space-y-2 max-w-sm">
        <AnimatePresence>
          {notifications.map((notification) => (
            <motion.div
              key={notification.id}
              initial={{ opacity: 0, x: 300, scale: 0.8 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 300, scale: 0.8 }}
              className={`p-4 rounded-xl shadow-2xl backdrop-blur-xl border-2 cursor-pointer ${
                notification.type === 'achievement' ? 'bg-gradient-to-r from-yellow-500/90 to-orange-500/90 border-yellow-400' :
                notification.type === 'milestone' ? 'bg-gradient-to-r from-purple-500/90 to-pink-500/90 border-purple-400' :
                notification.type === 'reward' ? 'bg-gradient-to-r from-green-500/90 to-blue-500/90 border-green-400' :
                notification.type === 'credit' ? 'bg-gradient-to-r from-blue-500/90 to-cyan-500/90 border-blue-400' :
                notification.type === 'streak' ? 'bg-gradient-to-r from-red-500/90 to-orange-500/90 border-red-400' :
                'bg-gradient-to-r from-gray-500/90 to-gray-600/90 border-gray-400'
              }`}
              onClick={() => clearNotification(notification.id)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="flex items-start space-x-3">
                <div className="text-white flex-shrink-0">
                  {notification.icon}
                </div>
                <div className="flex-1 text-white">
                  <h3 className="font-bold text-sm mb-1">{notification.title}</h3>
                  <p className="text-xs opacity-90">{notification.message}</p>
                  {notification.reward && (
                    <div className="mt-2 text-xs font-semibold bg-white/20 rounded-full px-2 py-1 inline-block">
                      +{notification.reward.amount} {notification.reward.type.toUpperCase()}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </AddictionContext.Provider>
  );
};

export default AddictionProvider;