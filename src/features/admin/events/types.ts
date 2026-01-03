import { User, UserTeam } from '../../../types/user';
import { z } from 'zod';
import { DATE_AND_TIME_SCHEMA, GENERAL_INFO_SCHEMA, REGISTER_EVENT_SCHEMA, REGISTRATION_SETTINGS_SCHEMA } from './constants';

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

// export type GeneralInfoFormType = Pick<
//   RegisterEventFormType,
//   | 'name'
//   | 'groupLink'
//   | 'isActive'
// >;
export type GeneralInfoFormType = z.infer<typeof GENERAL_INFO_SCHEMA>;

export type DateAndTimeFormType = z.infer<typeof DATE_AND_TIME_SCHEMA>;
export type RegistrationSettingsFormType = z.infer<typeof REGISTRATION_SETTINGS_SCHEMA>;
// export type DateAndTimeFormType = Pick<
//   RegisterEventFormType,
//   'startDate' | 'endDate'
// >;

// export type RegistrationSettingsFormType = Pick<
//   RegisterEventFormType,
//   'capacity' | 'capacityWorker' | 'groupLink'
// >;
