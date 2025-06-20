import { z } from 'zod';

import { passwordSchema } from '@/lib/schema';

const setupAppSchema = z.object({
  applicationName: z.string().nonempty('Application Name is required'),
  adminEmail: z.string().email().nonempty('Admin Email is required'),
  adminPassword: passwordSchema,
});

export default {
  setupAppSchema,
};
