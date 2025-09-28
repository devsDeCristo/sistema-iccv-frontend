import { User, UserTeam } from '../../../types/user';
import { z } from 'zod';
import { REGISTER_EVENT_SCHEMA } from './constants';

//define type for user in event have a addd roleTeam
export interface UserEvent extends User {
  roleTeam?: 'LEADER' | 'MEMBER';
}

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
  users?: UserEvent[];
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
