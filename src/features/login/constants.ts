import { z } from 'zod';

const DEFAULT_MESSAGE = 'Campo obrigatório';

export const LOGIN_SCHEMA = z.object({
  cpf: z
    .string({
      required_error: DEFAULT_MESSAGE,
    })
    .min(8, { message: 'CPF deve conter 11 digitos' }),
  password: z.string(),
});

/** Etapa 1 da redefinição: o CPF chega com máscara e vale pelos 11 dígitos. */
export const FORGOT_PASSWORD_SCHEMA = z.object({
  cpf: z
    .string({ required_error: DEFAULT_MESSAGE })
    .refine((value) => value.replace(/\D/g, '').length === 11, {
      message: 'CPF deve conter 11 dígitos',
    }),
});

/** Etapa 2: o código de 8 dígitos que chegou por e-mail. */
export const RESET_CODE_SCHEMA = z.object({
  code: z
    .string({ required_error: DEFAULT_MESSAGE })
    .regex(/^\d{8}$/, { message: 'O código tem 8 dígitos' }),
});

/**
 * Etapa 3: a senha nova. O mínimo de 8 e o teto de 72 são os mesmos do backend
 * — o teto é o limite do bcrypt, que ignora o que passa disso.
 */
export const NEW_PASSWORD_SCHEMA = z
  .object({
    password: z
      .string({ required_error: DEFAULT_MESSAGE })
      .min(8, { message: 'A senha precisa de pelo menos 8 caracteres' })
      .max(72, { message: 'A senha pode ter no máximo 72 caracteres' }),
    confirmPassword: z.string({ required_error: DEFAULT_MESSAGE }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'As senhas não conferem',
    path: ['confirmPassword'],
  });
