import type { ScreenContext } from '../../shell/types';
import { StaywebScope } from './StaywebScope';
import { StaywebDashboard } from './StaywebDashboard';
import { AdminConfigPage, type ConfigTab } from './components/AdminConfigPage';
import { AdminSystemLogsPage } from './components/AdminSystemLogsPage';
import { AdminAPILogsPage } from './components/AdminAPILogsPage';
import { AdminDatabaseBrowser } from './components/AdminDatabaseBrowser';
import { AdminPerformancePage } from './components/AdminPerformancePage';
import { AdminSecurityPage } from './components/AdminSecurityPage';
import { AdminPropertiesPage } from './components/AdminPropertiesPage';
import { AdminCommunicationSettingsPage } from './components/AdminCommunicationSettingsPage';
import { OTAWebhookSimulator } from './components/OTAWebhookSimulator';
import { PlatformConfigDiagnostic } from './components/PlatformConfigDiagnostic';
import { PrototypeDemoPage } from './components/PrototypeDemoPage';
import { SystemSitemapPage } from './components/SystemSitemapPage';
import { NavigationGuidePage } from './components/NavigationGuidePage';
import { DesignSystemPage } from './components/DesignSystemPage';
import { AddRoomDemo } from './components/AddRoomDemo';
import { SchemaViewer } from './components/SchemaViewer';
import { ErrorBoundary } from './components/ErrorBoundary';
import { useState } from 'react';

// System Core (SuperAdminView) sections
const consoleScreen = (render: (ctx: ScreenContext) => React.ReactNode) =>
  (ctx: ScreenContext) => <StaywebScope variant="console">{render(ctx)}</StaywebScope>;

// Pages that ran inside Stayweb's property view
const propertyScreen = (render: (ctx: ScreenContext) => React.ReactNode) =>
  (ctx: ScreenContext) => <StaywebScope variant="property">{render(ctx)}</StaywebScope>;

function ConfigScreen({ initialTab }: { initialTab: ConfigTab }) {
  const [activeConfigTab, setActiveConfigTab] = useState<ConfigTab>(initialTab);
  return <AdminConfigPage activeTab={activeConfigTab} onTabChange={tab => setActiveConfigTab(tab)} />;
}

export const configTabs: ConfigTab[] = [
  'staff-roles', 'staff-depts', 'shift-types', 'permissions-map', 'pos-config', 'room-types',
  'amenities', 'manual-charges', 'id-types', 'genders', 'hk-config',
];

export const routes = {
  'dashboard': consoleScreen(ctx => <StaywebDashboard go={ctx.onNavigate} />),
  'properties': consoleScreen(() => <AdminPropertiesPage />),
  'communication': consoleScreen(() => <AdminCommunicationSettingsPage />),
  'ota-simulator': consoleScreen(() => <OTAWebhookSimulator />),
  'system-logs': consoleScreen(() => <AdminSystemLogsPage />),
  'api-logs': consoleScreen(() => <AdminAPILogsPage />),
  'database': consoleScreen(() => <AdminDatabaseBrowser />),
  'performance': consoleScreen(() => <AdminPerformancePage />),
  'security': consoleScreen(() => <AdminSecurityPage />),
  'config': consoleScreen(() => <ConfigScreen initialTab="staff-roles" />),
  ...Object.fromEntries(configTabs.map(tab => [
    `config-${tab}`, consoleScreen(() => <ConfigScreen initialTab={tab} />),
  ])),
  'config-diagnostic': propertyScreen(ctx => (
    <ErrorBoundary name="ConfigDiagnostic">
    {/* Property pages it links to are not in ConsoleWeb; unmapped paths stay put */}
    <PlatformConfigDiagnostic onBack={() => ctx.onNavigate('dashboard')} onNavigate={ctx.onNavigate} />
    </ErrorBoundary>
  )),
  // Dev pages
  'prototype-demo': propertyScreen(ctx => <PrototypeDemoPage onBack={() => ctx.onNavigate('dashboard')} />),
  'sitemap': propertyScreen(ctx => <SystemSitemapPage onBack={() => ctx.onNavigate('dashboard')} />),
  'navigation-guide': propertyScreen(ctx => <NavigationGuidePage onBack={() => ctx.onNavigate('dashboard')} />),
  'component-specs': propertyScreen(ctx => <DesignSystemPage onBack={() => ctx.onNavigate('dashboard')} />),
  'ui-kit': propertyScreen(ctx => <DesignSystemPage onBack={() => ctx.onNavigate('dashboard')} />),
  'demo': propertyScreen(ctx => <AddRoomDemo onClose={() => ctx.onNavigate('dashboard')} />),
  'schema': propertyScreen(() => <SchemaViewer />),
};
