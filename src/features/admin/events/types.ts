import { User, UserTeam } from '../../../types/user';
import { z } from 'zod';
import {
  CATEGORY_EVENT_SCHEMA,
  DATE_AND_LOCAL_SCHEMA,
  GENERAL_INFO_SCHEMA,
  REGISTER_EVENT_SCHEMA,
  REGISTRATION_SETTINGS_SCHEMA,
} from './constants';

export interface Event {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  img: string;
  groupLink: string;
  isActive: boolean;
  price: number;
  workerPrice: number;
  createdAt: Date;
  capacity: number;
  capacityWorker: number;
  updateAt: Date;
  users?: User[];
}
export interface filterUsers {
  birthday: { startDate: string | null; endDate: string | null };
  city: string | null;
  neighborhood: string | null;
  worker?: boolean;
}

export interface Insights {
  totalEvents: number;
  totalEventsActive: number;
  timeToFillHours: number;
  eventsInCurrentQuarter: number;
}

export interface Bedroom {
  id: string;
  name: string;
  capacity: number;
  tag: String[];
  note: string | null;
  event: Event;
  users: User[];
}

export interface Team {
  id: string;
  name: string;
  event: Event;
  users: UserTeam[];
  note: string | null;
  capacity: number;
  capacityWorker: number;
  price: number;
  workerPrice: number;
  groupLink?: string;
}

export type RegisterEventFormType = z.infer<typeof REGISTER_EVENT_SCHEMA>;

export type GeneralInfoFormType = z.infer<typeof GENERAL_INFO_SCHEMA>;

export type DateAndLocalFormType = z.infer<typeof DATE_AND_LOCAL_SCHEMA>;

export type RegistrationSettingsFormType = z.infer<
  typeof REGISTRATION_SETTINGS_SCHEMA
>;
export type CategoryEventFormType = z.infer<typeof CATEGORY_EVENT_SCHEMA>;
