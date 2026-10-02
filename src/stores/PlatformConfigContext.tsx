import React, { createContext, useContext, useState } from 'react';
import { defaultConfig } from './platformConfig';
import type { ConfigCategory, ConfigItem } from './platformConfig';
import { getConfigItems, getConfigItem, getStatusStyle, getStatusesByScope } from './platformConfig';

interface PlatformConfigContextValue {
  config: ConfigCategory[];
  setConfig: (config: ConfigCategory[]) => void;
  getItems: (categoryId: string) => ConfigItem[];
  getItem: (categoryId: string, value: string) => ConfigItem | undefined;
  getStatus: (categoryId: string, value: string) => { color: string; bgColor: string; label: string; icon?: string };
  getStatusesFor: (scope: string) => ConfigItem[];
}

const PlatformConfigContext = createContext<PlatformConfigContextValue | null>(null);

export function PlatformConfigProvider({ children }: { children: React.ReactNode }) {
  const [config, setConfig] = useState<ConfigCategory[]>(defaultConfig);

  const value: PlatformConfigContextValue = {
    config,
    setConfig,
    getItems: (categoryId: string) => getConfigItems(config, categoryId),
    getItem: (categoryId: string, val: string) => getConfigItem(config, categoryId, val),
    getStatus: (categoryId: string, val: string) => getStatusStyle(config, categoryId, val),
    getStatusesFor: (scope: string) => getStatusesByScope(config, scope),
  };

  return (
    <PlatformConfigContext.Provider value={value}>
      {children}
    </PlatformConfigContext.Provider>
  );
}

export function usePlatformConfig() {
  const ctx = useContext(PlatformConfigContext);
  if (!ctx) throw new Error('usePlatformConfig must be used within PlatformConfigProvider');
  return ctx;
}
