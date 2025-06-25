import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

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

interface DatabaseProposal {
  id: string;
  title: string;
  description: string;
  status: string;
  createdBy: string;
  createdAt: string;
}

const DatabaseAdminPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState('users');
  const [searchTerm, setSearchTerm] = useState('');
  const queryClient = useQueryClient();

  const { data: users = [], isLoading: usersLoading } = useQuery({
    queryKey: ['/api/admin/users'],
    refetchInterval: 3000,
  });

  const { data: proposals = [], isLoading: proposalsLoading } = useQuery({
    queryKey: ['/api/admin/proposals'],
    refetchInterval: 3000,
  });

  const { data: opportunities = [], isLoading: opportunitiesLoading } = useQuery({
    queryKey: ['/api/opportunities'],
    refetchInterval: 3000,
  });

  const { data: interactions = [] } = useQuery({
    queryKey: ['/api/admin/interactions'],
    refetchInterval: 2000,
  });

  const { data: stats = {} } = useQuery({
    queryKey: ['/api/admin/stats'],
    refetchInterval: 5000,
  });

  const banUser = useMutation({
    mutationFn: async (userId: string) => {
      const response = await fetch(`/api/admin/users/${userId}/ban`, {
        method: 'POST',
      });
      if (!response.ok) throw new Error('Ban failed');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/stats'] });
    },
  });

  const unbanUser = useMutation({
    mutationFn: async (userId: string) => {
      const response = await fetch(`/api/admin/users/${userId}/unban`, {
        method: 'POST',
      });
      if (!response.ok) throw new Error('Unban failed');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/stats'] });
    },
  });

  const updateCredits = useMutation({
    mutationFn: async ({ userId, credits }: { userId: string; credits: number }) => {
      const response = await fetch(`/api/admin/users/${userId}/credits`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credits }),
      });
      if (!response.ok) throw new Error('Credit update failed');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
    },
  });

  const deleteOpportunity = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/admin/opportunities/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Delete failed');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/opportunities'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/stats'] });
    },
  });

  const filteredUsers = users.filter((user: DatabaseUser) => 
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    `${user.firstName} ${user.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (usersLoading && proposalsLoading && opportunitiesLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Connecting to database...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Database Administration</h1>
              <p className="mt-1 text-sm text-gray-500">Live database management for Granada OS</p>
            </div>
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                <span>Database Connected</span>
              </div>
              <div>Users: <span className="font-semibold text-gray-900">{stats.totalUsers || users.length}</span></div>
              <div>Proposals: <span className="font-semibold text-gray-900">{stats.totalProposals || proposals.length}</span></div>
              <div>Opportunities: <span className="font-semibold text-gray-900">{stats.totalOpportunities || opportunities.length}</span></div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <nav className="flex space-x-8">
            {[
              { id: 'users', name: 'User Management', count: users.length },
              { id: 'proposals', name: 'Proposals', count: proposals.length },
              { id: 'opportunities', name: 'Opportunities', count: opportunities.length },
              { id: 'activity', name: 'Live Activity', count: interactions.length },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.name}
                {tab.count > 0 && (
                  <span className="ml-2 bg-gray-100 text-gray-900 py-0.5 px-2.5 rounded-full text-xs font-medium">
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        {activeTab === 'users' && (
          <div className="space-y-6">
            <div className="sm:flex sm:items-center">
              <div className="sm:flex-auto">
                <h2 className="text-xl font-semibold text-gray-900">Database Users</h2>
                <p className="mt-2 text-sm text-gray-700">
                  Direct access to user records in PostgreSQL database
                </p>
              </div>
              <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>
            </div>

            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              <ul className="divide-y divide-gray-200">
                {filteredUsers.map((user: DatabaseUser) => (
                  <li key={user.id}>
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-indigo-500 flex items-center justify-center">
                              <span className="text-sm font-medium text-white">
                                {(user.firstName?.[0] || user.email[0]).toUpperCase()}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="flex items-center">
                              <p className="text-sm font-medium text-gray-900">
                                {user.firstName} {user.lastName}
                              </p>
                              {user.isBanned && (
                                <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                  BANNED
                                </span>
                              )}
                              {!user.isActive && !user.isBanned && (
                                <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                  INACTIVE
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-500">{user.email}</p>
                            <p className="text-sm text-gray-500">
                              {user.organizationType} • {user.sector} • {user.country}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="text-right">
                            <p className="text-sm font-medium text-gray-900">
                              {user.credits?.toLocaleString() || 0} credits
                            </p>
                            <p className="text-sm text-gray-500">
                              {new Date(user.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <input
                              type="number"
                              defaultValue={user.credits}
                              className="w-20 rounded border-gray-300 text-sm"
                              onBlur={(e) => {
                                const newCredits = parseInt(e.target.value);
                                if (newCredits !== user.credits) {
                                  updateCredits.mutate({ userId: user.id, credits: newCredits });
                                }
                              }}
                            />
                            {user.isBanned ? (
                              <button
                                onClick={() => unbanUser.mutate(user.id)}
                                className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-green-700 bg-green-100 hover:bg-green-200"
                              >
                                Unban
                              </button>
                            ) : (
                              <button
                                onClick={() => banUser.mutate(user.id)}
                                className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200"
                              >
                                Ban
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {activeTab === 'proposals' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">Database Proposals ({proposals.length})</h2>
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              <ul className="divide-y divide-gray-200">
                {proposals.map((proposal: DatabaseProposal) => (
                  <li key={proposal.id}>
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{proposal.title}</p>
                          <p className="text-sm text-gray-500">{proposal.description}</p>
                          <p className="text-sm text-gray-500">Created by: {proposal.createdBy}</p>
                        </div>
                        <div className="text-right">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            proposal.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                            proposal.status === 'submitted' ? 'bg-blue-100 text-blue-800' :
                            proposal.status === 'approved' ? 'bg-green-100 text-green-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {proposal.status}
                          </span>
                          <p className="text-sm text-gray-500 mt-1">
                            {new Date(proposal.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {activeTab === 'opportunities' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">Database Opportunities ({opportunities.length})</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {opportunities.map((opportunity: any) => (
                <div key={opportunity.id} className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-green-500 rounded flex items-center justify-center">
                          <span className="text-white text-xs font-bold">$</span>
                        </div>
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">
                            {opportunity.title}
                          </dt>
                          <dd className="text-lg font-medium text-gray-900">
                            {opportunity.currency} {opportunity.amountMin?.toLocaleString()} - {opportunity.amountMax?.toLocaleString()}
                          </dd>
                          <dd className="text-sm text-gray-500">
                            {opportunity.sourceName} • {opportunity.country}
                          </dd>
                        </dl>
                      </div>
                    </div>
                    <div className="mt-4 flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {opportunity.isVerified && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Verified
                          </span>
                        )}
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          opportunity.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {opportunity.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <button
                        onClick={() => deleteOpportunity.mutate(opportunity.id)}
                        className="text-red-600 hover:text-red-900 text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'activity' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">Live Database Activity ({interactions.length})</h2>
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              <ul className="divide-y divide-gray-200">
                {interactions.slice(0, 100).map((interaction: any, index: number) => (
                  <li key={index}>
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{interaction.action_details}</p>
                            <p className="text-sm text-gray-500">User: {interaction.user_email || 'Anonymous'}</p>
                          </div>
                        </div>
                        <div className="text-sm text-gray-500">
                          {new Date(interaction.timestamp).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DatabaseAdminPanel;