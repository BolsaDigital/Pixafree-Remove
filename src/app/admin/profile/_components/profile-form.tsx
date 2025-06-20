'use client';

import { UserResponse } from '@/server/auth/auth-services';
import { Loader } from 'lucide-react';
import React from 'react';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';

import { useProfile } from '../_services/profile-hooks';
import ChangeAvatar from './change-avatar';

export const ProfileForm = ({ initialUser }: { initialUser?: UserResponse }) => {
  const { user, form, onSubmit, isPending } = useProfile(initialUser);

  return (
    <Form {...form}>
      <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="avatar"
          isRequired
          render={({ field }) => (
            <FormItem className="flex-1">
              <FormControl>
                <ChangeAvatar
                  name={user?.name || ''}
                  avatar={user?.avatar || ''}
                  value={field.value}
                  onChange={(e) => field.onChange(e)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="name"
          isRequired
          render={({ field }) => (
            <FormItem className="flex-1">
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormItem className="flex-1">
          <FormLabel>Email</FormLabel>
          <Input disabled defaultValue={user?.email} readOnly />
        </FormItem>
        <Button
          disabled={isPending || !form.formState.isDirty}
          type="submit"
          className="min-w-[80px] h-10"
        >
          {isPending ? <Loader className="animate-spin" /> : 'Save'}
        </Button>
      </form>
    </Form>
  );
};
