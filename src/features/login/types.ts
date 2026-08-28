import { z } from 'zod';
import {
  FORGOT_PASSWORD_SCHEMA,
  LOGIN_SCHEMA,
  NEW_PASSWORD_SCHEMA,
  RESET_CODE_SCHEMA,
} from './constants';

export interface User {
  //login: string;
  cpf: string;
  password: string;
}
export type LoginFormType = z.infer<typeof LOGIN_SCHEMA>;
export type ForgotPasswordFormType = z.infer<typeof FORGOT_PASSWORD_SCHEMA>;
export type ResetCodeFormType = z.infer<typeof RESET_CODE_SCHEMA>;
export type NewPasswordFormType = z.infer<typeof NEW_PASSWORD_SCHEMA>;
