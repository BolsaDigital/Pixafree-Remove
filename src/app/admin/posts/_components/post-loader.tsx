import React from 'react';

import { FormInputSkeletons, FormTextareaSkeletons } from '@/components/skeletons/form-skeletons';

const PostLoader = () => {
  return (
    <div className="space-y-6">
      <FormInputSkeletons />
      <hr />
      <FormInputSkeletons />
      <hr />
      <FormTextareaSkeletons />
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

export default PostLoader;
