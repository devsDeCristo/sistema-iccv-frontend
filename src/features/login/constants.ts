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
