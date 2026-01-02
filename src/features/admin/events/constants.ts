import { Build, PlumbingOutlined } from '@mui/icons-material';
import { z } from 'zod';
import { Layout } from '../../../pages/layout';

export const GET_EVENTS = 'GET_EVENTS';
export const GET_BEDROOMS = 'GET_BEDROOMS';
export const GET_TEAMS = 'GET_TEAMS';
export const GET_INSIGHTS = 'GET_INSIGHTS';
export const GET_EVENT_USERS = 'GET_EVENT_USERS';

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
  isActive: z.boolean().optional(),
});
export const OPTIONS_STATUS = [
  { value: true, name: 'Ativo' },
  { value: false, name: 'Inativo' },
];
export const STEPS = [
  {
    id: 1,
    label: 'Informações gerais',
    icon: Build,
  },
  {
    id: 2,
    label: 'Data e Horário',
    icon: Build,
  },
  {
    id: 3,
    label: 'Configurações de inscrição',
    icon: Build,
  },
];
