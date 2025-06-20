'use client';

import type { PublicSettings } from '@/server/settings/setting-services';
import React from 'react';

const SettingsContext = React.createContext<PublicSettings | null>(null);

export function useSettings() {
  const context = React.useContext(SettingsContext);
  if (!context) {
    return {} as PublicSettings;
  }

  return context;
}

function SettingsProvider({
  children,
  settings,
}: {
  children: React.ReactNode;
  settings: PublicSettings | null;
}) {
  return <SettingsContext.Provider value={settings}>{children}</SettingsContext.Provider>;
}

export default SettingsProvider;
