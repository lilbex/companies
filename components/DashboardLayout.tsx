'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useCompany } from '@/lib/hooks';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [managerData, setManagerData] = useState<any>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { data: company } = useCompany();

  useEffect(() => {
    const data = localStorage.getItem('managerData');
    if (!data) {
      router.push('/login');
      return;
    }
    setManagerData(JSON.parse(data));
  }, [router]);

  const handleLogout = () => {
    api.clearToken();
    localStorage.removeItem('managerData');
    router.push('/login');
  };

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: '📊' },
    { name: 'Analytics', href: '/dashboard/analytics', icon: '📈' },
    { name: 'Live Tracking', href: '/dashboard/tracking', icon: '🗺️' },
    { name: 'Riders', href: '/dashboard/riders', icon: '👨‍💼' },
    { name: 'Deliveries', href: '/dashboard/deliveries', icon: '🚚' },
    { name: 'Vehicles', href: '/dashboard/vehicles', icon: '🏍️' },
    { name: 'Earnings', href: '/dashboard/earnings', icon: '💰' },
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        >
          <div className="absolute inset-0 bg-gray-600 opacity-75"></div>
        </div>
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        {/* Logo/Company */}
        <div className="flex items-center justify-between h-16 px-4 bg-green-600">
          <h1 className="text-xl font-bold text-white truncate">
            {company?.name || 'CityWheels'}
          </h1>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-white hover:text-gray-200"
          >
            ✕
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <button
                key={item.name}
                onClick={() => {
                  router.push(item.href);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                  isActive
                    ? 'bg-green-100 text-green-700 border-r-2 border-green-600'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                <span className="ml-3">{item.name}</span>
              </button>
            );
          })}
        </nav>

        {/* User Info & Logout */}
        <div className="px-4 py-4 border-t border-gray-200">
          <div className="flex items-center mb-3">
            <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-bold">
                {managerData?.name?.charAt(0) || 'M'}
              </span>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">
                {managerData?.name}
              </p>
              <p className="text-xs text-gray-500">Manager</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <span className="mr-3">🚪</span>
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden lg:ml-0">
        {/* Mobile header */}
        <div className="lg:hidden bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between px-4 py-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="text-gray-600 hover:text-gray-900"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <h1 className="text-lg font-semibold text-gray-900">
              {company?.name || 'CityWheels'}
            </h1>
            <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-bold">
                {managerData?.name?.charAt(0) || 'M'}
              </span>
            </div>
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}