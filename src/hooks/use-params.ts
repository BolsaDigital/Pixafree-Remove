'use client';

import { useState } from 'react';

export const useSearchParams = () => {
  const [searchParams, setSearchParams] = useState(() => {
    if (typeof window !== 'undefined') {
      return new URLSearchParams(window.location.search);
    }

    return new URLSearchParams();
  });

  const updateSearchParams = (params: Record<string, string>) => {
    const newSearchParams = new URLSearchParams(searchParams.toString());
    Object.entries(params).forEach(([key, value]) => {
      if (value) {
        newSearchParams.set(key, value);
      } else {
        newSearchParams.delete(key);
      }
    });
    setSearchParams(newSearchParams);
    const newUrl = `${window.location.pathname}?${newSearchParams.toString()}`;
    window.history.pushState({}, '', newUrl);
  };

  return { searchParams, updateSearchParams };
};
