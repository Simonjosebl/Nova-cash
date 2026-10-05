import { z } from 'zod';

/** Validaciones de autenticación (Cap. 6.4 / 7 — RHF + Zod). Mensajes humanos en español. */

const email = z.string().min(1, 'El correo es obligatorio.').email('Correo no válido.');
const password = z
  .string()
  .min(10, 'La contraseña debe tener al menos 10 caracteres.')
  .max(72, 'La contraseña es demasiado larga.')
  .regex(/[A-Za-z]/, 'Incluye al menos una letra.')
  .regex(/\d/, 'Incluye al menos un número.');

export const loginSchema = z.object({
  email,
  password: z.string().min(1, 'La contraseña es obligatoria.'),
});

export const registerSchema = z
  .object({
    name: z.string().min(2, 'Ingresa tu nombre.').max(80, 'Nombre demasiado largo.'),
    email,
    password,
    confirmPassword: z.string().min(1, 'Confirma tu contraseña.'),
    acceptPolicies: z.boolean().refine((value) => value, {
      message: 'Debes aceptar la Política de Tratamiento de Datos y los Términos.',
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Las contraseñas no coinciden.',
    path: ['confirmPassword'],
  });

export const forgotPasswordSchema = z.object({ email });

export const resetPasswordSchema = z
  .object({
    password,
    confirmPassword: z.string().min(1, 'Confirma tu contraseña.'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Las contraseñas no coinciden.',
    path: ['confirmPassword'],
  });

export const updateProfileSchema = z.object({
  name: z.string().min(2, 'Ingresa tu nombre.').max(80, 'Nombre demasiado largo.'),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
