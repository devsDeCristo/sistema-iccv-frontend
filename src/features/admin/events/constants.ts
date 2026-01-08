import {
  Assignment,
  Category,
  Event,
  Photo,
  Settings,
} from '@mui/icons-material';
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
export const CATEGORY_EVENT_SCHEMA = z.object({
  eventType: EVENT_TYPE_SCHEMA,
});
export const DATE_AND_LOCAL_SCHEMA = z.object({
  startDate: z
    .date({
      required_error: DEFAULT_MESSAGE,
    })
    .nullable(),
  // .refine((value) => value !== null, {
  //   message: DEFAULT_MESSAGE,
  // }),
  endDate: z
    .date({
      required_error: DEFAULT_MESSAGE,
    })
    .nullable(),
  localName: z.string().optional(),
  zipCode: z.string().optional(),
  state: z.string().optional(),
  city: z.string().optional(),
  neighborhood: z.string().optional(),
  address: z.string().optional(),
  number: z.string().optional(),
  linkMaps: z
    .string()
    .optional()
    .refine(
      (val) => {
        // if (!val.includes('https://www.google.com/maps')) return false;
        return (val && val.includes('https://www.google.com/maps')) || !val;
      },
      {
        message: 'O link deve ser do Google Maps',
      }
    ),
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
export const EVENT_LOGO_SCHEMA = z.object({
  eventLogo: z
    .any()
    .optional()
    .refine(
      (files) => {
        if (!files || files.length === 0) return true;
        return files[0]?.size <= 5 * 1024 * 1024; // 5MB
      },
      {
        message: 'O tamanho do arquivo deve ser menor que 5MB',
      }
    )
    .refine(
      (files) => {
        if (!files || files.length === 0) return true;
        return ['image/svg+xml'].includes(files[0]?.type);
      },
      {
        message: 'Formato de arquivo inválido. Use SVG.',
      }
    ),
  eventCover: z
    .any()
    .optional()
    .refine(
      (files) => {
        if (!files || files.length === 0) return true;
        return files[0]?.size <= 5 * 1024 * 1024; // 5MB
      },
      {
        message: 'O tamanho do arquivo deve ser menor que 5MB',
      }
    )
    .refine(
      (files) => {
        if (!files || files.length === 0) return true;
        return ['image/svg+xml'].includes(files[0]?.type);
      },
      {
        message: 'Formato de arquivo inválido. Use SVG.',
      }
    ),
});

export const REGISTER_EVENT_SCHEMA = GENERAL_INFO_SCHEMA.merge(
  DATE_AND_LOCAL_SCHEMA
)
  .merge(EVENT_LOGO_SCHEMA)
  .merge(REGISTRATION_SETTINGS_SCHEMA);

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
    label: 'Categoria do evento',
    icon: Category,
  },
  {
    id: 2,
    label: 'Informações gerais',
    icon: Assignment,
  },
  {
    id: 3,
    label: 'Data e Local',
    icon: Event,
  },
  {
    id: 4,
    label: 'Logo e capa',
    icon: Photo,
  },
  {
    id: 5,
    label: 'Configurações de inscrição',
    icon: Settings,
  },
];
