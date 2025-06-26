import React, { useEffect, useState } from 'react';
import { Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { IntelligentAssistantUI, AssistantFloatingButton } from './shared/IntelligentAssistantUI';
import { intelligentAssistant } from './services/intelligentAssistant';
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


import LandingPage from './LandingPage';
import StudentDashboard from './StudentDashboard';
import HumanHelpPage from './HumanHelpPage';
import CreditsPage from './CreditsPage';
import PurchasePage from './PurchasePage';
import OnboardPage from './OnboardPage';
import HumanHelpButton from './shared/HumanHelpButton';

import AddictionProvider from './contexts/AddictionContext';
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
  
  // Initialize intelligent assistant
  useEffect(() => {
    // Activate the intelligent assistant after component mounts
    intelligentAssistant.setActive(true);
    return () => {
      intelligentAssistant.setActive(false);
    };
  }, []);
  
  // For development, bypass auth and provide default user
  const mockUser = { 
    id: 'demo_user',
    userType: 'ngo', 
    email: 'demo@example.com',
    firstName: 'Demo',
    lastName: 'User',
    country: 'UG',
    sector: 'Health',
    organizationType: 'NGO'
  };
  const isAuthenticated = true;

  // Check if user is a student
  const isStudent = mockUser?.userType === 'student';

  return (
    <QueryClientProvider client={queryClient}>
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
                  <Route path="/credits-purchase/:packageId" element={<CreditsPurchase />} />
                  <Route path="/ngo-pipeline" element={<NGOPipeline />} />
                  {/* Admin route removed */}
                </Routes>
              </main>
            </div>
            
            {/* Mobile Navigation */}
            <MobileNavigation />
            
            {/* Human Help Button */}
            <HumanHelpButton />
            
            {/* Intelligent Assistant System */}
            <IntelligentAssistantUI />
            <AssistantFloatingButton />
          </div>
        </AddictionProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;