import { User } from '@prisma/client';

declare module 'hono' {
  interface ContextVariableMap {
    user: User;
    session_token: string;
  }
}
