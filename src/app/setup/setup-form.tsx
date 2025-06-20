'use client';

import commonSchema from '@/server/common/common-schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { Loader } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

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
import { PasswordInput } from '@/components/ui/password-input';

import { apiClient } from '@/lib/api-client';

const SetupForm = () => {
  const router = useRouter();
  const form = useForm<z.infer<typeof commonSchema.setupAppSchema>>({
    resolver: zodResolver(commonSchema.setupAppSchema),
    defaultValues: {
      applicationName: '',
      adminEmail: '',
      adminPassword: '',
    },
  });

  const { mutate, isPending } = useMutation({
    mutationFn: async (body: z.infer<typeof commonSchema.setupAppSchema>) => {
      const response = await apiClient.api.common.setup.$post({
        json: body,
      });

      const data = await response.json();
      if (!response.ok) {
        const error = data as unknown as { message: string };
        throw new Error(error.message);
      }

      return data;
    },
    onError: (error) => {
      toast.error(error.message);
    },
    onSuccess() {
      toast.success('Setup successful');
      router.push('/');
    },
  });

  const onSubmit = async (body: z.infer<typeof commonSchema.setupAppSchema>) => {
    mutate(body);
  };

  return (
    <div className="flex h-screen w-full items-center justify-center bg-background">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col gap-6 bg-card border rounded-xl p-6 w-full max-w-[400px]"
        >
          <div className="flex flex-col items-center gap-2 text-center">
            <h1 className="text-2xl font-bold">Setup</h1>
          </div>
          <div className="space-y-6">
            <FormField
              control={form.control}
              name="applicationName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Application Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your application name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="adminEmail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Admin Email</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="adminPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Admin Password</FormLabel>
                  <FormControl>
                    <PasswordInput type="password" placeholder="Enter your password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button disabled={isPending} type="submit" className="w-full h-10">
              {isPending ? <Loader className="animate-spin" /> : 'Complete Setup'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default SetupForm;
