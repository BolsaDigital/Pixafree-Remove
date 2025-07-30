import { z } from 'zod';

export const signUpSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
});

// Definimos loginSchema para que esté disponible
export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

// Eliminamos signInSchema si no se usa en ninguna otra parte.
// Si se usa en otros lugares, asegúrate de que sea el mismo que loginSchema o renómbralo.
// Por ahora, para simplificar y evitar duplicidad, lo eliminamos si loginSchema es el preferido.
// Si necesitas signInSchema con un propósito diferente, deberías reintroducirlo con un nombre distinto.
// export const signInSchema = z.object({
//   email: z.string().email('Invalid email address'),
//   password: z.string().min(1, 'Password is required'),
// });


export const verifySchema = z.object({
  token: z.string().min(1, 'Token is required'),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
});

// ¡IMPORTANTE! Asegúrate de que todos los esquemas estén incluidos en el default export
export default {
  signUpSchema,
  loginSchema, // Aseguramos que loginSchema esté en el default export
  // signInSchema, // Eliminado del default export si no se usa
  verifySchema,
  forgotPasswordSchema,
  resetPasswordSchema,
};
