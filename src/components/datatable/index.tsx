'use client';

import { InboxIcon, PlusIcon } from 'lucide-react';
import { ArrowDownIcon, ArrowUpIcon } from 'lucide-react';
import React from 'react';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import { cn } from '@/lib/utils';

import TableSkeletons from '../skeletons/table-skeleton';
import { Button } from '../ui/button';
import { Checkbox } from '../ui/checkbox';
import TableFilters from './filters';
import Pagination from './pagination';
import SearchFilter from './search-filter';
import { DataTableProps } from './types';

const DataTable = (props: DataTableProps) => {
  const {
    title,
    onSearch,
    addButtonText,
    onAddClick,
    pagination,
    isLoading,
    sort,
    data,
    columns,
    selection,
    onClickRow,
    actions,
    filters,
  } = props;

  return (
    <div>
      <h1 className="font-bold text-2xl">{title}</h1>
      <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-5 sm:gap-2">
        <div className="flex-1 w-full sm:w-auto flex items-center gap-4">
          {onSearch && <SearchFilter onChange={onSearch} />}
        </div>
        <div className="flex gap-4 items-center w-full sm:w-auto">
          {filters && <TableFilters filters={filters} />}
          {addButtonText && (
            <Button className="h-9" onClick={onAddClick}>
              <PlusIcon /> {addButtonText}
            </Button>
          )}
        </div>
      </div>
      <div className="bg-card rounded-lg border mt-5 overflow-auto h-[calc(100svh-210px)] relative">
        {!data?.length && isLoading ? (
          <TableSkeletons />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                {selection && (
                  <TableHead style={{ width: '40px' }}>
                    <Checkbox
                      checked={selection.selected.length > 0}
                      isIndeterminate={selection.selected.length !== data.length}
                      onCheckedChange={() => {
                        selection.setSelected(
                          selection.selected.length !== data.length
                            ? data.map((item) => item.id)
                            : [],
                        );
                      }}
                    />
                  </TableHead>
                )}
                {columns.map((column) => (
                  <TableHead
                    style={{
                      ...(column.width && { width: column.width }),
                      ...(column.minWidth && { minWidth: column.minWidth }),
                      ...(column.maxWidth && { maxWidth: column.maxWidth }),
                      ...(column.align && { textAlign: column.align }),
                    }}
                    key={column.key}
                    onClick={() => {
                      if (column.sortable) {
                        if (sort?.key === column.key) {
                          sort?.onSort(
                            sort.order === 'asc' ? undefined : column.key,
                            sort.order === 'asc'
                              ? undefined
                              : sort.order === 'desc'
                                ? 'asc'
                                : 'desc',
                          );
                        } else {
                          sort?.onSort(column.key, 'desc');
                        }
                      }
                    }}
                    className={cn('whitespace-nowrap group', {
                      'cursor-pointer': column.sortable,
                    })}
                  >
                    <div className="flex items-center gap-1.5">
                      {column.title}
                      {column.sortable && sort && (
                        <div className="inline-flex items-center relative size-4">
                          <ArrowUpIcon
                            className={cn('size-3.5 opacity-0 invisible transition absolute', {
                              'visible opacity-100':
                                sort.key === column.key && sort.order === 'asc',
                            })}
                          />
                          <ArrowDownIcon
                            className={cn('size-3.5 opacity-0 transition invisible absolute', {
                              'visible opacity-100':
                                sort.key === column.key && sort.order === 'desc',
                              'group-hover:opacity-40 group-hover:visible': sort.key !== column.key,
                            })}
                          />
                        </div>
                      )}
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((row, index) => (
                <TableRow
                  key={index}
                  onClick={() => onClickRow?.(row)}
                  className={cn({ 'cursor-pointer': onClickRow })}
                >
                  {selection && (
                    <TableCell>
                      <Checkbox
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();

                          const isSelected = selection.selected.includes(row.id);
                          if (isSelected) {
                            selection.setSelected(selection.selected.filter((id) => id !== row.id));
                          } else {
                            selection.setSelected([...selection.selected, row.id]);
                          }
                        }}
                        checked={selection.selected.includes(row.id)}
                      />
                    </TableCell>
                  )}
                  {columns.map((column) => (
                    <TableCell
                      style={{
                        ...(column.width && { width: column.width }),
                        ...(column.minWidth && { minWidth: column.minWidth }),
                        ...(column.maxWidth && { maxWidth: column.maxWidth }),
                        ...(column.align && { textAlign: column.align }),
                      }}
                      key={column.key}
                    >
                      {column.render ? column.render(row[column.key], row) : row[column.key]}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
              {data.length === 0 && (
                <TableRow className="!bg-transparent">
                  <TableCell colSpan={columns.length + (selection ? 1 : 0)}>
                    <div className="flex items-center flex-col justify-center min-h-[calc(100svh-287px)]">
                      <InboxIcon className="h-12 w-12 text-zinc-400 dark:text-zinc-600 stroke-[1.3]" />
                      <p className="text-zinc-400 dark:text-zinc-600 mt-2 text-md font-medium">
                        No data found
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
        {selection && (
          <div
            className={cn(
              'absolute bottom-0 left-1/2 rounded-full min-w-[330px] -translate-x-1/2 opacity-0 transition-all invisible bg-card shadow-lg border border-border px-4 py-2 flex items-center justify-between',
              {
                'opacity-100 visible -translate-y-5': selection.selected.length > 0,
              },
            )}
          >
            <div className="flex items-center gap-2 mr-14">
              <p className="text-[13px]">
                <span>Selected</span> <strong>{selection.selected.length}</strong> <span>Rows</span>
              </p>
              <Button
                variant="outline"
                className="h-5 w-11 text-xs rounded-sm border-foreground/50"
                onClick={() => selection.setSelected([])}
              >
                Reset
              </Button>
            </div>
            <div className="flex items-center gap-2">
              {actions?.map((action, i) => (
                <Button
                  key={i}
                  className={cn('size-7 rounded-sm', action.className)}
                  onClick={action.onClick}
                  variant="outline"
                >
                  {action.label}
                </Button>
              ))}
            </div>
          </div>
        )}
      </div>
      <Pagination
        page={pagination.page}
        totalPages={pagination.totalPages}
        setPage={pagination.setPage}
        setLimit={pagination.setLimit}
        limit={pagination.limit}
      />
    </div>
  );
};

export default DataTable;
