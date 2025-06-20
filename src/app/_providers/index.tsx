'use client';

import NextTopLoader from 'nextjs-toploader';
import * as React from 'react';

import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';

import QueryProvider from './query-provider';
import SettingsProvider from './settings-provider';
import { ThemeProvider } from './theme-provider';

export function Providers({ children, settings }: { children: React.ReactNode; settings: any }) {
  return (
    <SettingsProvider settings={settings}>
      <ThemeProvider>
        <QueryProvider>
          <TooltipProvider>{children}</TooltipProvider>
        </QueryProvider>
        <Toaster />
        <NextTopLoader color="var(--primary)" height={2} showSpinner={false} />
      </ThemeProvider>
    </SettingsProvider>
  );
}
