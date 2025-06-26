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
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);

  // Save user to localStorage whenever it changes
  useEffect(() => {
    if (user) {
      localStorage.setItem('granada_user', JSON.stringify(user));
      setIsAuthenticated(true);
    } else {
      localStorage.removeItem('granada_user');
      setIsAuthenticated(false);
    }
  }, [user]);

  const login = async (email: string, password: string) => {
    // Mock login - in production this would call your API
    console.log('Login attempt:', email);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Determine user type based on email
    const userType = email.includes('student') ? 'student' : 
                     email.includes('ngo') ? 'ngo' : 
                     email.includes('business') ? 'business' : 'general';
    
    // Mock successful login
    const mockUser: User = {
      id: '1',
      email,
      fullName: email.includes('admin') ? 'Admin User' : 'John Doe',
      credits: 1247,
      isTrialUser: true,
      trialDaysRemaining: 14,
      is_superuser: email.includes('admin'), // Admin if email contains 'admin'
      userType: userType, // Add user type
      organization: {
        id: '1',
        name: 'Impact First Foundation',
        sector: 'Education',
        country: 'Global'
      }
    };
    
    setUser(mockUser);
    setIsAuthenticated(true);
  };

  const logout = () => {
    setUser(null);
    setCreditHistory([]);
    setIsAuthenticated(false);
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