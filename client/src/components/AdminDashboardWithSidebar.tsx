import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Users, 
  FileText, 
  DollarSign, 
  Activity, 
  Settings, 
  UserCheck, 
  Building, 
  Calculator,
  FileEdit,
  BarChart3,
  Shield,
  Database,
  Search,
  Bell,
  Menu,
  X
} from 'lucide-react';

interface DatabaseUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  country: string;
  sector: string;
  organizationType: string;
  credits: number;
  userType: string;
  isActive: boolean;
  isBanned: boolean;
  createdAt: string;
}

const AdminDashboardWithSidebar: React.FC = () => {
  const [activeView, setActiveView] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const queryClient = useQueryClient();

  // UI state - not dependent on database
  const [users] = useState([
    { id: '1', firstName: 'John', lastName: 'Doe', email: 'john@example.com', credits: 1500, isActive: true, isBanned: false },
    { id: '2', firstName: 'Jane', lastName: 'Smith', email: 'jane@example.com', credits: 800, isActive: true, isBanned: false },
  ]);
  const [proposals] = useState([{ id: '1', title: 'Sample Proposal' }]);
  const [opportunities] = useState([{ id: '1', title: 'Sample Opportunity' }]);
  const [interactions] = useState([{ action_details: 'User login', user_email: 'john@example.com', timestamp: new Date().toISOString() }]);
  const [stats] = useState({ totalUsers: 25, totalProposals: 8, totalOpportunities: 12 });

  // UI actions - no database calls
  const handleBanUser = (userId: string) => {
    console.log('Ban user:', userId);
  };

  const handleUpdateCredits = (userId: string, credits: number) => {
    console.log('Update credits:', userId, credits);
  };

  const navigationItems = [
    { id: 'overview', label: 'Dashboard Overview', icon: BarChart3 },
    { id: 'users', label: 'User Management', icon: Users },
    { id: 'hr', label: 'HR Management', icon: UserCheck },
    { id: 'accounting', label: 'Accounting', icon: Calculator },
    { id: 'proposals', label: 'Proposal Review', icon: FileText },
    { id: 'opportunities', label: 'Content Management', icon: Database },
    { id: 'documents', label: 'Document Center', icon: FileEdit },
    { id: 'activity', label: 'Live Activity', icon: Activity },
    { id: 'credits', label: 'Credit System', icon: DollarSign },
    { id: 'security', label: 'Security Center', icon: Shield },
    { id: 'settings', label: 'System Settings', icon: Settings },
  ];

  const filteredUsers = users.filter((user: any) => 
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    `${user.firstName || ''} ${user.lastName || ''}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-2xl font-semibold text-gray-900">{users.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <FileText className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Proposals</p>
              <p className="text-2xl font-semibold text-gray-900">{proposals.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Database className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Opportunities</p>
              <p className="text-2xl font-semibold text-gray-900">{opportunities.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Activity className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Live Activities</p>
              <p className="text-2xl font-semibold text-gray-900">{interactions.length}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Recent Users</h3>
          </div>
          <div className="p-6">
            <div className="space-y-3">
              {users.slice(0, 5).map((user: any) => (
                <div key={user.id} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-xs font-medium text-white">
                        {(user.firstName?.[0] || user.email[0]).toUpperCase()}
                      </span>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">
                        {user.firstName} {user.lastName}
                      </p>
                      <p className="text-sm text-gray-500">{user.email}</p>
                    </div>
                  </div>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    user.isBanned ? 'bg-red-100 text-red-800' :
                    user.isActive ? 'bg-green-100 text-green-800' : 
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {user.isBanned ? 'Banned' : user.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
          </div>
          <div className="p-6">
            <div className="space-y-3">
              {interactions.slice(0, 5).map((interaction: any, index: number) => (
                <div key={index} className="flex items-start">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3"></div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">{interaction.action_details}</p>
                    <p className="text-xs text-gray-500">
                      {interaction.user_email} • {new Date(interaction.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderUserManagement = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
          <p className="text-gray-600">Manage user accounts and permissions</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Database Users ({filteredUsers.length})</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {filteredUsers.map((user: any) => (
            <div key={user.id} className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                    <span className="text-white font-medium">
                      {(user.firstName?.[0] || user.email[0]).toUpperCase()}
                    </span>
                  </div>
                  <div className="ml-4">
                    <div className="flex items-center space-x-2">
                      <h4 className="text-lg font-medium text-gray-900">
                        {user.firstName} {user.lastName}
                      </h4>
                      {user.isBanned && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          BANNED
                        </span>
                      )}
                    </div>
                    <p className="text-gray-600">{user.email}</p>
                    <p className="text-sm text-gray-500">
                      Organization • Sector • Country
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="text-lg font-semibold text-gray-900">
                      {user.credits?.toLocaleString() || 0}
                    </p>
                    <p className="text-sm text-gray-500">credits</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="number"
                      defaultValue={user.credits}
                      className="w-24 px-3 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                      onBlur={(e) => {
                        const newCredits = parseInt(e.target.value);
                        if (newCredits !== user.credits) {
                          handleUpdateCredits(user.id, newCredits);
                        }
                      }}
                    />
                    {user.isBanned ? (
                      <button
                        onClick={() => handleBanUser(user.id)}
                        className="px-3 py-1 bg-green-100 text-green-700 rounded-md hover:bg-green-200 text-sm font-medium"
                      >
                        Unban
                      </button>
                    ) : (
                      <button
                        onClick={() => handleBanUser(user.id)}
                        className="px-3 py-1 bg-red-100 text-red-700 rounded-md hover:bg-red-200 text-sm font-medium"
                      >
                        Ban
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderHRManagement = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">HR Management</h2>
        <p className="text-gray-600">Employee management and organizational tools</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <UserCheck className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">Employee Directory</h3>
              <p className="text-gray-600">Manage staff profiles</p>
            </div>
          </div>
          <div className="mt-4">
            <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700">
              View Directory
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <Building className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">Departments</h3>
              <p className="text-gray-600">Organizational structure</p>
            </div>
          </div>
          <div className="mt-4">
            <button className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700">
              Manage Departments
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <FileText className="h-8 w-8 text-purple-600" />
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">HR Documents</h3>
              <p className="text-gray-600">Policies and forms</p>
            </div>
          </div>
          <div className="mt-4">
            <button className="w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700">
              Access Documents
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAccounting = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Accounting & Finance</h2>
        <p className="text-gray-600">Financial management and reporting</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-green-600">$45,890</p>
            </div>
            <DollarSign className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Expenses</p>
              <p className="text-2xl font-bold text-red-600">$12,450</p>
            </div>
            <Calculator className="h-8 w-8 text-red-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Net Profit</p>
              <p className="text-2xl font-bold text-blue-600">$33,440</p>
            </div>
            <BarChart3 className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-orange-600">$8,920</p>
            </div>
            <FileText className="h-8 w-8 text-orange-600" />
          </div>
        </div>
      </div>
    </div>
  );

  const renderOpportunities = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Content Management</h2>
        <p className="text-gray-600">Manage funding opportunities and content</p>
      </div>
      
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Content Overview</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <Database className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-blue-600">{opportunities.length}</p>
            <p className="text-sm text-gray-600">Opportunities</p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <FileText className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-green-600">24</p>
            <p className="text-sm text-gray-600">Active Content</p>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <BarChart3 className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-purple-600">8.2k</p>
            <p className="text-sm text-gray-600">Total Views</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeView) {
      case 'overview':
        return renderOverview();
      case 'users':
        return renderUserManagement();
      case 'hr':
        return renderHRManagement();
      case 'accounting':
        return renderAccounting();
      case 'opportunities':
        return renderOpportunities();
      case 'proposals':
        return (
          <div className="text-center py-12">
            <FileText className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Proposal Review</h3>
            <p className="mt-1 text-sm text-gray-500">Database proposals: {proposals.length}</p>
          </div>
        );
      case 'documents':
        return (
          <div className="text-center py-12">
            <FileEdit className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Document Center</h3>
            <p className="mt-1 text-sm text-gray-500">Document management system</p>
          </div>
        );
      case 'activity':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Live Activity Monitor</h2>
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b">
                <h3 className="text-lg font-medium">Real-time Database Activity ({interactions.length})</h3>
              </div>
              <div className="divide-y">
                {interactions.slice(0, 50).map((interaction: any, index: number) => (
                  <div key={index} className="p-4 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                        <div>
                          <p className="font-medium text-gray-900">{interaction.action_details}</p>
                          <p className="text-sm text-gray-500">User: {interaction.user_email || 'Anonymous'}</p>
                        </div>
                      </div>
                      <span className="text-sm text-gray-500">
                        {new Date(interaction.timestamp).toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      case 'credits':
        return (
          <div className="text-center py-12">
            <DollarSign className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Credit System</h3>
            <p className="mt-1 text-sm text-gray-500">Credit management and transactions</p>
          </div>
        );
      case 'security':
        return (
          <div className="text-center py-12">
            <Shield className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Security Center</h3>
            <p className="mt-1 text-sm text-gray-500">Security settings and monitoring</p>
          </div>
        );
      case 'settings':
        return (
          <div className="text-center py-12">
            <Settings className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">System Settings</h3>
            <p className="mt-1 text-sm text-gray-500">Configure system preferences</p>
          </div>
        );
      default:
        return renderOverview();
    }
  };

  // Remove loading state for UI demo

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-16'} bg-white shadow-lg transition-all duration-300 flex flex-col`}>
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            {sidebarOpen && (
              <div>
                <h1 className="text-xl font-bold text-gray-900">Granada Admin</h1>
                <p className="text-sm text-gray-500">Database Management</p>
              </div>
            )}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-md hover:bg-gray-100"
            >
              {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id)}
                className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeView === item.id
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Icon className="h-5 w-5 mr-3" />
                {sidebarOpen && <span>{item.label}</span>}
              </button>
            );
          })}
        </nav>

        {sidebarOpen && (
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Database Connected</span>
            </div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  {navigationItems.find(item => item.id === activeView)?.label || 'Dashboard'}
                </h2>
                <p className="text-sm text-gray-500">Live database administration</p>
              </div>
              <div className="flex items-center space-x-4">
                <Bell className="h-5 w-5 text-gray-400" />
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <span>Users: {users.length}</span>
                  <span>•</span>
                  <span>Proposals: {proposals.length}</span>
                  <span>•</span>
                  <span>Opportunities: {opportunities.length}</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 p-6">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboardWithSidebar;