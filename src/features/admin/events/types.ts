import { User, UserTeam } from '../../../types/user';
import { z } from 'zod';
import { REGISTER_EVENT_SCHEMA } from './constants';

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

export interface Insights {
   totalEvents:number;
   totalEventsActive:number;
   timeToFillHours: number;
   eventsInCurrentQuarter:number
}

export interface Bedroom {
  id: string;
  name: string;
  capacity: number;
  tag:String[];
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
