'use client';

import AdminDashboard from '@/components/AdminDashboard';

export default function AdminPage() {
  return (
    <main className="relative min-h-screen pt-32 pb-20 z-10">
      <div className="max-w-7xl mx-auto px-6 relative">
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-4 text-white">Restaurant Administration</h1>
          <p className="text-gray-400">Manage your reservations and table assignments in real-time.</p>
        </div>
        
        <div className="relative z-10">
          <AdminDashboard />
        </div>
      </div>
    </main>
  );
}
