import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import AdminDashboard from './components/admin/AdminDashboard';
import SecurityManager from './components/security/SecurityManager';

// Moved from ThinkWeb pages/AdminPortal.tsx (body only; ConsoleWeb provides the layout).
const AdminPortalScreen = () => {
  return (
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Admin Portal</h1>
          <p className="text-gray-600">Manage your workspace and system settings</p>
        </div>
        
        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <AdminDashboard />
          </TabsContent>

          <TabsContent value="security">
            <SecurityManager />
          </TabsContent>
        </Tabs>
      </div>
  );
};

export default AdminPortalScreen;
