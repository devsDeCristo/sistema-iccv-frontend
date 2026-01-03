import { Assignment, Event, Settings } from '@mui/icons-material';
import { z } from 'zod';

export const GET_EVENTS = 'GET_EVENTS';
export const GET_BEDROOMS = 'GET_BEDROOMS';
export const GET_TEAMS = 'GET_TEAMS';
export const GET_INSIGHTS = 'GET_INSIGHTS';
export const GET_EVENT_USERS = 'GET_EVENT_USERS';

const DEFAULT_MESSAGE = 'Campo obrigatório';

export const EVENT_TYPE_SCHEMA = z.enum(['RETIRO', 'CURSILHO']);
export const GENERAL_INFO_SCHEMA = z.object({
  name: z.string({
    required_error: DEFAULT_MESSAGE,
  }),
  shortDescription: z.string().optional(),
  description: z.string().optional(),
  // eventType: z.string().optional(),
  groupLink: z.string().optional(),
  isActive: z.boolean().optional(),
});
export const DATE_AND_TIME_SCHEMA = z.object({
  startDate: z
    .date({
      required_error: DEFAULT_MESSAGE,
    })
    .nullable()
      // .refine((value) => value !== null, {
      //   message: DEFAULT_MESSAGE,
      // }),
      ,
  endDate: z
    .date({
      required_error: DEFAULT_MESSAGE,
    })
    .nullable()
    // .refine((value) => value !== null, {
    //   message: DEFAULT_MESSAGE,
    // }),
});
export const REGISTRATION_SETTINGS_SCHEMA = z.object({
  workerPrice: z.coerce.number({
    required_error: DEFAULT_MESSAGE,
  }),
  price: z.coerce.number({
    required_error: DEFAULT_MESSAGE,
  }),
  capacity: z.coerce.number({
    required_error: DEFAULT_MESSAGE,
  }),
  capacityWorker: z.coerce.number({
    required_error: DEFAULT_MESSAGE,
  }),
});


export const REGISTER_EVENT_SCHEMA = 
  GENERAL_INFO_SCHEMA.merge(DATE_AND_TIME_SCHEMA).merge(
    REGISTRATION_SETTINGS_SCHEMA
  );
export const OPTIONS_STATUS = [
  { value: true, name: 'Ativo' },
  { value: false, name: 'Inativo' },
];
export const OPTIONS_EVENT_TYPE = [ 
  { value: 'RETIRO', name: 'Retiro' },
  { value: 'CURSILHO', name: 'Cursilho' },
];
export const STEPS = [
  {
    id: 1,
    label: 'Informações gerais',
    icon: Assignment,
  },
  {
    id: 2,
    label: 'Data e Horário',
    icon: Event,
  },
  {
    id: 3,
    label: 'Configurações de inscrição',
    icon: Settings,
  },
];
