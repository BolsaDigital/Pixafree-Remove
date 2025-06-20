'use client';

import { UserRole } from '@prisma/client';
import { Loader } from 'lucide-react';
import React from 'react';

import { FormInputSkeletons } from '@/components/skeletons/form-skeletons';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';

import { cn, toCapitalize } from '@/lib/utils';

import { useUpdateUser } from '../_services/user-hooks';

const UpdateUserSkeleton = () => {
  return (
    <div className="grid gap-6">
      <FormInputSkeletons />
      <FormInputSkeletons />
      <FormInputSkeletons />
      <Skeleton className="w-20 h-5" />
      <div className="flex justify-end gap-4">
        <Skeleton className="w-20 h-10" />
        <Skeleton className="w-20 h-10" />
      </div>
    </div>
  );
};

const UpdateUserForm = ({ onClose, id }: { onClose: () => void; id: string }) => {
  const { form, onSubmit, isLoading, isPending } = useUpdateUser(id, onClose);

  return (
    <>
      {isLoading && <UpdateUserSkeleton />}
      <Form {...form}>
        <form
          onSubmit={onSubmit}
          className={cn('relative grid gap-5', {
            hidden: isLoading,
          })}
        >
          <FormField
            control={form.control}
            name="name"
            isRequired
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input disabled={isLoading} placeholder="Enter name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            isRequired
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input disabled={isLoading} placeholder="Enter email" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="role"
            isRequired
            render={({ field }) => (
              <FormItem>
                <FormLabel>Role</FormLabel>
                <FormControl>
                  <Select
                    className="capitalize"
                    disabled={isLoading}
                    value={field.value}
                    onChange={field.onChange}
                  >
                    {Object.values(UserRole).map((role) => (
                      <option key={role} value={role}>
                        {toCapitalize(role)}
                      </option>
                    ))}
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="emailVerified"
            isRequired
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center gap-2">
                  <FormControl>
                    <Switch
                      disabled={isLoading}
                      checked={field.value}
                      onCheckedChange={(e) => field.onChange(e)}
                    />
                  </FormControl>
                  <FormLabel>Email verified</FormLabel>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="mt-2 flex justify-end gap-3">
            <Button
              type="button"
              className="h-10"
              variant="ghost"
              disabled={isPending}
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button className="min-w-[120px] h-10" type="submit">
              {isPending ? <Loader className="animate-spin" /> : 'Update User'}
            </Button>
          </div>
        </form>
      </Form>
    </>
  );
};

const UpdateUserDialog = ({
  isOpen,
  onClose,
  id,
}: {
  isOpen: boolean;
  onClose: () => void;
  id: string;
}) => {
  return (
    <Dialog
      open={isOpen}
      onOpenChange={(e) => {
        if (!e) onClose();
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update User</DialogTitle>
          <DialogDescription>Update user details.</DialogDescription>
        </DialogHeader>
        <UpdateUserForm onClose={onClose} id={id} />
      </DialogContent>
    </Dialog>
  );
};

export default UpdateUserDialog;
