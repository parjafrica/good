import React, { useState } from 'react';
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
  X,
  Plus,
  Edit,
  Trash2
} from 'lucide-react';

const SimpleAdminDashboard: React.FC = () => {
  const [activeView, setActiveView] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(true);

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
              <p className="text-2xl font-semibold text-gray-900">1,248</p>
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
              <p className="text-2xl font-semibold text-gray-900">42</p>
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
              <p className="text-2xl font-semibold text-gray-900">156</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <DollarSign className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Revenue</p>
              <p className="text-2xl font-semibold text-gray-900">$45,890</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3"></div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900">New user registration</p>
                  <p className="text-xs text-gray-500">john@example.com • 2 minutes ago</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3"></div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900">Proposal submitted</p>
                  <p className="text-xs text-gray-500">jane@ngo.org • 15 minutes ago</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 mr-3"></div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900">Expert review completed</p>
                  <p className="text-xs text-gray-500">system • 1 hour ago</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">System Status</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Database</span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Online
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Expert Engine</span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Active
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Bot System</span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  Running
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderHRManagement = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">HR Management</h2>
          <p className="text-gray-600">Employee management and organizational tools</p>
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center">
          <Plus className="h-4 w-4 mr-2" />
          Add Employee
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <UserCheck className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">24</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Total Employees</h3>
          <p className="text-gray-600">Active staff members</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <Building className="h-8 w-8 text-green-600" />
            <span className="text-2xl font-bold text-gray-900">6</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Departments</h3>
          <p className="text-gray-600">Organizational units</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <FileText className="h-8 w-8 text-purple-600" />
            <span className="text-2xl font-bold text-gray-900">12</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Open Positions</h3>
          <p className="text-gray-600">Recruiting now</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Employee Directory</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {[
            { name: 'John Smith', role: 'Project Manager', department: 'Operations', status: 'Active' },
            { name: 'Sarah Johnson', role: 'HR Specialist', department: 'Human Resources', status: 'Active' },
            { name: 'Mike Wilson', role: 'Developer', department: 'Technology', status: 'Active' },
            { name: 'Lisa Brown', role: 'Accountant', department: 'Finance', status: 'On Leave' },
          ].map((employee, index) => (
            <div key={index} className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-medium">{employee.name.charAt(0)}</span>
                  </div>
                  <div className="ml-4">
                    <h4 className="text-lg font-medium text-gray-900">{employee.name}</h4>
                    <p className="text-gray-600">{employee.role} • {employee.department}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    employee.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {employee.status}
                  </span>
                  <button className="text-gray-400 hover:text-gray-600">
                    <Edit className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderAccounting = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Accounting & Finance</h2>
          <p className="text-gray-600">Financial management and reporting</p>
        </div>
        <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center">
          <Plus className="h-4 w-4 mr-2" />
          New Transaction
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-green-600">$125,890</p>
              <p className="text-sm text-green-600">+12.5% from last month</p>
            </div>
            <DollarSign className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Expenses</p>
              <p className="text-2xl font-bold text-red-600">$45,450</p>
              <p className="text-sm text-red-600">+8.2% from last month</p>
            </div>
            <Calculator className="h-8 w-8 text-red-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Net Profit</p>
              <p className="text-2xl font-bold text-blue-600">$80,440</p>
              <p className="text-sm text-blue-600">+15.3% from last month</p>
            </div>
            <BarChart3 className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-orange-600">$18,920</p>
              <p className="text-sm text-orange-600">5 invoices pending</p>
            </div>
            <FileText className="h-8 w-8 text-orange-600" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Recent Transactions</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {[
            { type: 'Income', description: 'Client Payment - Project Alpha', amount: '+$15,000', date: '2025-06-25' },
            { type: 'Expense', description: 'Office Rent', amount: '-$3,500', date: '2025-06-24' },
            { type: 'Income', description: 'Grant Funding', amount: '+$25,000', date: '2025-06-23' },
            { type: 'Expense', description: 'Software Licenses', amount: '-$1,200', date: '2025-06-22' },
          ].map((transaction, index) => (
            <div key={index} className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-lg font-medium text-gray-900">{transaction.description}</p>
                  <p className="text-sm text-gray-500">{transaction.type} • {transaction.date}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`text-lg font-semibold ${
                    transaction.type === 'Income' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {transaction.amount}
                  </span>
                  <button className="text-gray-400 hover:text-gray-600">
                    <Edit className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeView) {
      case 'overview':
        return renderOverview();
      case 'hr':
        return renderHRManagement();
      case 'accounting':
        return renderAccounting();
      default:
        return (
          <div className="text-center py-12">
            <div className="mx-auto h-12 w-12 text-gray-400 mb-4">
              {navigationItems.find(item => item.id === activeView)?.icon && 
                React.createElement(navigationItems.find(item => item.id === activeView)?.icon!, { className: "h-12 w-12" })
              }
            </div>
            <h3 className="text-lg font-medium text-gray-900">
              {navigationItems.find(item => item.id === activeView)?.label}
            </h3>
            <p className="text-gray-500 mt-2">Feature in development</p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-16'} bg-white shadow-lg transition-all duration-300 flex flex-col`}>
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            {sidebarOpen && (
              <div>
                <h1 className="text-xl font-bold text-gray-900">Granada Admin</h1>
                <p className="text-sm text-gray-500">System Management</p>
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
              <span>System Online</span>
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
                <p className="text-sm text-gray-500">Granada OS Administration Panel</p>
              </div>
              <div className="flex items-center space-x-4">
                <Bell className="h-5 w-5 text-gray-400" />
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <span>Last updated: {new Date().toLocaleTimeString()}</span>
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

export default SimpleAdminDashboard;