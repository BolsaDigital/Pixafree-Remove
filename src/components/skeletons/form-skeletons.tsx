import React from 'react';

import { Skeleton } from '../ui/skeleton';

export const FormInputSkeletons = () => {
  return (
    <div className="space-y-2 flex-1">
      <Skeleton className="w-24 h-4 rounded-sm" />
      <Skeleton className="w-full h-10" />
    </div>
  );
};

export const FormTextareaSkeletons = () => {
  return (
    <div className="space-y-2 flex-1">
      <Skeleton className="w-24 h-4 rounded-sm" />
      <Skeleton className="w-full h-16" />
    </div>
  );
};
