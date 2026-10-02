import React, { useState } from 'react';
import { AppSidebar } from './AppSidebar';
import { AppTopBar } from './AppTopBar';
import type { AppPage } from './AppSidebar';

interface AppLayoutProps {
  currentPage: AppPage;
  onNavigate: (page: AppPage) => void;
  children: React.ReactNode;
}

export function AppLayout({ currentPage, onNavigate, children }: AppLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleNavigate = (page: AppPage) => {
    onNavigate(page);
    setSidebarOpen(false);
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--background)' }}>
      {/* Top bar */}
      <AppTopBar
        currentPage={currentPage}
        onNavigate={onNavigate}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
      />

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 lg:hidden"
          style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed left-0 z-40 transition-transform duration-200 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
        style={{
          width: '240px',
          top: '80px',
          height: 'calc(100vh - 80px)',
        }}
      >
        <AppSidebar currentPage={currentPage} onNavigate={handleNavigate} />
      </div>

      {/* Content — offset for sidebar on desktop only */}
      <main
        style={{ paddingTop: '80px' }}
        className="lg:ml-[240px]"
      >
        {children}
      </main>
    </div>
  );
}
