'use client';

import { Loader } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { PasswordInput } from '@/components/ui/password-input';

import { useUpdatePassword } from '../_services/profile-hooks';

export function UpdatePasswordForm() {
  const { form, onSubmit, isPending } = useUpdatePassword();

  return (
    <div>
      <h2 className="text-lg font-semibold mb-5">Update Password</h2>
      <Form {...form}>
        <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
          <FormField
            control={form.control}
            name="currentPassword"
            isRequired
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel>Current Password</FormLabel>
                <FormControl>
                  <PasswordInput {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="newPassword"
            isRequired
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel>New Password</FormLabel>
                <FormControl>
                  <PasswordInput {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button
            disabled={isPending || !form.formState.isDirty}
            type="submit"
            className="min-w-[150px] h-10"
          >
            {isPending ? <Loader className="animate-spin" /> : 'Update Password'}
          </Button>
        </form>
      </Form>
    </div>
  );
}
