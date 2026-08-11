import { z } from 'zod';
import { REGISTER_USERS_SCHEMA } from '../features/admin/users/constants';

export type PaymentStatus =
  | 'PAID'
  | 'IN_ANALYSIS'
  | 'DECLINED'
  | 'CANCELED'
  | 'WAITING'
  | 'REFUNDED';

export type PaymentReceived = 'SYSTEM' | 'EXTERNAL';

export type PaymentMethod =
  | 'PIX'
  | 'CREDIT_CARD'
  | 'DEBIT_CARD'
  | 'CASH'
  | 'BOLETO'
  | 'OTHER';

  export interface discountsResponse {
    id: string;
    percentage: number;
    description: string;
  }

export interface PaymentResponse {
  // dados do usuário
  id: string;
  fullName: string;
  email: string;
  cpf: string;
  profilePhotoUrl?: string;

  // dados do pagamento
  method: PaymentMethod;
  status: PaymentStatus;
  receivedFrom: PaymentReceived;
  amount: number;

  createdAt: string; // ISO date string
  updatedAt: string;

  eventId: string;
  roleRegistrationId: string;
  userId: string;
  groupId: string;
  groupName: string;

  payload: Record<string, any> | null;
  discountsAppliedId?: string;
}
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
  badgeName?: string;
  role?: number;
  emergencyContact?: string;
  indicatedBy?: string;
  leadershipPosition?: string;
  religion?: string;
  notes?: string;
  eventId?: string;
  /** data/hora da inscrição no evento (EventOnUsers.createdAt) */
  registeredAt?: string;
  /** data/hora de entrada na lista de espera (Waitlist.createdAt) */
  waitlistCreatedAt?: string;
  bedrooms?: any[];
  teams?: any[];
  groupsRegistration?: any[];

}
export interface UserTeam extends User {
  roleTeam: 'LEADER' | 'MEMBER';
}
export type RegisterUsersFormType = z.infer<typeof REGISTER_USERS_SCHEMA>;
