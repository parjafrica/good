import React, { useEffect } from 'react';

const AdminDashboard = () => {
  useEffect(() => {
    // Redirect to new admin system
    window.location.href = 'http://localhost:9000/admin';
  }, []);

  return (
    <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <h2 className="text-2xl font-bold mb-2">Redirecting to Enhanced Admin System...</h2>
        <p className="text-gray-400 mb-4">HR, Accounting, Submissions & Advanced Features</p>
        <p className="text-sm text-gray-500">
          If you're not redirected automatically, 
          <a href="http://localhost:9000/admin" className="text-blue-400 hover:text-blue-300 ml-1">
            click here
          </a>
        </p>
      </div>
    </div>
  );
};

export default AdminDashboard;