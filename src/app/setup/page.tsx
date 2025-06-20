import commonServices from '@/server/common/common-services';
import { redirect } from 'next/navigation';
import React from 'react';

import SetupForm from './setup-form';

export const metadata = {
  title: 'Setup',
  description: 'Setup your application',
};

const SetupPage = async () => {
  const isSetupComplete = await commonServices.checkSetup();

  if (isSetupComplete) {
    redirect('/'); // Redirect to the home page if setup is complete
  }

  return <SetupForm />;
};

export default SetupPage;
