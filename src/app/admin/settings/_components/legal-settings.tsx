'use client';

import { Loader } from 'lucide-react';
import React from 'react';

import { MinimalTiptapEditor } from '@/components/rich-editor';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

import SettingsLoader from '../_components/settings-loader';
import { useLegalSettings } from '../_services/setting-hooks';

function LegalSettings() {
  const { form, onSubmit, isLoading, isPending } = useLegalSettings();

  return (
    <div className="mx-auto w-full max-w-full lg:max-w-xl space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Legal settings</h1>
        <p className="text-muted-foreground mt-1">
          Configure your legal settings to comply with regulations and ensure proper usage of the
          platform.
        </p>
      </div>
      {isLoading ? (
        <SettingsLoader />
      ) : (
        <div>
          <Form {...form}>
            <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
              <FormField
                control={form.control}
                name="privacyPolicy"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Privacy Policy</FormLabel>
                    <FormControl>
                      <div className="group flex flex-col">
                        <MinimalTiptapEditor
                          value={field.value}
                          onChange={(value) => field.onChange(value)}
                          maxHeight="300px"
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="termsOfService"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Terms of Service</FormLabel>
                    <FormControl>
                      <div className="group flex flex-col">
                        <MinimalTiptapEditor
                          value={field.value}
                          onChange={(value) => field.onChange(value)}
                          maxHeight="300px"
                        />
                      </div>
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
      )}
    </div>
  );
}

export default LegalSettings;
