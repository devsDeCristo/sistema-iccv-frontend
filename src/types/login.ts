import { z } from 'zod';
import { LOGIN_SCHEMA } from '../features/users/constants';

export interface User {
  login: string;
  password: string;
}
export type LoginFormType = z.infer<typeof LOGIN_SCHEMA>;
