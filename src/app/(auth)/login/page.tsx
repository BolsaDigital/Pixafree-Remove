import settingServices from '@/server/settings/setting-services';
import { Metadata } from 'next';
import React, { cache } from 'react';

import LoginForm from '../_components/login-form';

export async function generateMetadata(): Promise<Metadata> {
  const settings = await cache(settingServices.publicSettings)();

  return {
    title: `Login - ${settings?.general?.applicationName || ''}`,
  };
}

const LoginPage = () => {
  return <LoginForm />;
};

export default LoginPage;
