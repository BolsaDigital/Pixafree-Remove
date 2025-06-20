import React from 'react';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import { Skeleton } from '../ui/skeleton';

const TableSkeletons = () => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[100px]">
            <Skeleton className="w-24 h-4 rounded-sm" />
          </TableHead>
          <TableHead>
            <Skeleton className="w-24 h-4 rounded-sm" />
          </TableHead>
          <TableHead>
            <Skeleton className="w-24 h-4 rounded-sm" />
          </TableHead>
          <TableHead>
            <Skeleton className="w-24 h-4 rounded-sm" />
          </TableHead>
          <TableHead>
            <Skeleton className="w-24 h-4 rounded-sm" />
          </TableHead>
          <TableHead>
            <Skeleton className="w-24 h-4 rounded-sm" />
          </TableHead>
          <TableHead>
            <Skeleton className="w-24 h-4 rounded-sm" />
          </TableHead>
          <TableHead className="text-right">
            <Skeleton className="w-24 h-4 rounded-sm" />
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {Array.from({ length: 20 }).map((_, index) => (
          <TableRow key={index}>
            <TableCell>
              <Skeleton className="w-24 h-4 rounded-sm" />
            </TableCell>
            <TableCell>
              <Skeleton className="w-24 h-4 rounded-sm" />
            </TableCell>
            <TableCell>
              <Skeleton className="w-24 h-4 rounded-sm" />
            </TableCell>
            <TableCell>
              <Skeleton className="w-24 h-4 rounded-sm" />
            </TableCell>
            <TableCell>
              <Skeleton className="w-24 h-4 rounded-sm" />
            </TableCell>
            <TableCell>
              <Skeleton className="w-24 h-4 rounded-sm" />
            </TableCell>
            <TableCell>
              <Skeleton className="w-24 h-4 rounded-sm" />
            </TableCell>
            <TableCell className="text-right">
              <Skeleton className="w-24 h-4 rounded-sm" />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default TableSkeletons;
