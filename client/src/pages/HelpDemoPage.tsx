import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FaSearch, FaFilter, FaPlus, FaUser, FaCog, FaChartBar } from 'react-icons/fa';
import SmartHelpBubble from '@/components/SmartHelpBubble';
import { useHelp } from '@/contexts/HelpContext';

export default function HelpDemoPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [userProgress, setUserProgress] = useState(0);
  const { updateUserProgress, getUserSkillLevel } = useHelp();

  // Simulate user progress
  useEffect(() => {
    updateUserProgress({
      onboardingComplete: true,
      loginCount: 5,
      opportunitiesViewed: 12,
      proposalsCreated: 1,
      timeSpent: 15000
    });
  }, [updateUserProgress]);

  const demoTips = {
    dashboard: [
      {
        id: 'demo-welcome',
        title: 'Welcome to Smart Help!',
        content: 'This demo shows contextual help bubbles that adapt to your experience level and behavior.',
        type: 'success' as const,
        trigger: 'auto' as const,
        position: 'bottom' as const,
        delay: 2000,
        actions: [
          {
            label: 'Got it!',
            action: () => {},
            primary: true
          }
        ]
      }
    ],
    search: [
      {
        id: 'demo-search-tips',
        title: 'Smart Search Tips',
        content: 'Try keywords like "education", "health", or "climate" to find relevant funding opportunities.',
        type: 'tip' as const,
        trigger: 'focus' as const,
        position: 'bottom' as const,
        actions: [
          {
            label: 'Try Example',
            action: () => setSearchTerm('education'),
            primary: true
          }
        ]
      }
    ],
    filters: [
      {
        id: 'demo-filters',
        title: 'Advanced Filtering',
        content: 'Use filters to narrow down opportunities by amount, location, and deadline.',
        type: 'tip' as const,
        trigger: 'hover' as const,
        position: 'top' as const
      }
    ],
    createProposal: [
      {
        id: 'demo-proposal',
        title: 'AI-Powered Proposals',
        content: 'Our expert system helps create winning proposals with personalized guidance.',
        type: 'info' as const,
        trigger: 'click' as const,
        position: 'left' as const,
        actions: [
          {
            label: 'Learn More',
            action: () => window.open('/proposals', '_blank'),
            primary: true
          }
        ]
      }
    ],
    analytics: [
      {
        id: 'demo-analytics',
        title: 'Track Your Success',
        content: 'Monitor your application success rate and funding pipeline.',
        type: 'info' as const,
        trigger: 'hover' as const,
        position: 'right' as const
      }
    ]
  };

  const skillLevel = getUserSkillLevel();
  const progressPercentage = Math.min((userProgress / 100) * 100, 100);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Smart Help Bubbles Demo
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Experience contextual help that adapts to your skill level and provides assistance exactly when you need it.
          </p>
          
          {/* User Progress Indicator */}
          <div className="mt-6 bg-white rounded-lg p-4 inline-block shadow-sm">
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium text-gray-700">
                Skill Level: <span className="capitalize text-blue-600">{skillLevel}</span>
              </span>
              <div className="w-32 h-2 bg-gray-200 rounded-full">
                <div 
                  className="h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-300"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
              <span className="text-sm text-gray-500">{Math.round(progressPercentage)}%</span>
            </div>
          </div>
        </motion.div>

        {/* Demo Dashboard */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Search Section */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FaSearch className="text-blue-500" />
                  <span>Find Funding Opportunities</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex space-x-4">
                  <div className="flex-1 relative">
                    <Input
                      id="search-input"
                      placeholder="Search for funding opportunities..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pr-10"
                    />
                    <SmartHelpBubble
                      elementId="search-input"
                      tips={demoTips.search}
                      context="search"
                      userProgress={progressPercentage}
                    />
                  </div>
                  <div className="relative">
                    <Button id="filter-button" variant="outline">
                      <FaFilter className="mr-2" />
                      Filters
                    </Button>
                    <SmartHelpBubble
                      elementId="filter-button"
                      tips={demoTips.filters}
                      context="filters"
                      userProgress={progressPercentage}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Opportunities Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((item) => (
                <Card key={item} className="hover:shadow-lg transition-all duration-200">
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-2">
                      Sample Funding Opportunity {item}
                    </h3>
                    <p className="text-gray-600 text-sm mb-3">
                      This is a demonstration funding opportunity to show how help bubbles work.
                    </p>
                    <div className="flex justify-between items-center">
                      <span className="text-green-600 font-medium">$50,000</span>
                      <Button size="sm" variant="outline">
                        View Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="relative">
                  <Button
                    id="create-proposal-button"
                    className="w-full justify-start"
                    variant="outline"
                  >
                    <FaPlus className="mr-2" />
                    Create Proposal
                  </Button>
                  <SmartHelpBubble
                    elementId="create-proposal-button"
                    tips={demoTips.createProposal}
                    context="proposals"
                    userProgress={progressPercentage}
                  />
                </div>

                <Button className="w-full justify-start" variant="outline">
                  <FaUser className="mr-2" />
                  Update Profile
                </Button>

                <Button className="w-full justify-start" variant="outline">
                  <FaCog className="mr-2" />
                  Settings
                </Button>
              </CardContent>
            </Card>

            {/* Analytics Widget */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FaChartBar className="text-purple-500" />
                  <span>Your Analytics</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Applications</span>
                    <span className="font-semibold">12</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Success Rate</span>
                    <span className="font-semibold text-green-600">25%</span>
                  </div>
                  <div className="relative">
                    <Button
                      id="analytics-button"
                      className="w-full mt-4"
                      variant="outline"
                    >
                      View Detailed Analytics
                    </Button>
                    <SmartHelpBubble
                      elementId="analytics-button"
                      tips={demoTips.analytics}
                      context="analytics"
                      userProgress={progressPercentage}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Progress Tracker */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>Your Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>Profile Complete</span>
                    <span className="text-green-600">✓</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>First Application</span>
                    <span className="text-green-600">✓</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>5 Opportunities Viewed</span>
                    <span className="text-green-600">✓</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Expert Consultation</span>
                    <span className="text-gray-400">Pending</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Global Help Bubble - Auto shows welcome message */}
        <SmartHelpBubble
          tips={demoTips.dashboard}
          context="dashboard"
          userProgress={progressPercentage}
        />

        {/* Floating Help Button for Testing */}
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 3 }}
          className="fixed bottom-6 right-6 z-50"
        >
          <Button
            onClick={() => window.location.reload()}
            className="rounded-full w-14 h-14 bg-gradient-to-r from-blue-500 to-purple-500 shadow-lg hover:shadow-xl"
            title="Reload to see welcome bubble again"
          >
            <FaSearch className="w-5 h-5" />
          </Button>
        </motion.div>

        {/* Instructions */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-12 bg-white rounded-lg p-6 shadow-lg"
        >
          <h2 className="text-xl font-semibold mb-4">How to Test Smart Help Bubbles</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h3 className="font-medium text-blue-600 mb-2">Auto Triggers</h3>
              <ul className="space-y-1 text-gray-600">
                <li>• Welcome message appears automatically</li>
                <li>• Adaptive content based on skill level</li>
                <li>• Progress-aware suggestions</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium text-purple-600 mb-2">Interactive Triggers</h3>
              <ul className="space-y-1 text-gray-600">
                <li>• Click the search box for tips</li>
                <li>• Hover over filter button</li>
                <li>• Click "Create Proposal" for info</li>
                <li>• Hover analytics button</li>
              </ul>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}