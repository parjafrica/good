import React, { useEffect, useState } from 'react';
import { Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Header from './components/shared/Header';
import Sidebar from './components/shared/Sidebar';
import Dashboard from './components/Dashboard';
import DonorDashboard from './components/DonorDashboard';
import DonorDiscovery from './components/DonorDiscovery';
import EnhancedProposalGenerator from './components/EnhancedProposalGenerator';
import ProposalManager from './components/ProposalManager';
import ProjectManager from './components/ProjectManager';
import AIAssistant from './components/AIAssistant';
import Settings from './components/Settings';
import Funding from './components/Funding';
import Documents from './components/Documents';
import Analytics from './components/Analytics';
import CreditsPurchase from './components/CreditsPurchase';
import NGOPipeline from './components/NGOPipeline';
import AdminDashboard from './components/AdminDashboard';
import AdminBotPanel from './components/AdminBotPanel';
import AdminProposalReviewPanel from './components/AdminProposalReviewPanel';
import MobileNavigation from './components/shared/MobileNavigation';
import LandingPage from './LandingPage';
import StudentDashboard from './components/StudentDashboard';
import HumanHelpPage from './pages/HumanHelpPage';
import CreditsPage from './pages/CreditsPage';
import PurchasePage from './pages/PurchasePage';
import HumanHelpButton from './components/shared/HumanHelpButton';

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
                    <Route path="/proposal-generator" element={<EnhancedProposalGenerator />} />
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
                    <Route path="/admin" element={<AdminDashboard />} />
                    <Route path="/admin/bots" element={<AdminBotPanel />} />
                    <Route path="/admin/proposals" element={<AdminProposalReviewPanel />} />
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