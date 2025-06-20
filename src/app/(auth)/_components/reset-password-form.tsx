'use client';

import { Loader } from 'lucide-react';
import Link from 'next/link';

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

import { cn } from '@/lib/utils';

import { useResetPassword } from '../_services/auth-hooks';

const ResetPasswordForm = ({ className, ...props }: React.ComponentPropsWithoutRef<'form'>) => {
  const { form, onSubmit, isPending } = useResetPassword();

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={cn('flex flex-col gap-6', className)}
        {...props}
      >
        <div className="flex flex-col items-center gap-2 text-center">
          <h1 className="text-2xl font-bold">Reset password</h1>
          <p className="text-balance text-sm text-muted-foreground">
            Enter new password and confirm it to reset your password
          </p>
        </div>
        <div className="grid gap-6">
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <PasswordInput type="password" placeholder="Enter your password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirm Password</FormLabel>
                <FormControl>
                  <PasswordInput type="password" placeholder="Confirm your password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button disabled={isPending} type="submit" className="w-full h-10">
            {isPending ? <Loader className="animate-spin" /> : 'Reset password'}
          </Button>
        </div>
        <div className="text-center text-sm">
          <Link href="/login" className="font-medium text-primary hover:underline">
            Back to sign in
          </Link>
        </div>
      </form>
    </Form>
  );
};

export default ResetPasswordForm;
