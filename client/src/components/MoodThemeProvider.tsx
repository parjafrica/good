import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface MoodTheme {
  name: string;
  mood: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
    muted: string;
  };
  typography: {
    headingWeight: string;
    bodyWeight: string;
    lineHeight: string;
    letterSpacing: string;
  };
  spacing: {
    scale: number;
    density: string;
  };
  animations: {
    speed: string;
    style: string;
  };
  effects: {
    shadows: string;
    borders: string;
    gradients: boolean;
    glow: boolean;
  };
  accessibility: {
    contrast_ratio: number;
    reduced_motion: boolean;
    large_targets: boolean;
    high_contrast: boolean;
  };
  css_variables: Record<string, string>;
}

interface MoodContextType {
  currentMood: string;
  currentTheme: MoodTheme | null;
  isLoading: boolean;
  detectMood: (interactionData?: any) => void;
  setExplicitMood: (mood: string) => void;
  moodHistory: any[];
  trackInteraction: (interaction: any) => void;
}

const MoodThemeContext = createContext<MoodContextType | undefined>(undefined);

export const useMoodTheme = () => {
  const context = useContext(MoodThemeContext);
  if (!context) {
    throw new Error('useMoodTheme must be used within a MoodThemeProvider');
  }
  return context;
};

interface InteractionData {
  clicks_per_minute?: number;
  scroll_speed?: number;
  session_minutes?: number;
  errors?: number;
  page_views?: string[];
  time_spent?: Record<string, number>;
}

export const MoodThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  const [currentMood, setCurrentMood] = useState<string>('focused');
  const [interactionData, setInteractionData] = useState<InteractionData>({});
  const [recentActivities, setRecentActivities] = useState<string[]>([]);

  // Track user interactions
  const trackInteraction = (interaction: any) => {
    setInteractionData(prev => ({
      ...prev,
      ...interaction,
      clicks_per_minute: (prev.clicks_per_minute || 0) + 1,
      session_minutes: (prev.session_minutes || 0) + 0.1
    }));
    
    // Track recent activities
    if (interaction.activity) {
      setRecentActivities(prev => [
        interaction.activity,
        ...prev.slice(0, 9) // Keep last 10 activities
      ]);
    }
  };

  // Auto-detect mood periodically
  useEffect(() => {
    const interval = setInterval(() => {
      if (user && Object.keys(interactionData).length > 0) {
        detectMoodMutation.mutate();
      }
    }, 5 * 60 * 1000); // Every 5 minutes

    return () => clearInterval(interval);
  }, [user, interactionData]);

  // Get current time of day
  const getTimeOfDay = () => {
    const hour = new Date().getHours();
    if (hour < 6) return 'night';
    if (hour < 12) return 'morning';
    if (hour < 17) return 'afternoon';
    if (hour < 21) return 'evening';
    return 'night';
  };

  // Detect mood mutation
  const detectMoodMutation = useMutation({
    mutationFn: async (explicitMood?: string) => {
      const response = await fetch('/api/mood/detect-mood', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user?.id || 'demo-user',
          interaction_data: interactionData,
          time_of_day: getTimeOfDay(),
          recent_activities: recentActivities,
          explicit_mood: explicitMood
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to detect mood');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      setCurrentMood(data.mood);
      
      // Apply theme immediately
      if (data.theme) {
        applyThemeToDocument(data.theme);
      }
      
      // Invalidate mood history query
      queryClient.invalidateQueries({ queryKey: ['/api/mood/mood-history'] });
    },
    onError: (error) => {
      console.error('Mood detection failed:', error);
      // Fallback to time-based mood
      const timeBasedMood = getTimeBasedMood();
      setCurrentMood(timeBasedMood);
      getThemeByMood(timeBasedMood);
    }
  });

  // Get theme by mood
  const getThemeByMood = async (mood: string) => {
    try {
      const response = await fetch(`/api/mood/get-theme/${mood}?user_id=${user?.id || 'demo-user'}`);
      if (response.ok) {
        const data = await response.json();
        applyThemeToDocument(data.theme);
      }
    } catch (error) {
      console.error('Failed to get theme:', error);
    }
  };

  // Apply theme to document
  const applyThemeToDocument = (theme: MoodTheme) => {
    const root = document.documentElement;
    
    // Apply CSS variables
    Object.entries(theme.css_variables).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });
    
    // Apply additional theme properties
    root.style.setProperty('--font-weight-heading', theme.typography.headingWeight);
    root.style.setProperty('--font-weight-body', theme.typography.bodyWeight);
    root.style.setProperty('--line-height', theme.typography.lineHeight);
    root.style.setProperty('--letter-spacing', theme.typography.letterSpacing);
    
    // Apply spacing scale
    root.style.setProperty('--spacing-scale', theme.spacing.scale.toString());
    
    // Apply animation settings
    const animationSpeed = {
      'slow': '0.5s',
      'medium': '0.3s',
      'fast': '0.15s'
    }[theme.animations.speed] || '0.3s';
    
    root.style.setProperty('--animation-duration', animationSpeed);
    
    // Apply accessibility settings
    if (theme.accessibility.reduced_motion) {
      root.style.setProperty('--animation-duration', '0.01s');
    }
    
    // Store current theme
    localStorage.setItem('granada_current_theme', JSON.stringify(theme));
  };

  // Get time-based fallback mood
  const getTimeBasedMood = () => {
    const timeOfDay = getTimeOfDay();
    const timeBasedMoods = {
      'morning': 'energetic',
      'afternoon': 'focused',
      'evening': 'creative',
      'night': 'calm'
    };
    return timeBasedMoods[timeOfDay] || 'focused';
  };

  // Current theme query
  const { data: currentTheme, isLoading } = useQuery({
    queryKey: ['/api/mood/get-theme', currentMood],
    queryFn: async () => {
      const response = await fetch(`/api/mood/get-theme/${currentMood}?user_id=${user?.id || 'demo-user'}`);
      if (!response.ok) {
        throw new Error('Failed to fetch theme');
      }
      const data = await response.json();
      return data.theme;
    },
    enabled: !!currentMood,
    onSuccess: (theme) => {
      applyThemeToDocument(theme);
    }
  });

  // Mood history query
  const { data: moodHistory = [] } = useQuery({
    queryKey: ['/api/mood/mood-history', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const response = await fetch(`/api/mood/mood-history/${user.id}?days=7`);
      if (!response.ok) {
        throw new Error('Failed to fetch mood history');
      }
      const data = await response.json();
      return data.history || [];
    },
    enabled: !!user?.id
  });

  // Initialize with stored theme or detect mood
  useEffect(() => {
    const storedTheme = localStorage.getItem('granada_current_theme');
    if (storedTheme) {
      try {
        const theme = JSON.parse(storedTheme);
        applyThemeToDocument(theme);
        setCurrentMood(theme.mood);
      } catch (error) {
        console.error('Failed to parse stored theme:', error);
      }
    } else if (user) {
      // Auto-detect mood on first load
      setTimeout(() => {
        detectMoodMutation.mutate();
      }, 1000);
    }
  }, [user]);

  // Track page interactions
  useEffect(() => {
    const handleClick = () => {
      trackInteraction({ type: 'click' });
    };

    const handleScroll = () => {
      trackInteraction({ type: 'scroll' });
    };

    const handleKeydown = () => {
      trackInteraction({ type: 'keydown' });
    };

    document.addEventListener('click', handleClick);
    document.addEventListener('scroll', handleScroll);
    document.addEventListener('keydown', handleKeydown);

    return () => {
      document.removeEventListener('click', handleClick);
      document.removeEventListener('scroll', handleScroll);
      document.removeEventListener('keydown', handleKeydown);
    };
  }, []);

  const value: MoodContextType = {
    currentMood,
    currentTheme,
    isLoading,
    detectMood: (interactionData) => detectMoodMutation.mutate(),
    setExplicitMood: (mood) => detectMoodMutation.mutate(mood),
    moodHistory,
    trackInteraction
  };

  return (
    <MoodThemeContext.Provider value={value}>
      {children}
    </MoodThemeContext.Provider>
  );
};