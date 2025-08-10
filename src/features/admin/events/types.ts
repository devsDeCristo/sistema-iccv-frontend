import { User } from '../../../types/user';
import { z } from 'zod';
import { REGISTER_EVENT_SCHEMA } from './constants';

export interface Event {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  price: number;
  workerPrice: number;
  createdAt: Date;
  updateAt: Date;
  users?: User[];
}

export interface Bedroom {
  id: string;
  note: string | null;
  event: Event;
  users: User[];
}

export interface Team {
  id: string;
  name: string;
  event: Event;
  users: User[];
}

export type RegisterEventFormType = z.infer<typeof REGISTER_EVENT_SCHEMA>;
