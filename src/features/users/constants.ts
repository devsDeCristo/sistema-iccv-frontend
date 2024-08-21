import { z } from 'zod';
export const GET_USERS = 'GET_USERS';

const DEFAULT_MESSAGE = 'Campo obrigatório';

export enum ENUM_OPTION_LEADERSHIP_POSITION {
  SHEPHERD = 'Pastor',
  PRESBYTER = 'Presbítero',
  DEACON = 'Diácono',
  EVANGELIST = 'Evangelista',
  MEMBER = 'Membro',
  NOT_POSITION = 'Não',
}

export const REGISTER_USERS_SCHEMA = z.object({
  fullName: z.string({
    required_error: DEFAULT_MESSAGE,
  }),
  badgeName: z.string().optional(),
  email: z.string({
    required_error: DEFAULT_MESSAGE,
  }),
  cpf: z
    .string({
      required_error: DEFAULT_MESSAGE,
    })
    .min(8, { message: 'CPF deve conter 11 digitos' }),
  cellphone: z
    .string({
      required_error: DEFAULT_MESSAGE,
    })
    .min(8, { message: 'Preencha um número válido' }),
  profession: z.string(),
  notes: z.string().optional(),
  religion: z.string().optional(),
  birthday: z
    .date({
      required_error: DEFAULT_MESSAGE,
    })
    .nullable()
    .refine((value) => value !== null, {
      message: DEFAULT_MESSAGE,
    }),
  emergencyContact: z
    .string({
      required_error: DEFAULT_MESSAGE,
    })
    .optional()
    .nullable(),
  indicatedBy: z.string().optional(),
  leadershipPosition: z.string().optional(),
  worker: z.number({
    required_error: DEFAULT_MESSAGE,
  }),
  role: z.number().optional(),
  neighborhood: z.string({
    required_error: DEFAULT_MESSAGE,
  }),
  city: z.string({
    required_error: DEFAULT_MESSAGE,
  }),
  state: z.string({
    required_error: DEFAULT_MESSAGE,
  }),
  diabetes: z.number({
    required_error: DEFAULT_MESSAGE,
  }),
  hypertensive: z.number({
    required_error: DEFAULT_MESSAGE,
  }),
  eventId: z.string().optional(),
});
export const LOGIN_SCHEMA = z.object({
  login: z.string(),
  password: z.string(),   
});
export const OPTIONS_BOOLEAN = [
  { value: 0, name: 'Não' },
  { value: 1, name: 'Sim' },
];

export const OPTIONS_WORKER = [
  { value: 0, name: 'Participar (Cursilhista)' },
  { value: 1, name: 'Servir (Cursilheiro)' },
];

export const OPTIONS_ROLE = [
  {
    value: ENUM_OPTION_LEADERSHIP_POSITION.NOT_POSITION,
    name: ENUM_OPTION_LEADERSHIP_POSITION.NOT_POSITION,
  },
  {
    value: ENUM_OPTION_LEADERSHIP_POSITION.SHEPHERD,
    name: ENUM_OPTION_LEADERSHIP_POSITION.SHEPHERD,
  },
  {
    value: ENUM_OPTION_LEADERSHIP_POSITION.PRESBYTER,
    name: ENUM_OPTION_LEADERSHIP_POSITION.PRESBYTER,
  },
  {
    value: ENUM_OPTION_LEADERSHIP_POSITION.DEACON,
    name: ENUM_OPTION_LEADERSHIP_POSITION.DEACON,
  },
  {
    value: ENUM_OPTION_LEADERSHIP_POSITION.EVANGELIST,
    name: ENUM_OPTION_LEADERSHIP_POSITION.EVANGELIST,
  },
  {
    value: ENUM_OPTION_LEADERSHIP_POSITION.MEMBER,
    name: ENUM_OPTION_LEADERSHIP_POSITION.MEMBER,
  },
];
