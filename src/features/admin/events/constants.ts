import {
  Assignment,
  Category,
  Check,
  Event,
  Gavel,
  Photo,
  Settings,
  ShoppingBag,
} from '@mui/icons-material';
import { z } from 'zod';
import { GroupRole } from './types';
import {
  PaymentMethod,
  PaymentReceived,
  PaymentStatus,
} from '../../../types/user';

export const GET_EVENTS = 'GET_EVENTS';
export const GET_BEDROOMS = 'GET_BEDROOMS';
export const GET_TEAMS = 'GET_TEAMS';
export const GET_EVENT_USERS = 'GET_EVENT_USERS';
export const GET_EVENT_USERS_WAITLIST = 'GET_EVENT_USERS_WAITLIST';
export const GET_GROUPS_BY_USER = 'GET_GROUPS_BY_USER';
export const GET_PAYMENTS_EVENT = 'GET_PAYMENTS_EVENT';
export const GET_PAYMENT_LOGS = 'GET_PAYMENT_LOGS';
export const GET_DISCOUNTS = 'GET_DISCOUNTS';

const DEFAULT_MESSAGE = 'Campo obrigatório';

export const EVENT_TYPE_SCHEMA = z.enum(['RETIRO', 'CURSILHO']);

export const EVENT_STATUS_SCHEMA = z.enum(['ACTIVE', 'INACTIVE', 'TEST']);

export const GROUP_ROLE_SELECT_SCHEMA = z.object({
  groupRoleId: z.array(z.string()).min(1, {
    message: 'Selecione ao menos uma opção',
  }),
});
export const ROLE_SELECT_SCHEMA = z.object({
  groupRole: z.array(
    z.object({
      groupRoleId: z.string({
        required_error: DEFAULT_MESSAGE,
      }),
      roleIds: z.array(z.string()).min(1, {
        message: 'Selecione ao menos uma opção',
      }),
    })
  ),
});

export const GENERAL_INFO_SCHEMA = z.object({
  name: z
    .string({
      required_error: DEFAULT_MESSAGE,
    })
    .max(200, {
      message: 'Máximo de 200 caracteres',
    })
    .refine((val) => val.trim().length > 0, {
      message: DEFAULT_MESSAGE,
    }),
  shortDescription: z
    .string()
    .max(100, {
      message: 'Máximo de 100 caracteres',
    })
    .optional(),
  description: z
    .string()
    // .max(4000, {
    //   message: 'Máximo de 500 caracteres',
    // })
    .optional(),
  // eventType: z.string().optional(),
  groupLink: z
    .string()
    .max(255, {
      message: 'Máximo de 200 caracteres',
    })
    .optional(),
  hideVacancies: z.boolean().optional(),
  /**
   * Igreja dona do evento. O admin não escolhe — o backend usa a dele. Só o
   * super admin, que não pertence a nenhuma, precisa dizer para qual está
   * criando, e aí o campo vira obrigatório na tela.
   */
  churchId: z.string().optional(),
  status: EVENT_STATUS_SCHEMA,
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
      name: z
        .string({ required_error: DEFAULT_MESSAGE })
        .refine((value) => !!value),
      capacity: z.number({ required_error: DEFAULT_MESSAGE }),
      link: z
        .string()
        .max(255, {
          message: 'Máximo de 255 caracteres',
        })
        .optional()
        .nullable(),
      roles: z.array(
        z.object({
          price: z.number({ required_error: DEFAULT_MESSAGE }),
          description: z
            .string({ required_error: DEFAULT_MESSAGE })
            .refine((value) => !!value),
          registered: z.number().optional(),
          waitlisted: z.number().optional(),
        })
      ),
    })
  ),
});
export const PRODUCTS_SCHEMA = z.object({
  products: z.array(
    z
      .object({
        id: z.string().optional(),
        name: z.string().trim().min(1, DEFAULT_MESSAGE),
        description: z.string().optional().nullable(),
        // `invalid_type_error` porque o campo nasce `null` e é o tipo que falha
        price: z
          .number({
            required_error: DEFAULT_MESSAGE,
            invalid_type_error: DEFAULT_MESSAGE,
          })
          .min(0, 'O preço não pode ser negativo'),
        image: z.string().optional().nullable(),
        variants: z
          .array(
            z.object({
              id: z.string().optional(),
              name: z.string().trim().min(1, DEFAULT_MESSAGE),
              stock: z.number().int().min(0).nullable(),
              sold: z.number().optional(),
              available: z.number().nullable().optional(),
            })
          )
          .min(1, 'Adicione pelo menos uma variante'),
      })
      // mesma regra do servidor: "P" e "p" são a mesma escolha para quem compra
      .superRefine((produto, ctx) => {
        const vistos = new Set<string>();
        produto.variants.forEach((variante, index) => {
          const chave = variante.name.trim().toLocaleLowerCase('pt-BR');
          if (!chave) return;
          if (vistos.has(chave)) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              path: ['variants', index, 'name'],
              message: 'Variante repetida',
            });
          }
          vistos.add(chave);
        });
      })
  ),
});

export const EVENT_LOGO_SCHEMA = z.object({
  eventLogo: z.any().optional(),
  eventCover: z.any().optional(),
  logoUrl: z.string().optional().nullable(),
  coverUrl: z.string().optional().nullable(),
  // as cores do evento moram neste passo porque é delas que saem: a logo e a
  // capa estão aqui, e é delas que a paleta é lida
  primaryColor: z.string().optional().nullable(),
  secondaryColor: z.string().optional().nullable(),
  tertiaryColor: z.string().optional().nullable(),
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

/**
 * Os dois termos do evento, que antes moravam na etapa da capa.
 *
 * São coisas diferentes: o de menores é um arquivo em branco para o
 * responsável baixar, assinar e reenviar; o do evento é texto escrito aqui
 * mesmo, que a pessoa lê e aceita para conseguir se inscrever. Evento sem
 * texto nenhum não pede aceite nenhum.
 */
export const TERMS_SCHEMA = z.object({
  /** Termo de autorização em branco (menores de 16 anos) */
  eventTerm: z.any().optional(),
  minorTermUrl: z.string().optional().nullable(),
  /** Termo do evento, em HTML do editor */
  registrationTerm: z.string().optional().nullable(),
});

export const REGISTER_EVENT_SCHEMA = GENERAL_INFO_SCHEMA.merge(
  DATE_AND_LOCAL_SCHEMA
)
  .merge(EVENT_LOGO_SCHEMA)
  .merge(TERMS_SCHEMA)
  .merge(REGISTRATION_SETTINGS_SCHEMA);

export const OPTIONS_STATUS = [
  { value: 'ACTIVE', name: 'Ativo' },
  { value: 'INACTIVE', name: 'Inativo' },
  { value: 'TEST', name: 'Teste' },
];

/** Rótulo de cada status, usado na lista e nos cards */
export const EVENT_STATUS_LABELS: Record<string, string> = {
  ACTIVE: 'Ativo',
  INACTIVE: 'Inativo',
  TEST: 'Teste',
};
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
    label: 'Termos',
    icon: Gavel,
  },
  {
    id: 6,
    label: 'Configurações de inscrição',
    icon: Settings,
  },
  {
    id: 7,
    label: 'Produtos',
    icon: ShoppingBag,
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
    label: 'Termos',
    icon: Gavel,
  },
  {
    id: 5,
    label: 'Configurações de inscrição',
    icon: Settings,
  },
  {
    id: 6,
    label: 'Produtos',
    icon: ShoppingBag,
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
    name: 'Cursilhista',
    capacity: 100,
    roles: [{ price: 220, description: 'Participar a primeira vez' }],
  },
  {
    name: 'Cursilheiro(a)',
    capacity: 100,
    roles: [
      { price: 220, description: 'Já fez cursilho e vai trabalhar no evento' },
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
    name: 'Diária: 1º dia',
    capacity: 30,
    roles: [
      { price: 0, description: '0 a 7 anos' },
      { price: 45, description: '8 a 12 anos' },
      { price: 70, description: '13 a 20 anos' },
    ],
  },
  {
    name: 'Diária: 2º dia',
    capacity: 30,
    roles: [
      { price: 0, description: '0 a 7 anos' },
      { price: 45, description: '8 a 12 anos' },
      { price: 70, description: '13 a 20 anos' },
    ],
  },
  {
    name: 'Diária: 3º dia',
    capacity: 30,
    roles: [
      { price: 0, description: '0 a 7 anos' },
      { price: 45, description: '8 a 12 anos' },
      { price: 70, description: '13 a 20 anos' },
    ],
  },
  {
    name: 'Diária: 4º dia',
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

export const PAYMENT_STATUS = (status: PaymentStatus): string => {
  const map: Record<PaymentStatus, string> = {
    PAID: 'Pago',
    IN_ANALYSIS: 'Em análise',
    DECLINED: 'Recusado',
    CANCELED: 'Cancelado',
    WAITING: 'Aguardando',
    REFUNDED: 'Reembolsado',
  };

  return map[status];
};

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

/**
 * Por onde o dinheiro entrou — e não quem mexeu no registro.
 *
 * "Externo" sugeria uma ação; o campo fala de origem. O dicionário do log
 * (backend, `src/logs/log-diff.ts`) já lia assim, e a grade de pagamentos era
 * a única a discordar.
 */
export const PAYMENT_ORIGIN = (origem: PaymentReceived): string => {
  const map: Record<PaymentReceived, string> = {
    PENDING: 'Aguardando pagamento',
    SYSTEM: 'Gateway de pagamento',
    EXTERNAL: 'Lançamento manual',
  };

  return map[origem];
};

export const methodPaymentOptions = [
  { value: 'PIX', label: 'Pix' },
  { value: 'CREDIT_CARD', label: 'Cartão de Crédito' },
  { value: 'DEBIT_CARD', label: 'Cartão de Débito' },
  { value: 'CASH', label: 'Dinheiro' },
  { value: 'BOLETO', label: 'Boleto' },
  { value: 'OTHER', label: 'Outro' },
] as const;

export const statusPaymentOptions = [
  { value: 'PAID', label: 'Pago' },
  { value: 'IN_ANALYSIS', label: 'Em análise' },
  { value: 'DECLINED', label: 'Recusado' },
  { value: 'CANCELED', label: 'Cancelado' },
  { value: 'WAITING', label: 'Aguardando' },
  { value: 'REFUNDED', label: 'Reembolsado' },
] as const;
