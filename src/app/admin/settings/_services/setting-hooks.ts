import { queryKeys } from '@/config/queryKeys';
import settingSchema from '@/server/settings/setting-schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import settingsActions from './setting-actions';

export const useGeneralSettings = () => {
  const form = useForm<z.infer<typeof settingSchema.generalSettingsSchema>>({
    resolver: zodResolver(settingSchema.generalSettingsSchema),
    defaultValues: {
      applicationName: '',
      siteTitle: '',
      siteDescription: '',
      siteKeywords: [],
      logo: '',
      darkLogo: '',
      iconLogo: '',
      iconLogoDark: '',
      favicon: '',
      coverImage: '',
    },
  });

  const { data, isLoading } = useQuery({
    queryKey: [queryKeys.settings.general],
    queryFn: () => settingsActions.getSettings('general'),
  });

  const mutation = useMutation({
    mutationFn: settingsActions.saveGeneralSettings,
    mutationKey: [queryKeys.settings.general],
    onSuccess: () => {
      toast.success('Settings saved successfully');
    },
    onError: (error) => {
      toast.error(error.message || 'An error occurred');
    },
  });

  const onSubmit = async (body: z.infer<typeof settingSchema.generalSettingsSchema>) => {
    mutation.mutate(body);
  };

  useEffect(() => {
    if (data) {
      form.reset(data);
    }
  }, [data]);

  return {
    form,
    onSubmit,
    isLoading,
    isPending: mutation.isPending,
  };
};

export const useUploadSettings = () => {
  const form = useForm<z.infer<typeof settingSchema.uploadSettingsSchema>>({
    resolver: zodResolver(settingSchema.uploadSettingsSchema),
    defaultValues: {
      uploadProvider: 'local',
      maxFileSize: 0,
      maxFileSizeType: 'mb',
      s3AccessKeyId: '',
      s3SecretAccessKey: '',
      s3Region: '',
      s3Bucket: '',
      s3CustomDomain: '',
      s3Endpoint: '',
      s3Folder: '',
    },
  });

  const { data, isLoading } = useQuery({
    queryKey: [queryKeys.settings.upload],
    queryFn: () => settingsActions.getSettings('upload'),
  });

  const mutation = useMutation({
    mutationFn: settingsActions.saveUploadSettings,
    mutationKey: [queryKeys.settings.upload],
    onSuccess: () => {
      toast.success('Settings saved successfully');
    },
    onError: (error) => {
      toast.error(error.message || 'An error occurred');
    },
  });

  const onSubmit = async (body: z.infer<typeof settingSchema.uploadSettingsSchema>) => {
    mutation.mutate(body);
  };

  useEffect(() => {
    if (data) {
      form.reset({
        uploadProvider: data.uploadProvider,
        maxFileSize: data.maxFileSize,
        maxFileSizeType: data.maxFileSizeType,
        s3AccessKeyId: data.s3AccessKeyId || '',
        s3SecretAccessKey: data.s3SecretAccessKey || '',
        s3Region: data.s3Region || '',
        s3Bucket: data.s3Bucket || '',
        s3CustomDomain: data.s3CustomDomain || '',
        s3Endpoint: data.s3Endpoint || '',
        s3Folder: data.s3Folder || '',
      });
    }
  }, [data]);

  return {
    form,
    onSubmit,
    isLoading,
    isPending: mutation.isPending,
  };
};

export const useMailSettings = () => {
  const form = useForm<z.infer<typeof settingSchema.mailSettingsSchema>>({
    resolver: zodResolver(settingSchema.mailSettingsSchema),
    defaultValues: {
      enableMail: false,
      smtpSecure: false,
      senderName: '',
      senderEmail: '',
      smtpHost: '',
      smtpPort: '',
      smtpUser: '',
      smtpPass: '',
    },
  });

  const { data, isLoading } = useQuery({
    queryKey: [queryKeys.settings.mail],
    queryFn: () => settingsActions.getSettings('mail'),
  });

  const mutation = useMutation({
    mutationFn: settingsActions.saveMailSettings,
    mutationKey: [queryKeys.settings.mail],
    onSuccess: () => {
      toast.success('Settings saved successfully');
    },
    onError: (error) => {
      toast.error(error.message || 'An error occurred');
    },
  });

  const onSubmit = async (body: z.infer<typeof settingSchema.mailSettingsSchema>) => {
    mutation.mutate(body);
  };

  useEffect(() => {
    if (data) {
      form.reset(data);
    }
  }, [data]);

  return {
    form,
    onSubmit,
    isLoading,
    isPending: mutation.isPending,
  };
};

export const useBillingSettings = () => {
  const form = useForm<z.infer<typeof settingSchema.billingSettingsSchema>>({
    resolver: zodResolver(settingSchema.billingSettingsSchema),
    defaultValues: {
      billingProvider: 'stripe',
      billingMode: 'test',
      currency: '',
      stripePublishableKey: '',
      stripeSecretKey: '',
      stripeWebhookSecret: '',
    },
  });

  const { data, isLoading } = useQuery({
    queryKey: [queryKeys.settings.billing],
    queryFn: () => settingsActions.getSettings('billing'),
  });

  const mutation = useMutation({
    mutationFn: settingsActions.saveBillingSettings,
    mutationKey: [queryKeys.settings.billing],
    onSuccess: () => {
      toast.success('Settings saved successfully');
    },
    onError: (error) => {
      toast.error(error.message || 'An error occurred');
    },
  });

  const onSubmit = async (body: z.infer<typeof settingSchema.billingSettingsSchema>) => {
    mutation.mutate(body);
  };

  useEffect(() => {
    if (data) {
      form.reset(data);
    }
  }, [data]);

  return {
    form,
    onSubmit,
    isLoading,
    isPending: mutation.isPending,
  };
};

export const useAdvanceSettings = () => {
  const form = useForm<z.infer<typeof settingSchema.advancedSettingsSchema>>({
    resolver: zodResolver(settingSchema.advancedSettingsSchema),
    defaultValues: {
      freeCredits: undefined,
    },
  });

  const { data, isLoading } = useQuery({
    queryKey: [queryKeys.settings.advanced],
    queryFn: () => settingsActions.getSettings('advanced'),
  });

  const mutation = useMutation({
    mutationFn: settingsActions.saveAdvanceSettings,
    mutationKey: [queryKeys.settings.advanced],
    onSuccess: () => {
      toast.success('Settings saved successfully');
    },
    onError: (error) => {
      toast.error(error.message || 'An error occurred');
    },
  });

  const onSubmit = async (body: z.infer<typeof settingSchema.advancedSettingsSchema>) => {
    mutation.mutate(body);
  };

  useEffect(() => {
    if (data) {
      form.reset(data);
    }
  }, [data]);

  return {
    form,
    onSubmit,
    isLoading,
    isPending: mutation.isPending,
  };
};

export const useAiSettings = () => {
  const form = useForm<z.infer<typeof settingSchema.aiSettingsSchema>>({
    resolver: zodResolver(settingSchema.aiSettingsSchema),
    defaultValues: {
      aiApiProvider: 'replicate',
      aiApiKey: '',
    },
  });

  const { data, isLoading } = useQuery({
    queryKey: [queryKeys.settings.ai],
    queryFn: () => settingsActions.getSettings('ai'),
  });

  const mutation = useMutation({
    mutationFn: settingsActions.saveAiSettings,
    mutationKey: [queryKeys.settings.ai],
    onSuccess: () => {
      toast.success('Settings saved successfully');
    },
    onError: (error) => {
      toast.error(error.message || 'An error occurred');
    },
  });

  const onSubmit = async (body: z.infer<typeof settingSchema.aiSettingsSchema>) => {
    mutation.mutate(body);
  };

  useEffect(() => {
    if (data) {
      form.reset(data);
    }
  }, [data]);

  return {
    form,
    onSubmit,
    isLoading,
    isPending: mutation.isPending,
  };
};

export const useLegalSettings = () => {
  const form = useForm<z.infer<typeof settingSchema.legalSettingsSchema>>({
    resolver: zodResolver(settingSchema.legalSettingsSchema),
    defaultValues: {
      privacyPolicy: '',
      termsOfService: '',
    },
  });

  const { data, isLoading } = useQuery({
    queryKey: [queryKeys.settings.legal],
    queryFn: () => settingsActions.getSettings('legal'),
  });

  const mutation = useMutation({
    mutationFn: settingsActions.saveLegalSettings,
    mutationKey: [queryKeys.settings.legal],
    onSuccess: () => {
      toast.success('Settings saved successfully');
    },
    onError: (error) => {
      toast.error(error.message || 'An error occurred');
    },
  });

  const onSubmit = async (body: z.infer<typeof settingSchema.legalSettingsSchema>) => {
    mutation.mutate(body);
  };

  useEffect(() => {
    if (data) {
      form.reset(data);
    }
  }, [data]);

  return {
    form,
    onSubmit,
    isLoading,
    isPending: mutation.isPending,
  };
};

export const useCleanupOldFiles = () => {
  const mutation = useMutation({
    mutationFn: settingsActions.deleteOldFiles,
    onSuccess: () => {
      toast.success('Old files cleaned up successfully');
    },
    onError: (error) => {
      toast.error(error.message || 'An error occurred');
    },
  });

  const cleanFiles = async () => {
    mutation.mutate();
  };

  return {
    cleanFiles,
    cleanLoading: mutation.isPending,
  };
};
