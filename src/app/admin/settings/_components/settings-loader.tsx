import React from 'react';

import { FormInputSkeletons } from '@/components/skeletons/form-skeletons';

const SettingsLoader = () => {
  return (
    <div className="space-y-6 w-full flex flex-col">
      <FormInputSkeletons />
      <hr />
      <FormInputSkeletons />
      <hr />
      <FormInputSkeletons />
      <hr />
      <FormInputSkeletons />
      <hr />
      <FormInputSkeletons />
    </div>
  );
};

export default SettingsLoader;
