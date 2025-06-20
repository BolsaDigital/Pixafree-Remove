import { SearchIcon } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { useDebounce } from 'use-debounce';

import { Input } from '../ui/input';

const SearchFilter = ({
  onChange,
  debounceTime = 500,
}: {
  onChange: (value: string) => void;
  debounceTime?: number;
}) => {
  const [value, setValue] = useState('');
  const [debouncedValue] = useDebounce(value, debounceTime);

  useEffect(() => {
    onChange(debouncedValue);
  }, [debouncedValue]);

  return (
    <div className="flex items-center relative w-full max-w-[350px]">
      <SearchIcon className="size-4 text-muted-foreground/70 absolute left-3" />
      <span className="sr-only">Search</span>
      <Input
        type="search"
        placeholder="Search..."
        className="pl-9 h-9"
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
    </div>
  );
};

export default SearchFilter;
