import { EventStatus } from '../events/types';

/**
 * Formato da home. `church` é o painel de quem administra uma igreja (admin e
 * financeiro); `system` é o de quem atravessa todas (super admin e dev).
 */
export type DashboardScope = 'church' | 'system';

/** Em que ponto o evento está, contando o dia inteiro nas duas pontas. */
export type EventPhase = 'ongoing' | 'upcoming' | 'finished';

/** Uma igreja da pessoa, com o perfil que ela tem *nela* */
export interface DashboardChurch {
  id: string;
  name: string;
  role: number | null;
}

/**
 * Ocupação de um grupo de inscrição. É onde "lotado" quer dizer alguma coisa:
 * a capacidade é definida por grupo, não pelo evento.
 */
export interface EventGroup {
  id: string;
  name: string;
  /** `null` quando o grupo não tem teto configurado */
  capacity: number | null;
  taken: number;
}

export interface EventFinance {
  paid: { count: number; amount: number };
  inAnalysis: { count: number; amount: number };
  waiting: { count: number; amount: number };
  /** Cobrado e ainda válido — recusado, cancelado e estornado ficam de fora */
  expected: number;
}

export interface DashboardEvent {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  status: EventStatus;
  church: { id: string; name: string };
  phase: EventPhase;
  /** Pessoas distintas inscritas */
  people: number;
  /**
   * Vagas ocupadas e totais. A ocupada é a inscrição por tipo, e não a pessoa:
   * quem se inscreve em dois grupos ocupa duas vagas. `total` nulo é evento sem
   * capacidade configurada.
   */
  seats: { taken: number; total: number | null };
  groups: EventGroup[];
  waitlist: number;
  finance: EventFinance;
  /**
   * Inscrições na última semana e na anterior. É o número que muda a leitura
   * de todos os outros: "9 de 200 vagas" não diz se o evento está enchendo
   * devagar ou parado — uma inscrição na semana diz.
   */
  pace: { last7: number; previous7: number };
  /** Nulo enquanto o check-in não começou */
  checkin: { done: number; total: number } | null;
}

/** Alguém que acabou de se inscrever, com o evento em que entrou. */
export interface RecentRegistration {
  userId: string;
  name: string;
  photoUrl: string | null;
  eventId: string;
  eventName: string;
  createdAt: string;
}

export interface NewsBoardItem {
  id: string;
  title: string;
  publishedAt: string | null;
  /** Nulo é aviso geral; preenchido restringe o mural ao evento */
  eventName: string | null;
}

export interface NewsBoard {
  items: NewsBoardItem[];
  /** Escritas e não publicadas — as que somem da lista sem ninguém notar */
  drafts: number;
}

/** Uma tarefa, sempre com o endereço do evento em que ela apareceu. */
export interface DashboardPending {
  kind: 'receipts' | 'waitlist';
  eventId: string;
  eventName: string;
  churchName: string;
  count: number;
  /** Só em `receipts`: quanto está parado esperando conferência */
  amount?: number;
  /** Só em `waitlist`: quantas vagas há para chamar alguém */
  seatsOpen?: number;
}

/** Uma igreja vista de cima, com o evento em foco dela. */
export interface DashboardChurchRow {
  id: string;
  name: string;
  /** Quem entra no painel dela — inscrito não pertence a igreja nenhuma */
  admins: number;
  totalEvents: number;
  /** Inscrições em eventos dela, somando toda a história */
  registrations: number;
  openEvents: number;
  spotlight: {
    id: string;
    name: string;
    startDate: string;
    phase: EventPhase;
    people: number;
    seats: { taken: number; total: number | null };
  } | null;
}

/**
 * Indicadores do sistema, só na home do dev.
 *
 * `topActors` é movimento, e não acesso: o sistema não registra login em lugar
 * nenhum — a tabela de logs guarda escritas. O rótulo da tela diz isso.
 */
/**
 * O panorama do super admin: o conjunto, não a operação. Só ele recebe — o
 * dev tem os indicadores de funcionamento, e quem administra uma igreja tem
 * o evento dela.
 */
export interface DashboardPanorama {
  /**
   * Ações por igreja, atribuídas pelo vínculo de quem executou — admin e
   * financeiro. Super admin e dev não entram: não pertencem a igreja nenhuma.
   */
  churchActivity: { churchId: string; total: number }[];
  activityWindowDays: number;
  users: {
    total: number;
    newThisMonth: number;
    /** Novos cadastros por mês, 12 meses */
    byMonth: { key: string; total: number }[];
    /** Composição da base por perfil */
    byRole: { role: number; total: number }[];
    /** Cadastrou-se e nunca entrou em evento nenhum, nem na lista de espera */
    neverRegistered: number;
    /**
     * Vinculadas a alguma igreja. Super admin e dev ficam fora de propósito:
     * eles não têm vínculo, atravessam todas.
     */
    withChurchLink: number;
  };
}

export interface DashboardInsights {
  registrationsByMonth: { key: string; total: number }[];
  activityByDay: { key: string; total: number }[];
  /**
   * Tentativas de entrada por dia. A tabela que alimenta isto nasceu com a
   * migration que a criou — dia anterior a ela vem zerado porque não há
   * registro, e não porque ninguém entrou.
   */
  loginsByDay: { key: string; success: number; failure: number }[];
  topChurches: {
    id: string;
    name: string;
    events: number;
    registrations: number;
  }[];
  topActors: {
    id: string;
    name: string;
    photoUrl: string | null;
    role: number | null;
    actions: number;
  }[];
  /** Janela de `topActors`, em dias */
  windowDays: number;
}

/**
 * O eixo da resposta é o evento, e não o sistema: cada número mora dentro do
 * evento a que pertence. Bloco `null` é "não é da sua alçada", e não "zerado".
 */
export interface Dashboard {
  scope: DashboardScope;
  role: number | null;
  churches: DashboardChurch[] | null;
  /** O evento que merece a tela: em andamento > próximo > último encerrado */
  spotlight: DashboardEvent | null;
  /**
   * `null` na home do dev: a lista de igrejas já mostra o evento em foco de
   * cada uma, e a dele é de operação, não de um evento em particular.
   */
  otherEvents: DashboardEvent[] | null;
  pending: DashboardPending[];
  /** `null` na home do dev — quem entrou numa igreja é assunto de quem a administra */
  recentRegistrations: RecentRegistration[] | null;
  /** Só o admin: publicar notícia não é do financeiro nem do super admin */
  news: NewsBoard | null;
  byChurch: DashboardChurchRow[] | null;
  /** Só o super admin */
  panorama: DashboardPanorama | null;
  /** Só o dev */
  insights: DashboardInsights | null;
}
