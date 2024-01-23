import { z } from 'zod';
export const GET_USERS = 'GET_USERS';
export const REGISTER_USERS_SCHEMA = z.object({
    fullName: z.string({
      required_error: '',
    }),
    email: z.string(),
    cpf:z.string().min(8,{message:"CPF deve conter 11 digitos"})
  });
