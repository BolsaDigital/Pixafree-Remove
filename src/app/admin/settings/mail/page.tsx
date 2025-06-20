import settingServices from '@/server/settings/setting-services';
import { Metadata } from 'next';
import React, { cache } from 'react';

import MailSettings from '../_components/mail-settings';

export async function generateMetadata(): Promise<Metadata> {
  const settings = await cache(settingServices.publicSettings)();

  return {
    title: `Settings - Mail - ${settings?.general.applicationName || ''}`,
  };
}

function MailSettingsPage() {
  return <MailSettings />;
}

export default MailSettingsPage;
