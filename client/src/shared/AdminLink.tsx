import React from 'react';
import { Link } from 'react-router-dom';
import { Shield } from 'lucide-react';

const AdminLink: React.FC = () => {
  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Link
        to="/admin"
        className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg shadow-lg transition-colors group"
        title="Admin Dashboard"
      >
        <Shield className="w-5 h-5" />
        <span className="hidden group-hover:block">Admin</span>
      </Link>
    </div>
  );
};

export default AdminLink;