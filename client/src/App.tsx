import React, { useEffect, useState } from 'react';
import { Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Header from './shared/Header';
import Sidebar from './shared/Sidebar';
import Dashboard from './Dashboard';
import DonorDashboard from './DonorDashboard';
import DonorDiscovery from './DonorDiscovery';
import ProposalManager from './ProposalManager';
import ProposalGenerator from './ProposalGenerator';
import ProjectManager from './ProjectManager';
import AIAssistant from './AIAssistant';
import Settings from './Settings';
import Funding from './Funding';
import Documents from './Documents';
import Analytics from './Analytics';
import CreditsPurchase from './CreditsPurchase';
import NGOPipeline from './NGOPipeline';

import MobileNavigation from './shared/MobileNavigation';

// Admin Redirect Component
const AdminRedirect = () => {
  React.useEffect(() => {
    window.location.href = 'http://localhost:9000/admin';
  }, []);

  return (
    <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <h2 className="text-2xl font-bold mb-2">Redirecting to Admin System...</h2>
        <p className="text-gray-400 mb-4">Enhanced interface with HR, Accounting & Submissions</p>
        <p className="text-sm text-gray-500">
          If you're not redirected automatically, 
          <a href="http://localhost:9000/admin" className="text-blue-400 hover:text-blue-300 ml-1">
            click here
          </a>
        </p>
      </div>
    </div>
  );
};
import LandingPage from './LandingPage';
import StudentDashboard from './StudentDashboard';
import HumanHelpPage from './HumanHelpPage';
import CreditsPage from './CreditsPage';
import PurchasePage from './PurchasePage';
import HumanHelpButton from './shared/HumanHelpButton';
import AdminLink from './shared/AdminLink';

import AddictionProvider from './contexts/AddictionContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Create a client outside of component to avoid recreation
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  
  // For development, bypass auth for admin panel
  const mockUser = { userType: 'admin' };
  const isAuthenticated = true;

  // Check if user is a student
  const isStudent = mockUser?.userType === 'student';

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <AddictionProvider>
            <div className="min-h-screen safari-fix" style={{ background: 'var(--theme-background)' }}>
              <Header />
              
              <div className="flex">
                <Sidebar 
                  collapsed={sidebarCollapsed} 
                  onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} 
                />
                
                <main className={`flex-1 transition-all duration-300 pt-16 ${
                  sidebarCollapsed ? 'ml-0 md:ml-16' : 'ml-0 md:ml-64'
                }`}>
                  <Routes>
                    <Route path="/" element={isStudent ? <StudentDashboard /> : <DonorDashboard />} />
                    <Route path="/dashboard" element={<DonorDashboard />} />
                    <Route path="/donor-dashboard" element={<DonorDashboard />} />
                    <Route path="/student" element={<StudentDashboard />} />
                    <Route path="/donor-discovery" element={<DonorDiscovery />} />
                    <Route path="/proposal-generator" element={<ProposalGenerator />} />
                    <Route path="/proposals" element={<ProposalManager />} />
                    <Route path="/projects" element={<ProjectManager />} />
                    <Route path="/ai-assistant" element={<AIAssistant />} />
                    <Route path="/human-help" element={<HumanHelpPage />} />
                    <Route path="/settings" element={<Settings />} />
                    <Route path="/funding" element={<Funding />} />
                    <Route path="/documents" element={<Documents />} />
                    <Route path="/analytics" element={<Analytics />} />
                    <Route path="/credits" element={<CreditsPage />} />
                    <Route path="/purchase/:packageId" element={<PurchasePage />} />
                    <Route path="/ngo-pipeline" element={<NGOPipeline />} />
                    <Route path="/admin" element={<AdminRedirect />} />
                  </Routes>
                </main>
              </div>
              
              {/* Mobile Navigation */}
              <MobileNavigation />
              
              {/* Human Help Button */}
              <HumanHelpButton />
            </div>
          </AddictionProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;