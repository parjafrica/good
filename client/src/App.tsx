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
import AdminDashboard from './AdminDashboard';
import MobileNavigation from './shared/MobileNavigation';
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
                    <Route path="/admin" element={
                      <div className="min-h-screen bg-gray-950 text-white">
                        <div className="p-8">
                          <div className="max-w-4xl mx-auto">
                            <div className="text-center mb-8">
                              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent mb-4">
                                Granada OS Admin System
                              </h1>
                              <p className="text-gray-400 text-lg">
                                Complete administrative interface with HR, Accounting, Submissions, and Analytics
                              </p>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                              <div className="bg-gray-900 rounded-xl p-6 border border-gray-800 hover:border-blue-500 transition-colors">
                                <div className="flex items-center space-x-3 mb-4">
                                  <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                                    <i className="fas fa-users text-xl text-white"></i>
                                  </div>
                                  <div>
                                    <h3 className="text-xl font-bold">User Management</h3>
                                    <p className="text-gray-400 text-sm">Manage users, roles & permissions</p>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="bg-gray-900 rounded-xl p-6 border border-gray-800 hover:border-green-500 transition-colors">
                                <div className="flex items-center space-x-3 mb-4">
                                  <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
                                    <i className="fas fa-file-alt text-xl text-white"></i>
                                  </div>
                                  <div>
                                    <h3 className="text-xl font-bold">Submissions</h3>
                                    <p className="text-gray-400 text-sm">Proposals, research & requests</p>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="bg-gray-900 rounded-xl p-6 border border-gray-800 hover:border-purple-500 transition-colors">
                                <div className="flex items-center space-x-3 mb-4">
                                  <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center">
                                    <i className="fas fa-users-cog text-xl text-white"></i>
                                  </div>
                                  <div>
                                    <h3 className="text-xl font-bold">Human Resources</h3>
                                    <p className="text-gray-400 text-sm">Staff, recruitment & performance</p>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="bg-gray-900 rounded-xl p-6 border border-gray-800 hover:border-emerald-500 transition-colors">
                                <div className="flex items-center space-x-3 mb-4">
                                  <div className="w-12 h-12 bg-emerald-500 rounded-lg flex items-center justify-center">
                                    <i className="fas fa-calculator text-xl text-white"></i>
                                  </div>
                                  <div>
                                    <h3 className="text-xl font-bold">Accounting</h3>
                                    <p className="text-gray-400 text-sm">Finance, budgets & grants</p>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="bg-gray-900 rounded-xl p-6 border border-gray-800 hover:border-yellow-500 transition-colors">
                                <div className="flex items-center space-x-3 mb-4">
                                  <div className="w-12 h-12 bg-yellow-500 rounded-lg flex items-center justify-center">
                                    <i className="fas fa-chart-bar text-xl text-white"></i>
                                  </div>
                                  <div>
                                    <h3 className="text-xl font-bold">Analytics</h3>
                                    <p className="text-gray-400 text-sm">Reports & insights</p>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="bg-gray-900 rounded-xl p-6 border border-gray-800 hover:border-red-500 transition-colors">
                                <div className="flex items-center space-x-3 mb-4">
                                  <div className="w-12 h-12 bg-red-500 rounded-lg flex items-center justify-center">
                                    <i className="fas fa-robot text-xl text-white"></i>
                                  </div>
                                  <div>
                                    <h3 className="text-xl font-bold">Bot Management</h3>
                                    <p className="text-gray-400 text-sm">Automation & scraping</p>
                                  </div>
                                </div>
                              </div>
                            </div>
                            
                            <div className="text-center">
                              <a href="http://localhost:9000/admin" target="_blank" rel="noopener noreferrer" 
                                 className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 text-lg font-semibold">
                                <i className="fas fa-external-link-alt mr-3"></i>
                                Open Admin Dashboard
                              </a>
                              <p className="text-gray-400 text-sm mt-4">
                                Complete admin system with enhanced graphics, animations, and comprehensive management tools
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    } />
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