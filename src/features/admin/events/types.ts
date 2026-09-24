import { User, UserTeam } from '../../../types/user';
import { z } from 'zod';
import { ChurchStatus } from '../churches/constants';
import {
  CATEGORY_EVENT_SCHEMA,
  DATE_AND_LOCAL_SCHEMA,
  EVENT_LOGO_SCHEMA,
  GENERAL_INFO_SCHEMA,
  GROUP_ROLE_SELECT_SCHEMA,
  REGISTER_EVENT_SCHEMA,
  PRODUCTS_SCHEMA,
  REGISTRATION_SETTINGS_SCHEMA,
  ROLE_SELECT_SCHEMA,
  MODULES_SCHEMA,
  TERMS_SCHEMA,
} from './constants';
export type EventType = 'CURSILHO' | 'RETIRO';

/**
 * Estado de publicação do evento (espelha `EventStatus` no backend).
 * `TEST` é ensaio: o backend só devolve esses eventos para admin e super admin.
 */
export type EventStatus = 'ACTIVE' | 'INACTIVE' | 'TEST';

export type EventStatusFilter = 'active' | 'inactive' | 'test' | 'all';
export interface EventDetails {
  id: string;
  name: string;
  /** igreja dona do evento — só o super admin escolhe e altera */
  churchId?: string;
  /**
   * O módulo de cobrança da igreja dona do evento.
   *
   * Substituiu o `VITE_MODULE_PAYMENT`, que era do front inteiro. Opcional
   * porque nem toda rota de evento traz a igreja junto; quem lê assume ligado
   * na ausência, que é o padrão da coluna — e quem manda mesmo é o servidor,
   * que recusa o checkout com 503 de qualquer jeito.
   */
  church?: {
    modulePayment: boolean;
    /**
     * A igreja recebe pagamento pelo site: módulo ligado **e** gateway ativo.
     * Só o módulo não basta — sem gateway o checkout devolve 503.
     */
    chargesOnline?: boolean;
  };
  startDate: Date;
  endDate: Date;
  groupLink?: string;
  status: EventStatus;
  data: EventDataJson;
  type: EventType;
  groupRoles: GroupRole[];
  /** produtos vendidos na inscrição; o preço é do produto, não da variante */
  products?: EventProduct[];
  createdAt: Date;
  updateAt: Date;
}

export interface PayLoadGroup {
  present: Group[];
  waitlist: Group[];
}
export interface Group {
  id: string;
  name: string;
  capacity: number;
  eventId: string;
  link?: string | null;
}
export interface Event {
  id: string;
  type: EventType;
  name: string;
  startDate: Date;
  endDate: Date;
  status: EventStatus;
  bedroom: number;
  team: number;
  waitlist: number;
  users: number;
  capacity: number;
  /** grupos de inscrição com link de WhatsApp — quantos recebem disparo */
  whatsappGroups?: number;
  /**
   * Igreja dona do evento. O nome interessa ao super admin, que vê eventos de
   * todas; a situação é o que o filtro da home usa para oferecer só as ativas.
   */
  church?: { id: string; name: string; status?: ChurchStatus } | null;
  data: EventDataJson;
}
export interface filterUsers {
  birthday: { startDate: string | null; endDate: string | null };
  city: string | null;
  neighborhood: string | null;
  worker?: boolean;
}

/**
 * Transporte do evento — o ônibus, a van, o carro que leva o grupo.
 *
 * Mesmo formato do quarto: capacidade, tags e restrição por grupo de inscrição.
 * O problema é o mesmo, encaixar pessoas em lugares que têm limite.
 */
export interface Transport {
  id: string;
  name: string;
  capacity: number;
  tag: String[];
  /** Grupos de inscrição que podem ocupar o transporte. Vazio = aberto. */
  groupTags?: string[];
  note: string | null;
  event: Event;
  users: User[];
}

export interface Bedroom {
  id: string;
  name: string;
  capacity: number;
  tag: String[];
  /**
   * Grupos de inscrição que podem ocupar o quarto. Vazio = quarto aberto a
   * qualquer inscrito; preenchido = restrito, e o check-in só aloca aqui quem
   * for de um desses grupos.
   */
  groupTags?: string[];
  note: string | null;
  event: Event;
  users: User[];
}

export interface Team {
  id: string;
  name: string;
  event: EventDetails;
  users: UserTeam[];
  note: string | null;
  capacity: number;
  capacityWorker: number;
  price: number;
  workerPrice: number;
  groupLink?: string;
}
export interface GroupRole {
  id?: string;
  name: string;
  capacity: number;
  /** link do grupo (ex: whatsapp) — visível para quem está inscrito nele */
  link?: string | null;
  // expanded: boolean;
  roles: {
    id?: string;
    price: number;
    description: string;
    registered?: number;
    waitlisted?: number;
  }[];
}

export interface EventProductVariant {
  id?: string;
  name: string;
  /** unidades à venda; `null` é sem limite */
  stock: number | null;
  /** unidades já reservadas em pagamentos que valem — só leitura */
  sold?: number;
  /** quanto ainda dá para vender; `null` é sem limite — só leitura */
  available?: number | null;
}

export interface EventProduct {
  id?: string;
  name: string;
  description?: string | null;
  price: number;
  /** data URL base64 da foto */
  image?: string | null;
  variants: EventProductVariant[];
}

/** Um produto comprado, como volta nas listas de pagamento */
export interface PaymentProductItem {
  id: string;
  quantity: number;
  unitPrice: number;
  variant: { id: string; name: string; product: { id: string; name: string } };
}

export interface EventDataJson {
  description?: string;
  shortDescription?: string;
  localName?: string;
  zipCode?: string;
  state?: string;
  city?: string;
  neighborhood?: string;
  address?: string;
  number?: string;
  linkMaps?: string;
  logoUrl?: string;
  logoBase64?: string;
  /** paleta do evento, lida da logo e da capa ou escolhida à mão */
  colors?: { primary?: string; secondary?: string; tertiary?: string };
  /**
   * Módulos ligados no evento. Ausente é tudo ligado — ver
   * `features/admin/events/eventModules.ts`.
   */
  modules?: { bedrooms?: boolean; teams?: boolean; transport?: boolean };
  coverUrl?: string;
  coverBase64?: string;
  hideVacancies?: boolean;
  /** Termo de autorização em branco, para pais de menores de 16 anos baixarem e assinarem */
  minorTermUrl?: string;
  /**
   * Termo do evento em HTML: o texto que a pessoa precisa aceitar para se
   * inscrever. Ausente ou vazio significa evento sem termo — a inscrição segue
   * direto, como sempre foi.
   */
  registrationTerm?: string;
}
export interface CreateEventPayload {
  name: string;
  groupLink?: string;
  /** só o super admin manda: os demais herdam a igreja do próprio perfil */
  churchId?: string;
  status: EventStatus;
  startDate: Date;
  endDate: Date;
  groupRoles: GroupRole[];
  products?: EventProduct[];
  data: EventDataJson;
  type: EventType;
}

export type SelectGroupRoleFormType = z.infer<typeof GROUP_ROLE_SELECT_SCHEMA>;

export type SelectRoleFormType = z.infer<typeof ROLE_SELECT_SCHEMA>;

export type RegisterEventFormType = z.infer<typeof REGISTER_EVENT_SCHEMA>;

export type GeneralInfoFormType = z.infer<typeof GENERAL_INFO_SCHEMA>;

export type DateAndLocalFormType = z.infer<typeof DATE_AND_LOCAL_SCHEMA>;

export type EventLogoFormType = z.infer<typeof EVENT_LOGO_SCHEMA>;

export type ModulesFormType = z.infer<typeof MODULES_SCHEMA>;

export type TermsFormType = z.infer<typeof TERMS_SCHEMA>;

export type RegistrationSettingsFormType = z.infer<
  typeof REGISTRATION_SETTINGS_SCHEMA
>;
export type ProductsFormType = z.infer<typeof PRODUCTS_SCHEMA>;
export type CategoryEventFormType = z.infer<typeof CATEGORY_EVENT_SCHEMA>;
