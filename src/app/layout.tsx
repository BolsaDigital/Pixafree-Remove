import '@/assets/styles/globals.css';
import { fontGeist } from '@/config/fonts';
import settingServices from '@/server/settings/setting-services';
import { Metadata } from 'next';
import { cache } from 'react';

import { cn } from '@/lib/utils';

import { Providers } from './_providers';

export async function generateMetadata(): Promise<Metadata> {
  const settings = await cache(settingServices.publicSettings)();

  return {
    title: settings.general.siteTitle || '',
    description: settings.general.siteDescription || '',
    ...(settings.general.favicon && {
      icons: [
        {
          url: settings.general.favicon || '',
        },
      ],
    }),
    keywords: settings.general.siteKeywords || [],
    openGraph: {
      title: settings.general.siteTitle || '',
      description: settings.general.siteDescription || '',
      url: process.env.NEXT_PUBLIC_BASE_URL || '',
      siteName: settings.general.siteTitle || '',
      ...(settings.general.coverImage && {
        images: [
          {
            url: settings.general.coverImage || '',
            width: 1200,
            height: 630,
          },
        ],
      }),
    },
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const settings = await cache(settingServices.publicSettings)();

  return (
    <html suppressHydrationWarning lang="en">
      <head />
      <body suppressHydrationWarning className={cn('antialiased', fontGeist.variable)}>
        <Providers settings={settings}>{children}</Providers>
      </body>
    </html>
  );
}

export const dynamic = 'force-dynamic';
