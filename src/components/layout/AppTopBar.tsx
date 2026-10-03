import React, { useState, useRef, useEffect } from 'react';
import { Search, LogOut, Settings, HelpCircle, X, Menu } from 'lucide-react';
import type { AppPage } from './AppSidebar';
import { Breadcrumbs } from './Breadcrumbs';
import { useAuth } from '../../shell/auth/auth';
import { defaultRoute, settingsRoute } from '../../shell/nav';
import svgPaths from '../../imports/svg-k4fsktm66r';
import imgAvatar from "figma:asset/c89b9883696b2665a7b45df31e52fdcf283cb1d3.png";

interface AppTopBarProps {
  currentPage: AppPage;
  onNavigate: (page: AppPage) => void;
  onToggleSidebar?: () => void;
}

export function AppTopBar({ currentPage, onNavigate, onToggleSidebar }: AppTopBarProps) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const auth = useAuth();
  const displayName = auth.name ?? auth.email ?? '';
  const [notifOpen, setNotifOpen] = useState(false);
  const userRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handle = (e: MouseEvent) => {
      if (userRef.current && !userRef.current.contains(e.target as Node)) setUserMenuOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
    };
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, []);

  const notifications = [
    { id: '1', title: 'Certificate Issued', message: 'Contract_Agreement.pdf certified', time: '2m ago', read: false },
    { id: '2', title: 'Signing Complete', message: 'NDA_2026.pdf signed by all parties', time: '1h ago', read: false },
    { id: '3', title: 'Verification Scan', message: 'Product QR scanned in Mumbai', time: '3h ago', read: true },
  ];
  const unread = notifications.filter(n => !n.read).length;

  return (
    <header
      className="fixed top-0 left-0 right-0 h-[80px] z-50 flex items-center justify-between px-4 lg:px-10"
      style={{
        backgroundColor: 'var(--neutral-8)',
        borderBottom: '1px solid var(--neutral-3)',
      }}
    >
      {/* Left: Logo */}
      <div className="flex items-center gap-4">
        {/* Mobile hamburger */}
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            className="lg:hidden p-2 transition-opacity hover:opacity-70"
            style={{ color: 'var(--neutral-1)' }}
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
        <div
          className="h-[25px] w-[119px] shrink-0 cursor-pointer"
          onClick={() => onNavigate(defaultRoute)}
        >
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 119 25">
            <g>
              <path d={svgPaths.p350c8480} fill="var(--logo-grey)" />
              <path d={svgPaths.p15688a00} fill="var(--logo-grey)" />
              <path d={svgPaths.p2833d400} fill="var(--logo-grey)" />
              <path d={svgPaths.p242bd300} fill="white" />
              <path d={svgPaths.p5d30200} fill="white" />
              <path d={svgPaths.p2e634de0} fill="white" />
            </g>
          </svg>
        </div>

        {/* Breadcrumbs */}
        <Breadcrumbs currentPage={currentPage} onNavigate={onNavigate} />
      </div>

      {/* Center: Search (expandable) */}
      {searchOpen && (
        <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
              style={{ color: 'rgba(255,255,255,0.4)' }}
            />
            <input
              type="text"
              placeholder="Search credentials, documents, products..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-10 pr-3 py-1.5 rounded-lg w-80"
              style={{
                backgroundColor: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: 'white',
              }}
              autoFocus
            />
          </div>
          <button onClick={() => { setSearchOpen(false); setSearchQuery(''); }}>
            <X className="w-4 h-4" style={{ color: 'rgba(255,255,255,0.5)' }} />
          </button>
        </div>
      )}

      {/* Right: Actions */}
      <div className="flex items-center gap-4">
        {/* Search trigger */}
        {!searchOpen && (
          <button
            onClick={() => setSearchOpen(true)}
            className="p-2 rounded-lg transition-colors"
            style={{ color: 'rgba(255,255,255,0.6)' }}
          >
            <Search className="w-[18px] h-[18px]" />
          </button>
        )}

        {/* Notification bell — Figma-accurate */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setNotifOpen(!notifOpen)}
            className="relative rounded-xl w-9 h-9 flex items-center justify-center"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 20 20">
              <path
                d="M2.71833 12.7717C2.60947 12.891 2.53763 13.0394 2.51155 13.1988C2.48546 13.3582 2.50627 13.5217 2.57142 13.6695C2.63658 13.8173 2.74328 13.943 2.87855 14.0312C3.01381 14.1195 3.17182 14.1665 3.33333 14.1667H16.6667C16.8282 14.1667 16.9862 14.1199 17.1216 14.0318C17.2569 13.9437 17.3637 13.8181 17.4291 13.6704C17.4944 13.5227 17.5154 13.3592 17.4895 13.1998C17.4637 13.0404 17.392 12.892 17.2833 12.7725C16.175 11.63 15 10.4158 15 6.66667C15 5.34058 14.4732 4.06881 13.5355 3.13113C12.5979 2.19345 11.3261 1.66667 10 1.66667C8.67392 1.66667 7.40215 2.19345 6.46447 3.13113C5.52678 4.06881 5 5.34058 5 6.66667C5 10.4158 3.82417 11.63 2.71833 12.7717Z"
                stroke="white"
                strokeOpacity="0.8"
                strokeWidth="1.66667"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M8.55667 17.5C8.70295 17.7533 8.91335 17.9637 9.1667 18.11C9.42006 18.2563 9.70745 18.3333 10 18.3333C10.2925 18.3333 10.5799 18.2563 10.8333 18.11C11.0867 17.9637 11.297 17.7533 11.4433 17.5"
                stroke="white"
                strokeOpacity="0.8"
                strokeWidth="1.66667"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            {unread > 0 && (
              <div
                className="absolute rounded-full"
                style={{
                  width: '8px',
                  height: '8px',
                  backgroundColor: 'var(--destructive)',
                  border: '2px solid var(--neutral-8)',
                  top: '8px',
                  right: '6px',
                }}
              />
            )}
          </button>

          {/* Notification dropdown */}
          {notifOpen && (
            <div
              className="absolute right-0 top-full mt-2 w-80 rounded-lg overflow-hidden"
              style={{
                backgroundColor: 'var(--card)',
                boxShadow: '0 4px 24px rgba(0,0,0,0.15)',
                border: '1px solid var(--border)',
              }}
            >
              <div className="px-4 py-3 border-b" style={{ borderColor: 'var(--border)' }}>
                <h4 style={{ color: 'var(--foreground)', fontWeight: 'var(--font-weight-semibold)' }}>
                  Notifications
                </h4>
              </div>
              {notifications.map(n => (
                <div
                  key={n.id}
                  className="px-4 py-3 border-b cursor-pointer transition-colors"
                  style={{
                    borderColor: 'var(--border)',
                    backgroundColor: n.read ? 'transparent' : 'var(--muted)',
                  }}
                >
                  <div className="flex items-start justify-between">
                    <p style={{
                      color: 'var(--foreground)',
                      fontWeight: n.read ? 'var(--font-weight-regular)' : 'var(--font-weight-medium)',
                    }}>
                      {n.title}
                    </p>
                    {!n.read && (
                      <div
                        className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0"
                        style={{ backgroundColor: 'var(--primary)' }}
                      />
                    )}
                  </div>
                  <p style={{ color: 'var(--muted-foreground)' }}>{n.message}</p>
                  <span style={{ color: 'var(--muted-foreground)' }}>{n.time}</span>
                </div>
              ))}
              <div className="px-4 py-2.5 text-center">
                <button style={{ color: 'var(--foreground)', fontWeight: 'var(--font-weight-medium)' }}>
                  View all notifications
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Pill — Figma-accurate */}
        <div className="relative" ref={userRef}>
          <button
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="flex items-center gap-1.5 rounded-xl px-[7px] py-[4px]"
            style={{
              backgroundColor: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(0,0,0,0.1)',
            }}
          >
            {/* Avatar */}
            <div
              className="w-9 h-9 rounded-full overflow-hidden flex-shrink-0"
              style={{ backgroundColor: 'var(--neutral-2)' }}
            >
              <img
                src={imgAvatar}
                alt="User avatar"
                className="w-full h-full object-cover"
              />
            </div>
            {/* Name + role */}
            <div className="flex flex-col items-start justify-center h-10">
              <p
                className="whitespace-nowrap"
                style={{
                  color: 'white',
                  fontWeight: 'var(--font-weight-bold)',
                  lineHeight: '24px',
                }}
              >
                {displayName}
              </p>
              <p
                style={{
                  color: 'rgba(255,255,255,0.7)',
                  fontWeight: 'var(--font-weight-regular)',
                  lineHeight: '16px',
                }}
              >
                Platform owner
              </p>
            </div>
            {/* Chevron */}
            <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 14 14">
              <path
                d="M3.5 5.25L7 8.75L10.5 5.25"
                stroke="white"
                strokeOpacity="0.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.16667"
              />
            </svg>
          </button>

          {/* User dropdown */}
          {userMenuOpen && (
            <div
              className="absolute right-0 top-full mt-2 w-56 rounded-lg overflow-hidden"
              style={{
                backgroundColor: 'var(--card)',
                boxShadow: '0 4px 24px rgba(0,0,0,0.15)',
                border: '1px solid var(--border)',
              }}
            >
              <div className="px-4 py-3 border-b" style={{ borderColor: 'var(--border)' }}>
                <p style={{ color: 'var(--foreground)', fontWeight: 'var(--font-weight-medium)' }}>
                  {displayName}
                </p>
                <span style={{ color: 'var(--muted-foreground)' }}>{auth.email}</span>
              </div>
              {[
                { icon: Settings, label: 'Settings', page: settingsRoute as AppPage | null },
                { icon: HelpCircle, label: 'Help & Support', page: null },
              ].map((item, i) => {
                const Icon = item.icon;
                return (
                  <button
                    key={i}
                    onClick={() => {
                      if (item.page) onNavigate(item.page);
                      setUserMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-left transition-colors"
                    style={{ color: 'var(--foreground)' }}
                  >
                    <Icon className="w-4 h-4" style={{ color: 'var(--muted-foreground)' }} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
              <div className="border-t" style={{ borderColor: 'var(--border)' }}>
                <button
                  onClick={() => { setUserMenuOpen(false); auth.signOut(); }}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-left"
                  style={{ color: 'var(--destructive)' }}
                >
                  <LogOut className="w-4 h-4" />
                  <span>Log Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}