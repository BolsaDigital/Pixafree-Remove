import { z } from 'zod';

const generalSettingsSchema = z.object({
  applicationName: z.string().nonempty('Application Name is required'),
  siteTitle: z.string().nonempty('Title is required'),
  siteDescription: z.string().nonempty('Description is required'),
  siteKeywords: z.array(z.string().min(1)).optional(),
  logo: z.string().optional(),
  darkLogo: z.string().optional(),
  iconLogo: z.string().optional(),
  iconLogoDark: z.string().optional(),
  favicon: z.string().optional(),
  coverImage: z.string().optional(),
});

export const uploadProviders = ['local', 's3'] as const;
export type UploadProvider = (typeof uploadProviders)[number];

export const maxFileSizeTypes = ['kb', 'mb', 'gb'] as const;
export type MaxFileSizeType = (typeof maxFileSizeTypes)[number];

const uploadSettingsSchema = z
  .object({
    uploadProvider: z.enum(uploadProviders),
    maxFileSize: z.coerce
      .number()
      .positive('Must be a positive number and greater than 0.')
      .int()
      .min(1),
    maxFileSizeType: z.enum(maxFileSizeTypes),
    s3AccessKeyId: z.string().optional(),
    s3SecretAccessKey: z.string().optional(),
    s3Region: z.string().optional(),
    s3Bucket: z.string().optional(),
    s3Folder: z.string().optional(),
    s3Endpoint: z.string().optional(),
    s3CustomDomain: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.uploadProvider === 's3') {
      if (!data.s3AccessKeyId) {
        ctx.addIssue({
          code: 'custom',
          path: ['s3AccessKeyId'],
          message: 'Access Key is required',
        });
      }
      if (!data.s3SecretAccessKey) {
        ctx.addIssue({
          code: 'custom',
          path: ['s3SecretAccessKey'],
          message: 'Secret Key is required',
        });
      }
      if (!data.s3Bucket) {
        ctx.addIssue({
          code: 'custom',
          path: ['s3Bucket'],
          message: 'Bucket is required',
        });
      }
      if (!data.s3Endpoint) {
        ctx.addIssue({
          code: 'custom',
          path: ['s3Endpoint'],
          message: 'Endpoint is required',
        });
      }
    }
  });

const mailSettingsSchema = z
  .object({
    enableMail: z.boolean().default(false),
    senderName: z.string().optional(),
    senderEmail: z.string().optional(),
    smtpHost: z.string().optional(),
    smtpPort: z.string().optional(),
    smtpUser: z.string().optional(),
    smtpPass: z.string().optional(),
    smtpSecure: z.boolean().optional().default(false),
  })
  .superRefine((data, ctx) => {
    if (data.enableMail) {
      if (!data.senderName) {
        ctx.addIssue({
          code: 'custom',
          path: ['senderName'],
          message: 'Sender Name is required',
        });
      }
      if (!data.senderEmail) {
        ctx.addIssue({
          code: 'custom',
          path: ['senderEmail'],
          message: 'Sender Email is required',
        });
      }
      if (!data.smtpHost) {
        ctx.addIssue({
          code: 'custom',
          path: ['smtpHost'],
          message: 'SMTP Host is required',
        });
      }
      if (!data.smtpPort) {
        ctx.addIssue({
          code: 'custom',
          path: ['smtpPort'],
          message: 'SMTP Port is required',
        });
      }
      if (!data.smtpUser) {
        ctx.addIssue({
          code: 'custom',
          path: ['smtpUser'],
          message: 'SMTP User is required',
        });
      }
      if (!data.smtpPass) {
        ctx.addIssue({
          code: 'custom',
          path: ['smtpPass'],
          message: 'SMTP Pass is required',
        });
      }
    }
  });

export const billingProviders = ['stripe'] as const;
export type PaymentProvider = (typeof billingProviders)[number];

export const getBillingProviderName = (provider: PaymentProvider | null) => {
  switch (provider) {
    case 'stripe':
      return 'Stripe';
    default:
      return '';
  }
};

export const billingMode = ['test', 'live'] as const;
export type BillingMode = (typeof billingMode)[number];

const billingSettingsSchema = z
  .object({
    billingProvider: z.enum(billingProviders),
    billingMode: z.enum(billingMode),
    currency: z.string().nonempty('Currency is required'),
    stripePublishableKey: z.string().optional(),
    stripeSecretKey: z.string().optional(),
    stripeWebhookSecret: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.billingProvider === 'stripe') {
      if (!data.stripePublishableKey) {
        ctx.addIssue({
          code: 'custom',
          path: ['stripePublishableKey'],
          message: 'Publishable Key is required',
        });
      }
      if (!data.stripeSecretKey) {
        ctx.addIssue({
          code: 'custom',
          path: ['stripeSecretKey'],
          message: 'Secret Key is required',
        });
      }
      if (!data.stripeWebhookSecret) {
        ctx.addIssue({
          code: 'custom',
          path: ['stripeWebhookSecret'],
          message: 'Webhook Secret is required',
        });
      }
    }
  });

const advancedSettingsSchema = z.object({
  freeCredits: z
    .number({
      required_error: 'Credits is required',
    })
    .min(0, 'Credits must be greater than or equal to 0'),
});

export const aiApiProviders = ['replicate'] as const;
export type AIApiProviders = (typeof aiApiProviders)[number];

export const getAIProviderName = (provider: AIApiProviders | null) => {
  switch (provider) {
    case 'replicate':
      return 'Replicate';
    default:
      return '';
  }
};

const aiSettingsSchema = z.object({
  aiApiProvider: z.enum(aiApiProviders),
  aiApiKey: z.string().nonempty('API Key is required'),
});

const legalSettingsSchema = z.object({
  privacyPolicy: z.string().optional(),
  termsOfService: z.string().optional(),
});

const settingsMap = {
  general: generalSettingsSchema,
  mail: mailSettingsSchema,
  upload: uploadSettingsSchema,
  billing: billingSettingsSchema,
  advanced: advancedSettingsSchema,
  ai: aiSettingsSchema,
  legal: legalSettingsSchema,
} as const;
export type SettingsKey = keyof typeof settingsMap;
export type SettingsDataMap = {
  [K in keyof typeof settingsMap]: z.infer<(typeof settingsMap)[K]>;
};

const settingsKeys = Object.keys(settingsMap) as [keyof typeof settingsMap];
export const getSettingsValidation = z.object({
  key: z.enum(settingsKeys as [keyof typeof settingsMap]),
});

export default {
  getSettingsValidation,
  generalSettingsSchema,
  mailSettingsSchema,
  uploadSettingsSchema,
  billingSettingsSchema,
  advancedSettingsSchema,
  aiSettingsSchema,
  legalSettingsSchema,
};
