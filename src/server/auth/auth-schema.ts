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

// Mantener signInSchema si se usa en otras partes, o eliminar si loginSchema lo reemplaza completamente.
// Por seguridad, lo mantendremos por ahora.
export const signInSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});


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
  signInSchema,
  loginSchema, // ¡CORRECCIÓN! Aseguramos que loginSchema esté en el default export
  verifySchema,
  forgotPasswordSchema,
  resetPasswordSchema,
};
