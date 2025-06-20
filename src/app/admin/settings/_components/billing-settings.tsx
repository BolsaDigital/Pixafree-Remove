'use client';

import { stripeCurrencies } from '@/config/stripe';
import { billingMode, billingProviders } from '@/server/settings/setting-schema';
import { Loader } from 'lucide-react';
import React from 'react';

import { Button } from '@/components/ui/button';
import { Combobox } from '@/components/ui/combobox';
import CopyButton from '@/components/ui/copy-button';
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
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

import { cn, toCapitalize } from '@/lib/utils';

import SettingsLoader from '../_components/settings-loader';
import { useBillingSettings } from '../_services/setting-hooks';

function BillingSettings() {
  const { form, onSubmit, isLoading, isPending } = useBillingSettings();

  return (
    <div className="mx-auto w-full max-w-full lg:max-w-xl space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Billing settings</h1>
        <p className="text-muted-foreground mt-1">
          Configure your billing settings to start accepting payments.
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
              name="billingProvider"
              isRequired
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel>Billing provider</FormLabel>
                  <Select
                    value={field.value}
                    className="capitalize"
                    onChange={(e) => {
                      field.onChange(e);
                      form.setValue('currency', '');
                    }}
                  >
                    {billingProviders.map((provider) => (
                      <option key={provider} value={provider}>
                        {toCapitalize(provider)}
                      </option>
                    ))}
                  </Select>
                  <FormMessage />
                  <p className="text-muted-foreground text-xs">
                    Choose the billing provider you want to use for your app.
                  </p>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="billingMode"
              isRequired
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel>Billing mode</FormLabel>
                  <FormControl>
                    <ToggleGroup
                      className="gap-3"
                      type="single"
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      {billingMode.map((mode) => (
                        <ToggleGroupItem
                          className="rounded-md capitalize px-3 h-7 border border-border data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
                          key={mode}
                          value={mode}
                        >
                          {mode}
                        </ToggleGroupItem>
                      ))}
                    </ToggleGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {form.watch('billingProvider') === 'stripe' && (
              <>
                <hr className="!my-6" />
                <h3 className="font-semibold text-lg">Stripe Configuration</h3>
                <FormField
                  control={form.control}
                  name="currency"
                  isRequired
                  render={({ field }) => (
                    <FormItem className="w-full flex-1 gap-3 space-y-0 sm:w-auto">
                      <FormLabel>Currency</FormLabel>
                      <Combobox
                        value={field.value}
                        onChange={field.onChange}
                        options={stripeCurrencies.map((e) => ({
                          label: e.description,
                          value: e.code,
                        }))}
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="stripePublishableKey"
                  isRequired
                  render={({ field }) => (
                    <FormItem className="w-full flex-1 sm:w-auto">
                      <FormLabel>Stripe Publishable Key</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  isRequired
                  name="stripeSecretKey"
                  render={({ field }) => (
                    <FormItem className="w-full flex-1 sm:w-auto">
                      <FormLabel>Stripe Secret Key</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormItem className="w-full flex-1 sm:w-auto">
                  <FormLabel>Webhook URL</FormLabel>
                  <p className="bg-muted rounded-md p-3 pr-0 text-xs h-10 flex justify-between items-center">
                    {`${process.env.NEXT_PUBLIC_BASE_URL}/api/billing/stripe/webhook`}
                    <CopyButton
                      textToCopy={`${process.env.NEXT_PUBLIC_BASE_URL}/api/billing/stripe/webhook`}
                    />
                  </p>
                </FormItem>
                <FormField
                  control={form.control}
                  name="stripeWebhookSecret"
                  isRequired
                  render={({ field }) => (
                    <FormItem className="w-full flex-1 sm:w-auto">
                      <FormLabel>Stripe Webhook Secret</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
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

export default BillingSettings;
