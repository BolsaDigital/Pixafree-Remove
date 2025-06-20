'use client';

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
import { Switch } from '@/components/ui/switch';

import { cn } from '@/lib/utils';

import SettingsLoader from '../_components/settings-loader';
import { useMailSettings } from '../_services/setting-hooks';

function MailSettings() {
  const { form, onSubmit, isLoading, isPending } = useMailSettings();

  return (
    <div className="mx-auto w-full max-w-full lg:max-w-xl space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Mail settings</h1>
        <p className="text-muted-foreground mt-1">
          Configure your SMTP settings to enable email notifications and other features that require
          email functionality.
        </p>
      </div>
      {isLoading && <SettingsLoader />}
      <div
        className={cn({
          hidden: isLoading,
        })}
      >
        <Form {...form}>
          <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name="enableMail"
              isRequired
              render={({ field }) => (
                <FormItem className="flex-1">
                  <div className="flex items-center gap-3">
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <FormLabel>Enable mail</FormLabel>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            {form.watch('enableMail') && (
              <>
                <hr className="!my-6" />
                <h3 className="font-semibold text-lg">SMTP Configuration</h3>
                <FormField
                  control={form.control}
                  name="senderName"
                  isRequired
                  render={({ field }) => (
                    <FormItem className="w-full flex-1 sm:w-auto">
                      <FormLabel>Sender Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="senderEmail"
                  isRequired
                  render={({ field }) => (
                    <FormItem className="w-full flex-1 sm:w-auto">
                      <FormLabel>Sender Email</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="smtpHost"
                  isRequired
                  render={({ field }) => (
                    <FormItem className="w-full flex-1 sm:w-auto">
                      <FormLabel>SMTP Host</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="smtpPort"
                  isRequired
                  render={({ field }) => (
                    <FormItem className="w-full flex-1 sm:w-auto">
                      <FormLabel>SMTP Port</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="smtpUser"
                  isRequired
                  render={({ field }) => (
                    <FormItem className="w-full flex-1 sm:w-auto">
                      <FormLabel>SMTP User</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="smtpPass"
                  isRequired
                  render={({ field }) => (
                    <FormItem className="w-full flex-1 sm:w-auto">
                      <FormLabel>SMTP Password</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="smtpSecure"
                  render={({ field }) => (
                    <FormItem className="w-full flex-1 sm:w-auto">
                      <div className="flex items-center gap-3">
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                        <FormLabel>SMTP Secure</FormLabel>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}
            <Button disabled={isPending} type="submit" className="min-w-[80px] h-10">
              {isPending ? <Loader className="animate-spin" /> : 'Save'}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}

export default MailSettings;
