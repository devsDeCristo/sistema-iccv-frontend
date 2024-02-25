import { User } from '../../types/user';
import { z } from 'zod';
import { REGISTER_EVENT_SCHEMA } from './constants';

// TODO - When handler the return on backend, remove this type
export type HandlerReturnUser = {
  user: User;
};

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
  users: HandlerReturnUser[];
}

export interface Team {
  id: string;
  name: string;
  event: Event;
  users: HandlerReturnUser[];
}

export type RegisterEventFormType = z.infer<typeof REGISTER_EVENT_SCHEMA>;
