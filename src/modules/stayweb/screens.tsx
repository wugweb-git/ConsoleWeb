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

const go = (navigate: ScreenContext['navigate']) => (route: string) => navigate(`modules/stayweb/${route}`);

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
  'dashboard': consoleScreen(ctx => <StaywebDashboard go={go(ctx.navigate)} />),
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
    {/* onNavigate targeted Stayweb property pages, which are not in ConsoleWeb */}
    <PlatformConfigDiagnostic onBack={() => go(ctx.navigate)('dashboard')} onNavigate={() => {}} />
    </ErrorBoundary>
  )),
  // Dev pages
  'prototype-demo': propertyScreen(ctx => <PrototypeDemoPage onBack={() => go(ctx.navigate)('dashboard')} />),
  'sitemap': propertyScreen(ctx => <SystemSitemapPage onBack={() => go(ctx.navigate)('dashboard')} />),
  'navigation-guide': propertyScreen(ctx => <NavigationGuidePage onBack={() => go(ctx.navigate)('dashboard')} />),
  'component-specs': propertyScreen(ctx => <DesignSystemPage onBack={() => go(ctx.navigate)('dashboard')} />),
  'ui-kit': propertyScreen(ctx => <DesignSystemPage onBack={() => go(ctx.navigate)('dashboard')} />),
  'demo': propertyScreen(ctx => <AddRoomDemo onClose={() => go(ctx.navigate)('dashboard')} />),
  'schema': propertyScreen(() => <SchemaViewer />),
};
