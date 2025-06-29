import React from 'react';

export default function TestPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 to-pink-600 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-xl">
        <h1 className="text-3xl font-bold text-purple-600 mb-4">🚀 Test Page Working!</h1>
        <p className="text-gray-700">This confirms that routing and components are working properly.</p>
        <div className="mt-4 space-y-2">
          <a href="/login" className="block text-blue-600 hover:underline">→ Go to Login Page</a>
          <a href="/register" className="block text-blue-600 hover:underline">→ Go to Register Page</a>
          <a href="/dashboard" className="block text-blue-600 hover:underline">→ Go to Dashboard</a>
        </div>
      </div>
    </div>
  );
}