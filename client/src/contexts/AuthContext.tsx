import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, CreditTransaction } from '../types/index';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  updateCredits: (amount: number) => void;
  deductCredits: (amount: number) => boolean;
  addCreditTransaction: (transaction: Omit<CreditTransaction, 'id' | 'userId' | 'timestamp'>) => void;
  getCreditHistory: () => CreditTransaction[];
  updateProfile: (updates: Partial<User>) => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    // Return default auth state instead of throwing error
    return {
      user: null,
      login: async () => {},
      logout: () => {},
      updateCredits: () => {},
      deductCredits: () => false,
      addCreditTransaction: () => {},
      getCreditHistory: () => [],
      updateProfile: () => {},
      isAuthenticated: false
    };
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    // Load user from localStorage or return default demo user
    const savedUser = localStorage.getItem('granada_user');
    if (savedUser) {
      return JSON.parse(savedUser);
    }
    
    // Return demo user for immediate functionality
    return {
      id: 'demo_user',
      email: 'demo@example.com',
      firstName: 'Demo',
      lastName: 'User',
      userType: 'ngo',
      country: 'UG',
      sector: 'Health',
      organizationType: 'NGO',
      credits: 1000,
      isActive: true,
      isBanned: false,
      createdAt: new Date(),
      lastLogin: new Date()
    };
  });

  const [creditHistory, setCreditHistory] = useState<CreditTransaction[]>([]);
  // Initialize isAuthenticated based on whether a user is loaded from localStorage
  // or if a demo user is set. This will be updated by checkAuthState.
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(!!user && user.id !== 'demo_user');

  const checkAuthState = async () => {
    try {
      const response = await fetch('/api/auth/user');
      if (response.ok) {
        const userData = await response.json();
        if (userData && userData.id) { // Check if userData is not null and has an id
          setUser(userData);
          setIsAuthenticated(true);
        } else {
          // If /api/auth/user returns no user but localStorage has one (e.g. demo user), clear it.
          // Or if the user was previously logged in but session expired.
          const storedUser = localStorage.getItem('granada_user');
          if (storedUser) {
            localStorage.removeItem('granada_user');
          }
          // Only set to null if not already the demo user or null
          if (user && user.id !== 'demo_user') setUser(null);
          setIsAuthenticated(false);
        }
      } else {
         // If response is not ok (e.g. 401), ensure user is logged out client-side
        const storedUser = localStorage.getItem('granada_user');
        if (storedUser) {
          localStorage.removeItem('granada_user');
        }
        if (user && user.id !== 'demo_user') setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Error checking auth state:', error);
      // In case of network error, etc., keep current local state but mark as not authenticated
      // unless it's the demo user which is always "authenticated" client-side initially.
      if (!user || user.id !== 'demo_user') {
        setIsAuthenticated(false);
      }
    }
  };

  useEffect(() => {
    // Check auth state when the component mounts,
    // unless it's the demo user which doesn't need server validation initially.
    if (!user || user.id !== 'demo_user') {
      checkAuthState();
    }
  }, []); // Empty dependency array means this runs once on mount

  // Save user to localStorage whenever it changes, unless it's the demo user being cleared.
  useEffect(() => {
    if (user && user.id !== 'demo_user') { // Don't persist demo user if it was default
      localStorage.setItem('granada_user', JSON.stringify(user));
    } else if (!user) { // If user becomes null (logout)
      localStorage.removeItem('granada_user');
    }
    // Update isAuthenticated based on user state, crucial after checkAuthState or login/logout
    // The demo user is considered authenticated for client-side purposes.
    setIsAuthenticated(!!user);
  }, [user]);

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Login failed');
      }

      const data = await response.json();
      setUser(data.user);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Login error in AuthContext:', error);
      setIsAuthenticated(false); // Ensure isAuthenticated is false on error
      throw error; // Re-throw to be caught by UI
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (error) {
      console.error('Logout error:', error);
      // Still proceed with client-side logout
    } finally {
      setUser(null);
      setCreditHistory([]);
      setIsAuthenticated(false);
      localStorage.removeItem('granada_user'); // Clear user from localStorage on logout
    }
  };

  const updateCredits = (amount: number) => {
    if (user) {
      const updatedUser = { ...user, credits: user.credits + amount };
      setUser(updatedUser);
      
      // Add transaction record
      addCreditTransaction({
        amount,
        type: amount > 0 ? 'purchase' : 'usage',
        description: amount > 0 ? `Purchased ${amount} credits` : `Used ${Math.abs(amount)} credits`
      });
    }
  };

  const deductCredits = (amount: number): boolean => {
    if (!user) return false;
    
    // If amount is negative, we're adding credits
    if (amount < 0) {
      const updatedUser = { ...user, credits: user.credits - amount }; // Subtract negative = add
      setUser(updatedUser);
      
      // Add transaction record
      addCreditTransaction({
        amount: -amount, // Convert to positive
        type: 'purchase',
        description: `Purchased ${-amount} credits`
      });
      
      return true;
    }
    
    // Otherwise we're deducting credits
    if (user.credits >= amount) {
      const updatedUser = { ...user, credits: user.credits - amount };
      setUser(updatedUser);
      
      // Add transaction record
      addCreditTransaction({
        amount: -amount, // Negative amount for deduction
        type: 'usage',
        description: `Used ${amount} credits`
      });
      
      return true;
    }
    
    return false;
  };

  const addCreditTransaction = (transaction: Omit<CreditTransaction, 'id' | 'userId' | 'timestamp'>) => {
    if (!user) return;
    
    const newTransaction: CreditTransaction = {
      id: Date.now().toString(),
      userId: user.id,
      timestamp: new Date(),
      ...transaction
    };
    
    setCreditHistory(prev => [newTransaction, ...prev]);
  };

  const getCreditHistory = (): CreditTransaction[] => {
    return creditHistory;
  };

  const updateProfile = (updates: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...updates });
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      logout, 
      updateCredits, 
      deductCredits, 
      addCreditTransaction,
      getCreditHistory,
      updateProfile,
      isAuthenticated
    }}>
      {children}
    </AuthContext.Provider>
  );
};