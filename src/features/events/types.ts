import { User } from '../../types/user';

// TODO - When handler the return on backend, remove this type
export type HandlerReturnUser = {
  user: User;
};

export interface Event {
  id: number;
  name: string;
  startDate: Date;
  endDate: Date;
  price: number;
  workerPrice: number;
  createdAt: Date;
  updateAt: Date;
  users?: HandlerReturnUser[];
}

export interface Bedroom {
  id: number;
  note: string | null;
  event: Event;
  users: HandlerReturnUser[];
}

export interface Team {
  id: number;
  name: string;
  event: Event;
  users: HandlerReturnUser[];
}
