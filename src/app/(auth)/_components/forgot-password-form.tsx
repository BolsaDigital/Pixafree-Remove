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
import { Input } from '@/components/ui/input';

import { cn } from '@/lib/utils';

import { useForgotPassword } from '../_services/auth-hooks';

const ForgotPasswordForm = ({ className, ...props }: React.ComponentPropsWithoutRef<'form'>) => {
  const { form, onSubmit, isPending } = useForgotPassword();

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={cn('flex flex-col gap-6', className)}
        {...props}
      >
        <div className="flex flex-col items-center gap-2 text-center">
          <h1 className="text-2xl font-bold">Forgot password</h1>
          <p className="text-balance text-sm text-muted-foreground">
            Enter your email to reset your password
          </p>
        </div>
        <div className="grid gap-6">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="Enter your email" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button disabled={isPending} type="submit" className="w-full h-10">
            {isPending ? <Loader className="animate-spin" /> : 'Send reset link'}
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

export default ForgotPasswordForm;
