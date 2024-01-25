import { z } from 'zod';
export const GET_USERS = 'GET_USERS';
export const REGISTER_USERS_SCHEMA = z.object({
    fullName: z.string({
      required_error: '',
    }),
    email: z.string(),
    cpf:z.string().min(8,{message:"CPF deve conter 11 digitos"}),
    cellphone:z.string().min(8,{message:"Preencha um número válido"}),
    notes: z.string(),
    emergencyContact:z.string().min(8,{message:"Preencha um número válido"}),
    indicateBy:z.string(),
    worker:z.number(),
    role:z.number(),
    city:z.string(),
    state:z.string(),
    diabetic:z.number(),
    hypertensive:z.number()
  });
