import { z } from 'zod';

export const GET_EVENTS = 'GET_EVENTS';
export const GET_BEDROOMS = 'GET_BEDROOMS';
export const GET_TEAMS = 'GET_TEAMS';

const DEFAULT_MESSAGE = 'Campo obrigatório';

export const REGISTER_EVENT_SCHEMA = z.object({
  name: z.string({
    required_error: DEFAULT_MESSAGE,
  }),
  startDate: z
    .date({
      required_error: DEFAULT_MESSAGE,
    })
    .nullable()
    .refine((value) => value !== null, {
      message: DEFAULT_MESSAGE,
    }),
  endDate: z
    .date({
      required_error: DEFAULT_MESSAGE,
    })
    .nullable()
    .refine((value) => value !== null, {
      message: DEFAULT_MESSAGE,
    }),
  workerPrice: z.coerce.number({
    required_error: DEFAULT_MESSAGE,
  }),
  price: z.coerce.number({
    required_error: DEFAULT_MESSAGE,
  }),
  users: z.string().array().optional(),
  capacity: z.coerce.number({
    required_error: DEFAULT_MESSAGE,
  }),
  capacityWorker: z.coerce.number({
    required_error: DEFAULT_MESSAGE,
  }),
  groupLink: z.string().optional(),
});
