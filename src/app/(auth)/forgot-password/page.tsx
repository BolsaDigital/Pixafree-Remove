import settingServices from '@/server/settings/setting-services';
import { Metadata } from 'next';
import React, { cache } from 'react';

import ForgotPasswordForm from '../_components/forgot-password-form';

export async function generateMetadata(): Promise<Metadata> {
  const settings = await cache(settingServices.publicSettings)();

  return {
    title: `Forgot Password - ${settings?.general?.applicationName || ''}`,
  };
}

const ForgotPasswordPage = () => {
  return <ForgotPasswordForm />;
};

export default ForgotPasswordPage;
