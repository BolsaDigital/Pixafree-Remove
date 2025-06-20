import settingServices from '@/server/settings/setting-services';
import { Metadata } from 'next';
import React, { cache } from 'react';

import SignupForm from '../_components/signup-form';

export async function generateMetadata(): Promise<Metadata> {
  const settings = await cache(settingServices.publicSettings)();

  return {
    title: `Signup - ${settings?.general?.applicationName || ''}`,
  };
}

const SignupPage = () => {
  return <SignupForm />;
};

export default SignupPage;
