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
import { TagsInput } from '@/components/ui/tags-input';

import { cn } from '@/lib/utils';

import SettingsLoader from '../_components/settings-loader';
import { useGeneralSettings } from '../_services/setting-hooks';
import ImagePicker from '../../media/components/image-picker';

function GeneralSettings() {
  const { form, onSubmit, isLoading, isPending } = useGeneralSettings();

  return (
    <div className="mx-auto w-full max-w-full lg:max-w-xl space-y-6">
      <div>
        <h1 className="text-xl font-semibold">General settings</h1>
        <p className="text-muted-foreground mt-1">
          Configure general settings for your application.
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
              name="applicationName"
              isRequired
              render={({ field }) => (
                <FormItem className="w-full flex-1 sm:w-auto">
                  <FormLabel>Application name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                  <p className="text-muted-foreground text-xs">
                    The application name is used in entire application and in the email templates.
                  </p>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="siteTitle"
              isRequired
              render={({ field }) => (
                <FormItem className="w-full flex-1 sm:w-auto">
                  <FormLabel>Site title</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                  <p className="text-muted-foreground text-xs">
                    The site title is used for application title. Usefull for SEO.
                  </p>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="siteDescription"
              isRequired
              render={({ field }) => (
                <FormItem className="w-full flex-1 sm:w-auto">
                  <FormLabel>Site description</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                  <p className="text-muted-foreground text-xs">
                    The site description is used for SEO. It should be a short description of your
                    website.
                  </p>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="siteKeywords"
              render={({ field }) => (
                <FormItem className="w-full flex-1 sm:w-auto">
                  <FormLabel>Site keywords</FormLabel>
                  <FormControl>
                    <TagsInput value={field.value} onChange={field.onChange} />
                  </FormControl>
                  <FormMessage />
                  <p className="text-muted-foreground text-xs">
                    Keywords help search engines understand what your website is about. Separate
                    keywords with commas.
                  </p>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="logo"
              render={({ field }) => (
                <FormItem className="w-full flex-1 sm:w-auto">
                  <div className="flex gap-4 justify-between items-center">
                    <div className="space-y-1">
                      <FormLabel>Logo</FormLabel>
                      <p className="text-muted-foreground text-xs max-w-[300px]">
                        Logo is use for your application branding. Recommended size is 300x120px.
                      </p>
                    </div>
                    <FormControl>
                      <ImagePicker value={field.value} onChange={field.onChange} />
                    </FormControl>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="darkLogo"
              render={({ field }) => (
                <FormItem className="w-full flex-1 sm:w-auto">
                  <div className="flex gap-4 justify-between items-center">
                    <div className="space-y-1">
                      <FormLabel>
                        Logo <span className="text-muted-foreground text-xs">(dark mode)</span>
                      </FormLabel>
                      <p className="text-muted-foreground text-xs max-w-[300px]">
                        Logo is use for your application branding. Recommended size is 300x120px.
                      </p>
                    </div>
                    <FormControl>
                      <ImagePicker value={field.value} onChange={field.onChange} />
                    </FormControl>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="iconLogo"
              render={({ field }) => (
                <FormItem className="w-full flex-1 sm:w-auto">
                  <div className="flex gap-4 justify-between items-center">
                    <div className="space-y-1">
                      <FormLabel>Icon Logo</FormLabel>
                      <p className="text-muted-foreground text-xs max-w-[300px]">
                        Icon Logo is use for dashboard sidebar when collapsed. Recommended size is
                        80x80px.
                      </p>
                    </div>
                    <FormControl>
                      <ImagePicker value={field.value} onChange={field.onChange} />
                    </FormControl>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="iconLogoDark"
              render={({ field }) => (
                <FormItem className="w-full flex-1 sm:w-auto">
                  <div className="flex gap-4 justify-between items-center">
                    <div className="space-y-1">
                      <FormLabel>
                        Icon Logo <span className="text-muted-foreground text-xs">(dark mode)</span>
                      </FormLabel>
                      <p className="text-muted-foreground text-xs max-w-[300px]">
                        Icon Logo is use for dashboard sidebar when collapsed. Recommended size is
                        80x80px.
                      </p>
                    </div>
                    <FormControl>
                      <ImagePicker value={field.value} onChange={field.onChange} />
                    </FormControl>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="favicon"
              render={({ field }) => (
                <FormItem className="w-full flex-1 sm:w-auto">
                  <div className="flex gap-4 justify-between items-center">
                    <div className="space-y-1">
                      <FormLabel>Favicon</FormLabel>
                      <p className="text-muted-foreground text-xs max-w-[300px]">
                        Favicon is use for your application branding. Recommended size is 32x32px.
                      </p>
                    </div>
                    <FormControl>
                      <ImagePicker value={field.value} onChange={field.onChange} />
                    </FormControl>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="coverImage"
              render={({ field }) => (
                <FormItem className="w-full flex-1 sm:w-auto">
                  <div className="flex gap-4 justify-between items-center">
                    <div className="space-y-1">
                      <FormLabel>Cover Image</FormLabel>
                      <p className="text-muted-foreground text-xs max-w-[300px]">
                        Cover image is use for your application branding. Recommended size is
                        1920x1080px.
                      </p>
                    </div>
                    <FormControl>
                      <ImagePicker value={field.value} onChange={field.onChange} />
                    </FormControl>
                  </div>
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

export default GeneralSettings;
