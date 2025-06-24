import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AdminBotPanelStandalone from './AdminBotPanelStandalone';

const AdminApp: React.FC = () => {
  return (
    <div className="min-h-screen">
      <Routes>
        <Route path="/admin/bots" element={<AdminBotPanelStandalone />} />
        <Route path="/admin" element={<Navigate to="/admin/bots" replace />} />
        <Route path="*" element={<Navigate to="/admin/bots" replace />} />
      </Routes>
    </div>
  );
};

export default AdminApp;