import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const AuthenticAdminDashboard: React.FC = () => {
  const [activeView, setActiveView] = useState('users');
  const queryClient = useQueryClient();

  // Get real users from database
  const { data: users = [], isLoading: usersLoading } = useQuery({
    queryKey: ['/api/admin/users'],
    refetchInterval: 5000,
  });

  // Get real proposals from database
  const { data: proposals = [], isLoading: proposalsLoading } = useQuery({
    queryKey: ['/api/admin/proposals'],
    refetchInterval: 5000,
  });

  // Get real opportunities from database
  const { data: opportunities = [], isLoading: opportunitiesLoading } = useQuery({
    queryKey: ['/api/opportunities'],
    refetchInterval: 5000,
  });

  // Get real user interactions from database
  const { data: interactions = [], isLoading: interactionsLoading } = useQuery({
    queryKey: ['/api/admin/interactions'],
    refetchInterval: 2000,
  });

  // Get real credit transactions from database
  const { data: creditTransactions = [], isLoading: creditsLoading } = useQuery({
    queryKey: ['/api/admin/credits'],
    refetchInterval: 5000,
  });

  // Real database operations
  const banUser = useMutation({
    mutationFn: async (userId: string) => {
      const response = await fetch(`/api/admin/users/${userId}/ban`, {
        method: 'POST',
      });
      if (!response.ok) throw new Error('Failed to ban user');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
    },
  });

  const updateUserCredits = useMutation({
    mutationFn: async ({ userId, credits }: { userId: string; credits: number }) => {
      const response = await fetch(`/api/admin/users/${userId}/credits`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credits }),
      });
      if (!response.ok) throw new Error('Failed to update credits');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
    },
  });

  const deleteOpportunity = useMutation({
    mutationFn: async (opportunityId: string) => {
      const response = await fetch(`/api/admin/opportunities/${opportunityId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete opportunity');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/opportunities'] });
    },
  });

  if (usersLoading || proposalsLoading || opportunitiesLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading real data from database...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Clean header */}
      <div className="bg-white shadow-sm border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Granada OS Administration</h1>
            <p className="text-sm text-gray-600 mt-1">Database-driven system management</p>
          </div>
          <div className="flex items-center space-x-6 text-sm text-gray-600">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Live Data</span>
            </div>
            <div>Users: <span className="font-semibold">{users.length}</span></div>
            <div>Proposals: <span className="font-semibold">{proposals.length}</span></div>
            <div>Opportunities: <span className="font-semibold">{opportunities.length}</span></div>
          </div>
        </div>
      </div>

      {/* Professional navigation */}
      <div className="bg-white shadow-sm">
        <nav className="px-6">
          <div className="flex space-x-12">
            {[
              { id: 'users', label: 'User Management', count: users.length },
              { id: 'proposals', label: 'Proposal Review', count: proposals.length },
              { id: 'opportunities', label: 'Content Management', count: opportunities.length },
              { id: 'activity', label: 'Live Activity', count: interactions.length },
              { id: 'credits', label: 'Credit System', count: creditTransactions.length },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveView(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeView === tab.id
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                }`}
              >
                <span>{tab.label}</span>
                {tab.count > 0 && (
                  <span className="ml-2 bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </nav>
      </div>

      {/* Content */}
      <div className="p-6">
        {activeView === 'users' && (
          <div className="space-y-4">
            <h2 className="text-lg font-medium text-gray-900">Database Users ({users.length})</h2>
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              <ul className="divide-y divide-gray-200">
                {users.map((user: any) => (
                  <li key={user.id} className="px-6 py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center">
                            <span className="text-sm font-medium text-white">
                              {(user.firstName?.[0] || user.email[0]).toUpperCase()}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {user.firstName} {user.lastName} ({user.email})
                          </div>
                          <div className="text-sm text-gray-500">
                            {user.organizationType} • {user.sector} • {user.country}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-500">Credits: {user.credits || 0}</span>
                        {user.isBanned ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            Banned
                          </span>
                        ) : user.isActive ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            Inactive
                          </span>
                        )}
                        <button
                          onClick={() => banUser.mutate(user.id)}
                          className="text-red-600 hover:text-red-900 text-sm"
                        >
                          {user.isBanned ? 'Unban' : 'Ban'}
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {activeView === 'proposals' && (
          <div className="space-y-4">
            <h2 className="text-lg font-medium text-gray-900">Database Proposals ({proposals.length})</h2>
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              <ul className="divide-y divide-gray-200">
                {proposals.map((proposal: any) => (
                  <li key={proposal.id} className="px-6 py-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{proposal.title}</div>
                        <div className="text-sm text-gray-500">
                          {proposal.description} • Created by: {proposal.createdBy}
                        </div>
                        <div className="text-xs text-gray-400">
                          {new Date(proposal.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          proposal.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                          proposal.status === 'submitted' ? 'bg-blue-100 text-blue-800' :
                          proposal.status === 'approved' ? 'bg-green-100 text-green-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {proposal.status}
                        </span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {activeView === 'opportunities' && (
          <div className="space-y-4">
            <h2 className="text-lg font-medium text-gray-900">Database Opportunities ({opportunities.length})</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {opportunities.map((opportunity: any) => (
                <div key={opportunity.id} className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-blue-500 rounded flex items-center justify-center">
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

        {activeView === 'activity' && (
          <div className="space-y-4">
            <h2 className="text-lg font-medium text-gray-900">Real User Activity ({interactions.length})</h2>
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              <ul className="divide-y divide-gray-200">
                {interactions.slice(0, 50).map((interaction: any, index: number) => (
                  <li key={index} className="px-6 py-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{interaction.action_details}</div>
                        <div className="text-sm text-gray-500">User: {interaction.user_email || 'Anonymous'}</div>
                      </div>
                      <div className="text-xs text-gray-400">
                        {new Date(interaction.timestamp).toLocaleString()}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {activeView === 'credits' && (
          <div className="space-y-4">
            <h2 className="text-lg font-medium text-gray-900">Credit Transactions ({creditTransactions.length})</h2>
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              <ul className="divide-y divide-gray-200">
                {creditTransactions.map((transaction: any, index: number) => (
                  <li key={index} className="px-6 py-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {transaction.transaction_type}: {transaction.amount} credits
                        </div>
                        <div className="text-sm text-gray-500">User: {transaction.user_email}</div>
                      </div>
                      <div className="text-xs text-gray-400">
                        {new Date(transaction.timestamp).toLocaleString()}
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

export default AuthenticAdminDashboard;