import { z } from 'zod';
import { LOGIN_SCHEMA } from './constants';

export interface User {
  //login: string;
  cpf: string;
  password: string;
}
export type LoginFormType = z.infer<typeof LOGIN_SCHEMA>;
