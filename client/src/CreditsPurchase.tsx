import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  CreditCard, 
  Gem, 
  Star, 
  CheckCircle, 
  Zap,
  Gift,
  TrendingUp,
  Shield,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface CreditPackage {
  id: string;
  credits: number;
  price: number;
  popular?: boolean;
  bonus?: number;
  features: string[];
  savings?: string;
  originalPrice?: number;
}

const CreditsPurchase: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);

  // Fetch user's current credit balance
  const { data: userCredits = 0 } = useQuery({
    queryKey: ['/api/user/credits'],
    refetchInterval: 10000, // Refresh every 10 seconds
  });

  // Fetch credit transaction history
  const { data: transactions = [] } = useQuery({
    queryKey: ['/api/user/credit-transactions'],
  });

  // Purchase credits mutation
  const purchaseMutation = useMutation({
    mutationFn: async (packageId: string) => {
      const response = await fetch('/api/credits/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ packageId, userId: user?.id }),
      });
      if (!response.ok) throw new Error('Purchase failed');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user/credits'] });
      queryClient.invalidateQueries({ queryKey: ['/api/user/credit-transactions'] });
    },
  });

  const creditPackages: CreditPackage[] = [
    {
      id: 'starter',
      credits: 100,
      price: 10,
      features: [
        '5 Expert Proposal Reviews',
        '20 Research Queries',
        'Basic Support',
        '30-day validity'
      ]
    },
    {
      id: 'professional',
      credits: 300,
      price: 25,
      popular: true,
      bonus: 50,
      originalPrice: 30,
      savings: '17% OFF',
      features: [
        '15 Expert Proposal Reviews',
        '75 Research Queries', 
        'Priority Support',
        'Advanced Analytics',
        '90-day validity',
        'Bonus 50 credits'
      ]
    },
    {
      id: 'enterprise',
      credits: 750,
      price: 50,
      bonus: 150,
      originalPrice: 75,
      savings: '33% OFF',
      features: [
        '40 Expert Proposal Reviews',
        '200 Research Queries',
        'Dedicated Support',
        'Advanced Analytics',
        'Priority Processing',
        '1-year validity',
        'Bonus 150 credits'
      ]
    },
    {
      id: 'unlimited',
      credits: 2000,
      price: 100,
      bonus: 500,
      originalPrice: 200,
      savings: '50% OFF',
      features: [
        'Unlimited Expert Reviews',
        'Unlimited Research',
        '24/7 Premium Support',
        'Advanced Analytics',
        'Priority Processing',
        'Lifetime validity',
        'Bonus 500 credits'
      ]
    }
  ];

  const handlePurchase = (packageId: string) => {
    setSelectedPackage(packageId);
    purchaseMutation.mutate(packageId);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="p-6">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-900/30 text-blue-300 rounded-full text-sm font-medium mb-4"
            >
              <Gem className="w-4 h-4" />
              Credits Balance: {userCredits.toLocaleString()}
            </motion.div>
            <h1 className="text-4xl font-bold text-white mb-4">Choose Your Credit Package</h1>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Unlock the full potential of expert-driven proposal creation and research
            </p>
          </div>

          {/* Pricing Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {creditPackages.map((pkg) => (
              <motion.div
                key={pkg.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.02 }}
                className={`relative bg-gray-800 rounded-2xl p-6 border transition-all ${
                  pkg.popular 
                    ? 'border-blue-500 shadow-lg shadow-blue-500/20' 
                    : 'border-gray-700 hover:border-gray-600'
                }`}
              >
                {pkg.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <div className="bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                      Most Popular
                    </div>
                  </div>
                )}

                {pkg.savings && (
                  <div className="absolute -top-2 -right-2">
                    <div className="bg-green-600 text-white px-3 py-1 rounded-full text-xs font-bold">
                      {pkg.savings}
                    </div>
                  </div>
                )}

                <div className="text-center mb-6">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Gem className="w-6 h-6 text-blue-400" />
                    <span className="text-2xl font-bold text-white">
                      {pkg.credits.toLocaleString()}
                    </span>
                    {pkg.bonus && (
                      <span className="text-green-400 text-sm">
                        +{pkg.bonus}
                      </span>
                    )}
                  </div>
                  <div className="mb-4">
                    {pkg.originalPrice && (
                      <span className="text-gray-500 line-through text-lg mr-2">
                        ${pkg.originalPrice}
                      </span>
                    )}
                    <span className="text-3xl font-bold text-white">${pkg.price}</span>
                  </div>
                </div>

                <ul className="space-y-3 mb-6">
                  {pkg.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm text-gray-300">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handlePurchase(pkg.id)}
                  disabled={purchaseMutation.isPending && selectedPackage === pkg.id}
                  className={`w-full py-3 rounded-xl font-medium transition-all ${
                    pkg.popular
                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
                      : 'bg-gray-700 hover:bg-gray-600 text-white'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {purchaseMutation.isPending && selectedPackage === pkg.id ? (
                    'Processing...'
                  ) : (
                    'Purchase Credits'
                  )}
                </motion.button>
              </motion.div>
            ))}
          </div>

          {/* Features Section */}
          <div className="bg-gray-800 rounded-2xl p-8 border border-gray-700">
            <h2 className="text-2xl font-bold text-white text-center mb-8">What You Get With Credits</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Expert Proposal Reviews</h3>
                <p className="text-gray-400">Get your proposals reviewed by certified grant writing experts</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Advanced Research</h3>
                <p className="text-gray-400">Access comprehensive funding databases and market intelligence</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Priority Support</h3>
                <p className="text-gray-400">Get faster response times and dedicated assistance</p>
              </div>
            </div>
          </div>

          {/* Transaction History */}
          <div className="bg-gray-800 rounded-2xl border border-gray-700 overflow-hidden">
            <div className="p-6 border-b border-gray-700">
              <h2 className="text-xl font-bold text-white">Transaction History</h2>
            </div>
            <div className="divide-y divide-gray-700">
              {transactions.length === 0 ? (
                <div className="p-8 text-center">
                  <CreditCard className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400">No transactions yet</p>
                </div>
              ) : (
                transactions.map((transaction: any, index: number) => (
                  <div key={index} className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${
                        transaction.type === 'purchase' ? 'bg-green-500' : 'bg-red-500'
                      }`} />
                      <div>
                        <p className="text-white font-medium">{transaction.description}</p>
                        <p className="text-gray-400 text-sm">{formatDate(transaction.createdAt)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-medium ${
                        transaction.type === 'purchase' ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {transaction.type === 'purchase' ? '+' : '-'}{transaction.amount}
                      </p>
                      <p className="text-gray-400 text-sm">{transaction.credits} credits</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreditsPurchase;