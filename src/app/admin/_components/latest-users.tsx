'use client';

import { Loader } from 'lucide-react';
import React from 'react';
import Moment from 'react-moment';

import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/components/ui/table';

import { useUsersTable } from '../users/_services/user-hooks';

const LatestUsers = () => {
  const { data, isFetching } = useUsersTable(6);

  return (
    <div>
      <h2 className="font-semibold text-md">Latest Users</h2>
      <div className="bg-card rounded-lg border mt-3 overflow-auto min-h-[280px]">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-left">Name</TableHead>
              <TableHead className="text-left">Email</TableHead>
              <TableHead className="text-left">Role</TableHead>
              <TableHead className="text-left">Verified</TableHead>
              <TableHead className="text-left">Joined At</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isFetching ? (
              <TableRow>
                <TableCell colSpan={5}>
                  <div className="min-h-[280px] flex items-center justify-center">
                    <Loader className="animate-spin" />
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              data?.docs?.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge
                      variant={user.role === 'admin' ? 'success' : 'default'}
                      className="capitalize"
                    >
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.emailVerified ? 'success' : 'destructive'}>
                      {user.emailVerified ? 'Verified' : 'Not verified'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Moment format="DD/MM/YYYY" className="text-[13px]">
                      {user.createdAt}
                    </Moment>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default LatestUsers;
