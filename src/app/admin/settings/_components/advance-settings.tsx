'use client';
import { Loader } from 'lucide-react';
import React from 'react';

import { Button } from '@/components/ui/button';
import CopyButton from '@/components/ui/copy-button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Label } from '@/components/ui/label';
import { NumberInput } from '@/components/ui/number-input';

import { cn } from '@/lib/utils';

import SettingsLoader from '../_components/settings-loader';
import { useAdvanceSettings, useCleanupOldFiles } from '../_services/setting-hooks';

function AdvanceSettings() {
  const { form, onSubmit, isLoading, isPending } = useAdvanceSettings();
  const { cleanFiles, cleanLoading } = useCleanupOldFiles();

  return (
    <div className="mx-auto w-full max-w-full lg:max-w-xl space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Advance settings</h1>
        <p className="text-muted-foreground mt-1">Configure your advance settings here.</p>
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
              name="freeCredits"
              isRequired
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Free user credits{' '}
                    <span className="text-muted-foreground text-xs">(monthly)</span>
                  </FormLabel>
                  <FormControl>
                    <NumberInput
                      placeholder="Enter credits"
                      value={field.value}
                      onValueChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button disabled={isPending} type="submit" className="min-w-[80px] h-10">
              {isPending ? <Loader className="animate-spin" /> : 'Save'}
            </Button>
          </form>
        </Form>
        <hr className="my-10" />
        <div className="border p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">
            Cleanup old files <span className="text-muted-foreground text-xs">(24 hours)</span>
          </h2>
          <p className="text-muted-foreground mb-6">
            This will delete all public uploaded images older than 24 hours. This is useful for
            cleaning up files that are no longer needed.
          </p>
          <Button
            disabled={cleanLoading}
            variant="destructive"
            className="min-w-[100px] h-10"
            type="button"
            onClick={() => {
              cleanFiles();
            }}
          >
            {cleanLoading ? <Loader className="animate-spin" /> : 'Clean Data'}
          </Button>
          <FormItem className="w-full flex-1 sm:w-auto mt-6">
            <Label>API URL</Label>
            <p className="bg-muted rounded-md p-3 pr-0 text-xs h-10 flex justify-between items-center">
              {`${process.env.NEXT_PUBLIC_BASE_URL}/api/common/cleanup-old-files`}
              <CopyButton
                textToCopy={`${process.env.NEXT_PUBLIC_BASE_URL}/api/common/cleanup-old-files`}
              />
            </p>
          </FormItem>
          <p className="mt-4 text-xs">
            You can use this API URL to trigger the cleanup process manually. Or you can set up a
            scheduled job to run this URL every 24 hours. For example, you can use{' '}
            <strong>https://upstash.com/</strong> to schedule a job to run this URL every 24 hours.
          </p>
        </div>
      </div>
    </div>
  );
}

export default AdvanceSettings;
