import {
  Assignment,
  Category,
  Check,
  Event,
  Photo,
  Settings,
} from '@mui/icons-material';
import { z } from 'zod';
import { GroupRole } from './types';
import { PaymentMethod, PaymentStatus } from '../../../types/user';

export const GET_EVENTS = 'GET_EVENTS';
export const GET_BEDROOMS = 'GET_BEDROOMS';
export const GET_TEAMS = 'GET_TEAMS';
export const GET_INSIGHTS = 'GET_INSIGHTS';
export const GET_EVENT_USERS = 'GET_EVENT_USERS';
export const GET_EVENT_USERS_WAITLIST = 'GET_EVENT_USERS_WAITLIST';
export const GET_GROUPS_BY_USER = 'GET_GROUPS_BY_USER';
export const GET_PAYMENTS_EVENT = 'GET_PAYMENTS_EVENT';

const DEFAULT_MESSAGE = 'Campo obrigatório';

export const EVENT_TYPE_SCHEMA = z.enum(['RETIRO', 'CURSILHO']);

export const GROUP_ROLE_SELECT_SCHEMA = z.object({
  groupRoleId: z.array(
    z.string({
      required_error: 'Selecione ao menos uma opção',
    })
  ),
});
export const ROLE_SELECT_SCHEMA = z.object({
  roleId: z.array(
    z.string({
      required_error: 'Selecione ao menos uma opção',
    })
  ),
});

export const GENERAL_INFO_SCHEMA = z.object({
  name: z.string({
    required_error: DEFAULT_MESSAGE,
  }),
  shortDescription: z.string().optional(),
  description: z.string().optional(),
  // eventType: z.string().optional(),
  groupLink: z.string().optional(),
  isActive: z.boolean(),
});
export const CATEGORY_EVENT_SCHEMA = z.object({
  eventType: EVENT_TYPE_SCHEMA,
});
export const DATE_AND_LOCAL_SCHEMA = z.object({
  startDate: z.date({
    required_error: DEFAULT_MESSAGE,
  }),
  endDate: z.date({
    required_error: DEFAULT_MESSAGE,
  }),
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
  groupRoles: z.array(
    z.object({
      // id: z.string(),
      name: z.string({ required_error: DEFAULT_MESSAGE }),
      capacity: z.number({ required_error: DEFAULT_MESSAGE }),
      roles: z.array(
        z.object({
          price: z.number({ required_error: DEFAULT_MESSAGE }),
          description: z.string({ required_error: DEFAULT_MESSAGE }),
        })
      ),
    })
  ),
});
export const EVENT_LOGO_SCHEMA = z.object({
  eventLogo: z.any().optional(),
  eventCover: z.any().optional(),
  logoUrl: z.string().optional(),
  coverUrl: z.string().optional(),
  // .refine(
  //   (files) => {
  //     if (!files || files.length === 0) return true;
  //     return files[0]?.size <= 5 * 1024 * 1024; // 5MB
  //   },
  //   {
  //     message: 'O tamanho do arquivo deve ser menor que 5MB',
  //   }
  // )
  // .refine(
  //   (files) => {
  //     if (!files || files.length === 0) return true;
  //     return ['image/svg+xml'].includes(files[0]?.type);
  //   },
  //   {
  //     message: 'Formato de arquivo inválido. Use SVG.',
  //   }
  // ),
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

export const PANELS = [
  {
    id: 1,
    label: 'Informações gerais',
    icon: Assignment,
  },
  {
    id: 2,
    label: 'Data e Local',
    icon: Event,
  },
  {
    id: 3,
    label: 'Logo e capa',
    icon: Photo,
  },
  {
    id: 4,
    label: 'Configurações de inscrição',
    icon: Settings,
  },
];
export const STEPS_SUB = [
  {
    id: 1,
    label: 'Seleção de grupo e regra',
    icon: Assignment,
  },
  {
    id: 2,
    label: 'Confirmação',
    icon: Check,
  },
];
export const GROUP_ROLE_CURSILHO: GroupRole[] = [
  {
    name: 'Ingresso',
    capacity: 100,
    roles: [
      { price: 20, description: 'Cursilhisto(a)' },
      { price: 20, description: 'Cursilheiro(a)' },
    ],
  },
];
export const GROUP_ROLE_RETIRO: GroupRole[] = [
  {
    name: 'Completo',
    capacity: 100,
    roles: [
      { price: 0, description: '0 a 7 anos' },
      { price: 115, description: '8 a 12 anos' },
      { price: 230, description: '13 a 20 anos' },
    ],
  },
  {
    name: 'Dária: 1º dia',
    capacity: 30,
    roles: [
      { price: 0, description: '0 a 7 anos' },
      { price: 45, description: '8 a 12 anos' },
      { price: 70, description: '13 a 20 anos' },
    ],
  },
  {
    name: 'Dária: 2º dia',
    capacity: 30,
    roles: [
      { price: 0, description: '0 a 7 anos' },
      { price: 45, description: '8 a 12 anos' },
      { price: 70, description: '13 a 20 anos' },
    ],
  },
  {
    name: 'Dária: 3º dia',
    capacity: 30,
    roles: [
      { price: 0, description: '0 a 7 anos' },
      { price: 45, description: '8 a 12 anos' },
      { price: 70, description: '13 a 20 anos' },
    ],
  },
  {
    name: 'Dária: 4º dia',
    capacity: 30,
    roles: [
      { price: 0, description: '0 a 7 anos' },
      { price: 45, description: '8 a 12 anos' },
      { price: 70, description: '13 a 20 anos' },
    ],
  },
];

export const PAYMENT_METHODS = (payment: PaymentMethod): string => {
  const map: Record<PaymentMethod, string> = {
    PIX: 'Pix',
    CREDIT_CARD: 'Cartão de Crédito',
    DEBIT_CARD: 'Cartão de Débito',
    CASH: 'Dinheiro',
    BOLETO: 'Boleto',
    OTHER: 'Outro',
  };

  return map[payment];
};

export const PAYMENT_STATUS= (status: PaymentStatus): string => {
  const map: Record<PaymentStatus, string> = {
    PAID: 'Pago',
    IN_ANALYSIS: 'Em análise',
    DECLINED: 'Recusado',
    CANCELED: 'Cancelado',
    WAITING: 'Aguardando',
    REFUNDED: 'Reembolsado',
  };

  return map[status];
}

export const PAYMENT_STATUS_COLOR = (
  status: PaymentStatus,
  theme: any
): string => {
  const map: Record<PaymentStatus, string> = {
    PAID: theme.palette.chips.success,
    IN_ANALYSIS: theme.palette.chips.info,
    DECLINED: theme.palette.chips.canceled,
    CANCELED: theme.palette.chips.canceled,
    WAITING: theme.palette.chips.alert,
    REFUNDED: theme.palette.chips.pending,
  };

  return map[status];
};

export const ACTION_FROM= (status: string): string => {
  const map: Record<string, string> = {
    SYSTEM: 'Sistema',
    EXTERNAL: 'Externo',
  };

  return map[status];
}

