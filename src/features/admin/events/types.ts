import { User, UserTeam } from '../../../types/user';
import { z } from 'zod';
import {
  CATEGORY_EVENT_SCHEMA,
  DATE_AND_LOCAL_SCHEMA,
  EVENT_LOGO_SCHEMA,
  GENERAL_INFO_SCHEMA,
  GROUP_ROLE_SELECT_SCHEMA,
  REGISTER_EVENT_SCHEMA,
  REGISTRATION_SETTINGS_SCHEMA,
  ROLE_SELECT_SCHEMA,
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
  startDate: Date;
  endDate: Date;
  groupLink?: string;
  status: EventStatus;
  data: EventDataJson;
  type: EventType;
  groupRoles: GroupRole[];
  createdAt: Date;
  updateAt: Date;
}

export interface PayLoadGroup {
  present:Group[];
  waitlist:Group[];
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
  data:EventDataJson
}
export interface filterUsers {
  birthday: { startDate: string | null; endDate: string | null };
  city: string | null;
  neighborhood: string | null;
  worker?: boolean;
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
  coverUrl?: string;
  coverBase64?: string;
  hideVacancies?: boolean;
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
  data: EventDataJson;
  type: EventType;
}

export type SelectGroupRoleFormType = z.infer<typeof GROUP_ROLE_SELECT_SCHEMA>;

export type SelectRoleFormType = z.infer<typeof ROLE_SELECT_SCHEMA>;

export type RegisterEventFormType = z.infer<typeof REGISTER_EVENT_SCHEMA>;

export type GeneralInfoFormType = z.infer<typeof GENERAL_INFO_SCHEMA>;

export type DateAndLocalFormType = z.infer<typeof DATE_AND_LOCAL_SCHEMA>;

export type EventLogoFormType = z.infer<typeof EVENT_LOGO_SCHEMA>;

export type RegistrationSettingsFormType = z.infer<
  typeof REGISTRATION_SETTINGS_SCHEMA
>;
export type CategoryEventFormType = z.infer<typeof CATEGORY_EVENT_SCHEMA>;
