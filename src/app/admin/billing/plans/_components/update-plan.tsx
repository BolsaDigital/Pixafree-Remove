'use client';

import { getBillingProviderName } from '@/server/settings/setting-schema';
import { PlanStatus } from '@prisma/client';
import { Loader } from 'lucide-react';
import React from 'react';

import { FormInputSkeletons, FormTextareaSkeletons } from '@/components/skeletons/form-skeletons';
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
import { NumberInput } from '@/components/ui/number-input';
import { Select } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';

import { cn, getCurrencySymbol, toCapitalize } from '@/lib/utils';

import { useUpdatePlan } from '../_services/plan-hooks';

const UpdatePlanSkeleton = () => {
  return (
    <div className="grid gap-6">
      <FormInputSkeletons />
      <FormTextareaSkeletons />
      <div className="flex gap-5 w-full items-start">
        <FormInputSkeletons />
        <FormInputSkeletons />
      </div>
      <div className="flex gap-5 w-full items-start">
        <FormInputSkeletons />
        <FormInputSkeletons />
      </div>
      <FormTextareaSkeletons />
      <FormInputSkeletons />
      <FormInputSkeletons />
      <Skeleton className="w-20 h-5" />
      <div className="flex justify-end gap-4">
        <Skeleton className="w-26 h-10" />
      </div>
    </div>
  );
};

const UpdatePlanForm = ({ id }: { id: string }) => {
  const { form, onSubmit, isPending, isLoading, settings } = useUpdatePlan(id);

  return (
    <>
      {isLoading && <UpdatePlanSkeleton />}
      <Form {...form}>
        <form
          onSubmit={onSubmit}
          className={cn('relative grid gap-5', {
            hidden: isLoading,
          })}
        >
          <FormField
            control={form.control}
            isRequired
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea placeholder="Enter description" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="monthlyPrice"
            isRequired
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel>Monthly Price</FormLabel>
                <FormControl>
                  <NumberInput
                    placeholder="Enter price"
                    value={field.value}
                    decimalScale={2}
                    onValueChange={field.onChange}
                    prefix={`${getCurrencySymbol(settings.billing.currency)} `}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="yearlyPrice"
            isRequired
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel>Annual Price</FormLabel>
                <FormControl>
                  <NumberInput
                    placeholder="Enter price"
                    value={field.value}
                    decimalScale={2}
                    onValueChange={field.onChange}
                    prefix={`${getCurrencySymbol(settings.billing.currency)} `}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="productId"
            isRequired={settings.billing.billingProvider === 'stripe'}
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel>
                  {getBillingProviderName(settings.billing.billingProvider)} Product Id
                </FormLabel>
                <FormControl>
                  <Input placeholder="Enter product id" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="monthlyPriceId"
            isRequired={settings.billing.billingProvider === 'stripe'}
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel>
                  {getBillingProviderName(settings.billing.billingProvider)} Monthly Price Id
                </FormLabel>
                <FormControl>
                  <Input placeholder="Enter price id" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="yearlyPriceId"
            isRequired={settings.billing.billingProvider === 'stripe'}
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel>
                  {getBillingProviderName(settings.billing.billingProvider)} Annual Price Id
                </FormLabel>
                <FormControl>
                  <Input placeholder="Enter price id" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            isRequired
            name="features"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Features</FormLabel>
                <div>
                  <FormControl>
                    <Textarea placeholder="Basic support, 30 Credits, etc." {...field} />
                  </FormControl>
                  <p className="text-muted-foreground text-xs mt-1">
                    Comma separated list of additional offers.
                  </p>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            isRequired
            name="position"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel>Position</FormLabel>
                <div>
                  <FormControl>
                    <NumberInput
                      placeholder="Enter position"
                      value={field.value}
                      onValueChange={field.onChange}
                    />
                  </FormControl>
                  <p className="text-muted-foreground text-xs mt-1">
                    This will be used to sort the plans in the billing page.
                  </p>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="status"
            isRequired
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel>Status</FormLabel>
                <FormControl>
                  <Select value={field.value} className="capitalize" onChange={field.onChange}>
                    {Object.values(PlanStatus).map((key) => (
                      <option key={key} value={key}>
                        {toCapitalize(key)}
                      </option>
                    ))}
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="credits"
            isRequired
            render={({ field }) => (
              <FormItem>
                <FormLabel>Credits per month</FormLabel>
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
          <FormField
            control={form.control}
            name="isPopular"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center gap-2">
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={(e) => field.onChange(e)} />
                  </FormControl>
                  <FormLabel>Popular Plan</FormLabel>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="mt-2 flex justify-end gap-3">
            <Button className="min-w-[120px] h-10" type="submit">
              {isPending ? <Loader className="animate-spin" /> : 'Update Plan'}
            </Button>
          </div>
        </form>
      </Form>
    </>
  );
};

export default UpdatePlanForm;
