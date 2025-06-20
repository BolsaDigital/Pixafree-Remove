'use client';

import { useEffect, useState } from 'react';

export const useMedia = (query: string) => {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia(query);
    setMatches(mediaQuery.matches);

    const handleMatch = (e: MediaQueryListEvent) => setMatches(e.matches);

    mediaQuery.addEventListener('change', handleMatch);

    return () => mediaQuery.removeEventListener('change', handleMatch);
  }, [query]);

  return matches;
};
