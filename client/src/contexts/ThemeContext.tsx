import React, { createContext, useContext, useState, useEffect } from 'react';

export type Theme = 'dark' | 'light' | 'auto' | 'blue' | 'purple' | 'green' | 'orange';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  isDark: boolean;
  themeColors: ThemeColors;
}

interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  border: string;
  success: string;
  warning: string;
  error: string;
}

const themeConfigs: Record<Theme, ThemeColors> = {
  dark: {
    primary: '#3b82f6',
    secondary: '#1e40af',
    accent: '#8b5cf6',
    background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)',
    surface: 'rgba(51, 65, 85, 0.5)',
    text: '#ffffff',
    textSecondary: '#cbd5e1',
    border: 'rgba(71, 85, 105, 0.5)',
    success: '#22c55e',
    warning: '#f59e0b',
    error: '#ef4444'
  },
  light: {
    primary: '#2563eb',
    secondary: '#1d4ed8',
    accent: '#7c3aed',
    background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #f1f5f9 100%)', // Default to light
    surface: 'rgba(255, 255, 255, 0.8)', // Default to light
    text: '#1e293b', // Default to light
    textSecondary: '#64748b', // Default to light
    border: 'rgba(203, 213, 225, 0.5)', // Default to light
    success: '#16a34a',
    warning: '#d97706',
    error: '#dc2626'
  },
  auto: {
    primary: '#3b82f6',
    secondary: '#1e40af',
    accent: '#8b5cf6',
    background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #f1f5f9 100%)',
    surface: 'rgba(255, 255, 255, 0.8)',
    text: '#1e293b',
    textSecondary: '#64748b',
    border: 'rgba(203, 213, 225, 0.5)',
    success: '#22c55e',
    warning: '#f59e0b',
    error: '#ef4444'
  },
  blue: {
    primary: '#0ea5e9',
    secondary: '#0284c7',
    accent: '#38bdf8',
    background: 'linear-gradient(135deg, #0c4a6e 0%, #075985 50%, #0369a1 100%)',
    surface: 'rgba(14, 165, 233, 0.1)',
    text: '#ffffff',
    textSecondary: '#bae6fd',
    border: 'rgba(56, 189, 248, 0.3)',
    success: '#22c55e',
    warning: '#f59e0b',
    error: '#ef4444'
  },
  purple: {
    primary: '#8b5cf6',
    secondary: '#7c3aed',
    accent: '#a78bfa',
    background: 'linear-gradient(135deg, #581c87 0%, #6b21a8 50%, #7c2d12 100%)',
    surface: 'rgba(139, 92, 246, 0.1)',
    text: '#ffffff',
    textSecondary: '#ddd6fe',
    border: 'rgba(167, 139, 250, 0.3)',
    success: '#22c55e',
    warning: '#f59e0b',
    error: '#ef4444'
  },
  green: {
    primary: '#22c55e',
    secondary: '#16a34a',
    accent: '#4ade80',
    background: 'linear-gradient(135deg, #14532d 0%, #166534 50%, #15803d 100%)',
    surface: 'rgba(34, 197, 94, 0.1)',
    text: '#ffffff',
    textSecondary: '#bbf7d0',
    border: 'rgba(74, 222, 128, 0.3)',
    success: '#22c55e',
    warning: '#f59e0b',
    error: '#ef4444'
  },
  orange: {
    primary: '#f97316',
    secondary: '#ea580c',
    accent: '#fb923c',
    background: 'linear-gradient(135deg, #9a3412 0%, #c2410c 50%, #ea580c 100%)',
    surface: 'rgba(249, 115, 22, 0.1)',
    text: '#ffffff',
    textSecondary: '#fed7aa',
    border: 'rgba(251, 146, 60, 0.3)',
    success: '#22c55e',
    warning: '#f59e0b',
    error: '#ef4444'
  }
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>(() => {
    try {
      const saved = localStorage.getItem('granada_theme');
      return (saved as Theme) || 'light';
    } catch {
      return 'light';
    }
  });

  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem('granada_theme', theme);
    } catch {
      // Ignore localStorage errors
    }
    
    // Determine if theme should be dark
    if (theme === 'auto') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setIsDark(prefersDark);
    } else {
      setIsDark(theme !== 'light');
    }

    // Apply theme to document
    applyThemeToDocument(theme);
  }, [theme]);

  const applyThemeToDocument = (selectedTheme: Theme) => {
    const colors = themeConfigs[selectedTheme];
    const root = document.documentElement;

    // Apply CSS custom properties
    root.style.setProperty('--theme-primary', colors.primary);
    root.style.setProperty('--theme-secondary', colors.secondary);
    root.style.setProperty('--theme-accent', colors.accent);
    root.style.setProperty('--theme-background', colors.background);
    root.style.setProperty('--theme-surface', colors.surface);
    root.style.setProperty('--theme-text', colors.text);
    root.style.setProperty('--theme-text-secondary', colors.textSecondary);
    root.style.setProperty('--theme-border', colors.border);
    root.style.setProperty('--theme-success', colors.success);
    root.style.setProperty('--theme-warning', colors.warning);
    root.style.setProperty('--theme-error', colors.error);

    // Apply background to body
    document.body.style.background = colors.background;
    
    // Set data-theme attribute for CSS selectors
    document.documentElement.setAttribute('data-theme', selectedTheme);
  };

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  const themeColors = themeConfigs[theme];

  return (
    <ThemeContext.Provider value={{ theme, setTheme, isDark, themeColors }}>
      {children}
    </ThemeContext.Provider>
  );
};