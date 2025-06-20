import { z } from 'zod';

const unlockPremiumSchema = z.object({
  id: z.string().nonempty(),
});

export default { unlockPremiumSchema };
