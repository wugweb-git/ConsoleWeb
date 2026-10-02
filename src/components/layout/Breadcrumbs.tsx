import React from 'react';
import { ChevronRight } from 'lucide-react';
import type { AppPage } from './AppSidebar';

interface BreadcrumbItem {
  label: string;
  page?: AppPage;
}

// Maps each page to its breadcrumb trail
const breadcrumbMap: Record<AppPage, BreadcrumbItem[]> = {
  'dashboard': [{ label: 'Dashboard' }],
  // Credentials
  'credentials': [{ label: 'Credentials', page: 'credentials' }],
  'credentials-issue': [{ label: 'Credentials', page: 'credentials' }, { label: 'Issue Credential' }],
  'credentials-schemas': [{ label: 'Credentials', page: 'credentials' }, { label: 'Schemas' }],
  'credentials-designer': [{ label: 'Credentials', page: 'credentials' }, { label: 'Template Designer' }],
  'credentials-detail': [{ label: 'Credentials', page: 'credentials' }, { label: 'Credential Detail' }],
  'credentials-revoked': [{ label: 'Credentials', page: 'credentials' }, { label: 'Revoked Credential' }],
  // Documents
  'documents': [{ label: 'Documents', page: 'documents' }],
  'documents-signing': [{ label: 'Documents', page: 'documents' }, { label: 'Signing' }],
  'documents-audit': [{ label: 'Documents', page: 'documents' }, { label: 'Audit Trail' }],
  // Products
  'products-digilabel': [{ label: 'Products' }, { label: 'DigiLabel' }],
  'products-warranty': [{ label: 'Products' }, { label: 'Warranty' }],
  'products-wallet': [{ label: 'Products' }, { label: 'My Products' }],
  'products-info': [{ label: 'Products' }, { label: 'Product Information' }],
  'products-warranty-confirm': [{ label: 'Products' }, { label: 'Warranty', page: 'products-warranty' }, { label: 'Confirmation' }],
  // Verification
  'verification': [{ label: 'Verification', page: 'verification' }],
  'verification-heatmap': [{ label: 'Verification', page: 'verification' }, { label: 'Scan Heatmap' }],
  'verification-trust-graph': [{ label: 'Verification', page: 'verification' }, { label: 'Trust Graph' }],
  // Modules
  'attestation': [{ label: 'Self-Attestation' }],
  'invoices': [{ label: 'Invoice Verification' }],
  'my-credentials': [{ label: 'My Credentials' }],
  // Developer
  'developer': [{ label: 'Developer Portal' }],
  // Analytics
  'analytics': [{ label: 'Analytics', page: 'analytics' }],
  'analytics-compliance': [{ label: 'Analytics', page: 'analytics' }, { label: 'Compliance' }],
  // Settings
  'settings': [{ label: 'Settings' }],
  // Activity & Notifications
  'activity-feed': [{ label: 'Activity Feed' }],
  'notifications': [{ label: 'Notifications' }],
  // Onboarding
  'onboarding': [{ label: 'Onboarding' }],
  // Admin
  'admin-config': [{ label: 'Admin' }, { label: 'Configuration' }],
  'admin-crud': [{ label: 'Admin' }, { label: 'CRUD Operations' }],
  'admin-database': [{ label: 'Admin' }, { label: 'Database' }],
  'admin-integrations': [{ label: 'Admin' }, { label: 'Integrations' }],
  'admin-schema': [{ label: 'Admin' }, { label: 'Schema Viewer' }],
  'admin-developer': [{ label: 'Admin' }, { label: 'Developer Portal' }],
  'admin-users': [{ label: 'Admin' }, { label: 'User Management' }],
  'admin-users-orgs': [{ label: 'Admin' }, { label: 'User Management', page: 'admin-users' }, { label: 'Organizations' }],
  'admin-users-teams': [{ label: 'Admin' }, { label: 'User Management', page: 'admin-users' }, { label: 'Teams' }],
  'admin-users-roles': [{ label: 'Admin' }, { label: 'User Management', page: 'admin-users' }, { label: 'Roles & Hierarchy' }],
  'admin-users-activity': [{ label: 'Admin' }, { label: 'User Management', page: 'admin-users' }, { label: 'Activity Log' }],
  'admin-invoices': [{ label: 'Admin' }, { label: 'Templates' }],
  'admin-stayweb-templates': [{ label: 'Admin' }, { label: 'Templates', page: 'admin-invoices' }, { label: 'StayWeb Hospitality' }],
  'admin-hr-letters': [{ label: 'Admin' }, { label: 'Templates', page: 'admin-invoices' }, { label: 'HR Letters' }],
};

interface BreadcrumbsProps {
  currentPage: AppPage;
  onNavigate: (page: AppPage) => void;
}

export function Breadcrumbs({ currentPage, onNavigate }: BreadcrumbsProps) {
  const trail = breadcrumbMap[currentPage] || [{ label: currentPage }];

  return (
    <nav className="flex items-center gap-1">
      {trail.map((crumb, i) => {
        const isLast = i === trail.length - 1;
        return (
          <span key={i} className="flex items-center gap-1">
            {i > 0 && (
              <ChevronRight
                className="w-3.5 h-3.5 flex-shrink-0"
                style={{ color: 'rgba(255,255,255,0.3)' }}
              />
            )}
            {crumb.page && !isLast ? (
              <button
                onClick={() => onNavigate(crumb.page!)}
                className="transition-opacity hover:opacity-100"
                style={{
                  color: 'rgba(255,255,255,0.5)',
                  fontWeight: 'var(--font-weight-regular)',
                }}
              >
                {crumb.label}
              </button>
            ) : (
              <span
                style={{
                  color: isLast ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.5)',
                  fontWeight: isLast ? 'var(--font-weight-medium)' : 'var(--font-weight-regular)',
                }}
              >
                {crumb.label}
              </span>
            )}
          </span>
        );
      })}
    </nav>
  );
}