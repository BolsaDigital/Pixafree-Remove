import { JSX } from 'react';

type Column = {
  title: string;
  key: string;
  render?: (value: any, record: any) => JSX.Element;
  width?: number;
  maxWidth?: number;
  minWidth?: number;
  align?: 'left' | 'right' | 'center';
  sortable?: boolean;
};

type MultiSelectFilter = {
  type: 'multi-select';
  key: string;
  label: string;
  options: { label: string; value: string }[];
  value: string[];
  onFilter: (value: string[]) => void;
};

export type Filter = MultiSelectFilter;

export type DataTableProps = {
  title: string;
  onSearch?: (value: string) => void;
  addButtonText?: string;
  onAddClick?: () => void;
  selection?: {
    selected: string[];
    setSelected: (selected: string[]) => void;
  };
  pagination: {
    page: number;
    totalPages: number;
    setPage: (page: number) => void;
    setLimit: (limit: number) => void;
    limit: number;
  };
  filters?: Filter[];
  sort?: {
    key?: string;
    order?: 'asc' | 'desc';
    onSort: (key?: string, order?: 'asc' | 'desc') => void;
  };
  onClickRow?: (record: any) => void;
  isLoading?: boolean;
  columns: Column[];
  data: any[];
  actions?: {
    label: JSX.Element;
    className?: string;
    onClick: () => void;
  }[];
};
