import { z } from 'zod';
import { REGISTER_USERS_SCHEMA } from '../features/users/constants';

export interface User {
  id: string;
  email: string;
  fullName: string;
  cpf: string;
  birthday: Date;
  cellphone: string;
  diabetes: boolean;
  hypertensive: boolean;
  profession: string;
  neighborhood: string;
  city: string;
  state: string;
  worker: boolean;
  profilePhotoUrl?: string;
  role?: number;
  emergencyContact?: string;
  indicatedBy?: string;
  leadershipPosition?: string;
  religion?: string;
  notes?: string;
  eventId?: string;
}
export type RegisterUsersFormType = z.infer<typeof REGISTER_USERS_SCHEMA>;
