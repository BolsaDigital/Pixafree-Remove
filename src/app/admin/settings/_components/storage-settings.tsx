'use client';

import { maxFileSizeTypes, uploadProviders } from '@/server/settings/setting-schema';
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
import { NumberInput } from '@/components/ui/number-input';
import { Select } from '@/components/ui/select';

import { cn, toCapitalize } from '@/lib/utils';

import SettingsLoader from '../_components/settings-loader';
import { useUploadSettings } from '../_services/setting-hooks';

function StorageSettings() {
  const { form, onSubmit, isLoading, isPending } = useUploadSettings();

  return (
    <div className="mx-auto w-full max-w-full lg:max-w-xl space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Storage settings</h1>
        <p className="text-muted-foreground mt-1">
          Configure the storage settings for your app. You can choose between different storage
          providers and set up the maximum file size, allowed file types, and more.
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
              name="uploadProvider"
              isRequired
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel>Storage provider</FormLabel>
                  <FormControl>
                    <Select className="capitalize" value={field.value} onChange={field.onChange}>
                      {uploadProviders.map((provider) => (
                        <option key={provider} value={provider}>
                          {toCapitalize(provider)}
                        </option>
                      ))}
                    </Select>
                  </FormControl>
                  <FormMessage />
                  <p className="text-muted-foreground text-xs">
                    Choose the storage provider you want to use to store your files.{' '}
                    <strong>(Local storage is not recommended for production environments.)</strong>
                  </p>
                </FormItem>
              )}
            />
            <div className="flex flex-1 gap-4">
              <FormField
                control={form.control}
                name="maxFileSize"
                isRequired
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Maximum file size</FormLabel>
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <FormControl>
                          <NumberInput value={field.value} onValueChange={field.onChange} />
                        </FormControl>
                      </div>
                      <Select
                        className="uppercase"
                        value={form.watch('maxFileSizeType')}
                        onChange={(e) => form.setValue('maxFileSizeType', e.target.value as any)}
                      >
                        {maxFileSizeTypes.map((type) => (
                          <option key={type} value={type}>
                            {toCapitalize(type)}
                          </option>
                        ))}
                      </Select>
                    </div>

                    <FormMessage />
                    <p className="text-muted-foreground text-xs">
                      Set the maximum file size allowed in public uploads.
                    </p>
                  </FormItem>
                )}
              />
            </div>
            {form.watch('uploadProvider') === 's3' && (
              <>
                <hr className="!my-6" />
                <h3 className="font-semibold text-lg">S3 Configuration</h3>
                <FormField
                  control={form.control}
                  name="s3AccessKeyId"
                  isRequired
                  render={({ field }) => (
                    <FormItem className="w-full flex-1 sm:w-auto">
                      <FormLabel>S3 Access key</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="s3SecretAccessKey"
                  isRequired
                  render={({ field }) => (
                    <FormItem className="w-full flex-1 sm:w-auto">
                      <FormLabel>S3 Secret key</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="s3Region"
                  render={({ field }) => (
                    <FormItem className="w-full flex-1 sm:w-auto">
                      <FormLabel>S3 Region</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="s3Bucket"
                  isRequired
                  render={({ field }) => (
                    <FormItem className="w-full flex-1 sm:w-auto">
                      <FormLabel>S3 Bucket</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="s3Endpoint"
                  isRequired
                  render={({ field }) => (
                    <FormItem className="w-full flex-1 sm:w-auto">
                      <FormLabel>S3 Endpoint</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="s3Folder"
                  render={({ field }) => (
                    <FormItem className="w-full flex-1 sm:w-auto">
                      <FormLabel>S3 Folder</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="s3CustomDomain"
                  render={({ field }) => (
                    <FormItem className="w-full flex-1 sm:w-auto">
                      <FormLabel>S3 Custom domain</FormLabel>
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

export default StorageSettings;
