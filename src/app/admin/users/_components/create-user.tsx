'use client';

import { UserRole } from '@prisma/client';
import { Loader } from 'lucide-react';
import React from 'react';

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
import { PasswordInput } from '@/components/ui/password-input';
import { Select } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';

import { toCapitalize } from '@/lib/utils';

import { useCreateUser } from '../_services/user-hooks';

const CreateUserForm = ({ onClose }: { onClose: () => void }) => {
  const { form, onSubmit, isLoading } = useCreateUser(onClose);

  return (
    <Form {...form}>
      <form onSubmit={onSubmit} className="relative grid gap-5">
        <FormField
          control={form.control}
          name="name"
          isRequired
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter name" {...field} />
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
                <Input placeholder="Enter email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          isRequired
          render={({ field }) => (
            <FormItem>
              <FormLabel>Passowrd</FormLabel>
              <FormControl>
                <PasswordInput placeholder="Enter password" {...field} />
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
                <Select value={field.value} className="capitalize" onChange={field.onChange}>
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
                  <Switch checked={field.value} onCheckedChange={(e) => field.onChange(e)} />
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
            disabled={isLoading}
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button className="min-w-[120px] h-10" type="submit">
            {isLoading ? <Loader className="animate-spin" /> : 'Create User'}
          </Button>
        </div>
      </form>
    </Form>
  );
};

const CreateUserDialog = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  return (
    <Dialog
      open={isOpen}
      onOpenChange={(e) => {
        if (!e) onClose();
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create User</DialogTitle>
          <DialogDescription>Create a new user by providing details below.</DialogDescription>
        </DialogHeader>
        <CreateUserForm onClose={onClose} />
      </DialogContent>
    </Dialog>
  );
};

export default CreateUserDialog;
