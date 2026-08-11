export type CheckinStatus = 'PENDING' | 'QUEUED' | 'IN_PROGRESS' | 'DONE';

export interface CheckinParticipant {
  userId: string;
  fullName: string;
  badgeName: string | null;
  profilePhotoUrl: string | null;
  registrationNumber: number;
  cpf: string;
  cellphone: string;
  city: string;
  /** Funções da inscrição (ex.: "Participar a primeira vez") */
  roles: string[];
  /** Grupos das funções (ex.: "Cursilhista") */
  groups: string[];
  bedroom: string | null;
  teams: { name: string; role: 'LEADER' | 'MEMBER' }[];
  status: CheckinStatus;
  badgeDeliveredAt: string | null;
  calledAt: string | null;
  doneAt: string | null;
  notes: string | null;
  badgeDeliveredBy: string | null;
  calledBy: string | null;
  doneBy: string | null;
}

export interface CheckinQueue {
  /** Já retiraram o crachá e aguardam a foto */
  waiting: CheckinParticipant[];
  /** Sendo atendidos no posto de foto agora */
  inProgress: CheckinParticipant[];
}

export interface CheckinStats {
  total: number;
  pending: number;
  queued: number;
  inProgress: number;
  done: number;
}
