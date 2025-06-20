'use client';
import { aiApiProviders } from '@/server/settings/setting-schema';
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
import { Select } from '@/components/ui/select';

import { cn, toCapitalize } from '@/lib/utils';

import SettingsLoader from '../_components/settings-loader';
import { useAiSettings } from '../_services/setting-hooks';

function AiSettings() {
  const { form, onSubmit, isLoading, isPending } = useAiSettings();

  return (
    <div className="mx-auto w-full max-w-full lg:max-w-xl space-y-6">
      <div>
        <h1 className="text-xl font-semibold">AI settings</h1>
        <p className="text-muted-foreground mt-1">
          Configure your AI settings to start using AI features.
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
              name="aiApiProvider"
              isRequired
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel>AI Api Provider</FormLabel>
                  <FormControl>
                    <Select
                      value={field.value}
                      className="capitalize"
                      onChange={(e) => {
                        field.onChange(e);
                      }}
                    >
                      {aiApiProviders.map((provider) => (
                        <option key={provider} value={provider}>
                          {toCapitalize(provider)}
                        </option>
                      ))}
                    </Select>
                  </FormControl>
                  <FormMessage />
                  <p className="text-muted-foreground text-xs">
                    Choose the AI API provider you want to use. This will determine the available
                    options and features for your AI settings.
                  </p>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="aiApiKey"
              isRequired
              render={({ field }) => (
                <FormItem className="w-full flex-1 sm:w-auto">
                  <FormLabel>API Key</FormLabel>
                  <FormControl>
                    <Input {...field} />
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
      </div>
    </div>
  );
}

export default AiSettings;
