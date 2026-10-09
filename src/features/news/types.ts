/** Notícia do mural, como o backend devolve. */
export interface News {
  id: string;
  title: string;
  summary?: string | null;
  content: string;
  imageUrl?: string | null;
  publishedAt?: string | null;
  createdAt: string;
  author?: { fullName: string } | null;
  /**
   * Público do anúncio: nulo é aviso geral, para todo mundo. Preenchido
   * restringe o mural a quem está no evento.
   */
  event?: { id: string; name: string } | null;
  /** Só vem na lista do admin (`/news/admin`) */
  isPublished?: boolean;
  updatedAt?: string;
  /** Grupos escolhidos como destino no WhatsApp, com o resultado do envio */
  groups?: NewsDestination[];
  /** Grupos avulsos, colados como link de convite, com o resultado do envio */
  groupLinks?: NewsGroupLink[];
  /** Agendamentos de disparo — só na lista do admin */
  schedules?: NewsSchedule[];
}

/**
 * Agendamento de disparo no WhatsApp: uma vez (`runAt`) ou toda semana
 * (`weekdays` + `time`, no horário de Brasília). Na hora marcada a notícia vai
 * para todos os grupos marcados; rascunho é publicado antes.
 */
export interface NewsSchedule {
  id?: string;
  kind: 'ONCE' | 'WEEKLY';
  runAt?: string | null;
  /** 0 = domingo … 6 = sábado */
  weekdays?: number[];
  /** "HH:mm" */
  time?: string | null;
  /** próximo disparo; nulo quando não há mais */
  nextRunAt?: string | null;
  lastRunAt?: string | null;
}

/** Calendário de disparos da tela de notícias */
export interface NewsCalendar {
  feitos: {
    id: string;
    at: string;
    origin: 'PUBLISH' | 'MANUAL' | 'SCHEDULE';
    sent: number;
    failed: number;
    noLink: number;
    news: { id: string; title: string };
  }[];
  agendados: {
    scheduleId: string;
    kind: 'ONCE' | 'WEEKLY';
    at: string;
    news: { id: string; title: string };
  }[];
}

/** Um destino da notícia: o grupo marcado e como terminou o envio. */
export interface NewsDestination {
  groupRoleId: string;
  /** null enquanto não saiu */
  sentAt: string | null;
  /** motivo da última falha */
  error: string | null;
  groupRole: {
    name: string;
    event: { name: string };
  };
}

/** Grupo de WhatsApp avulso: o link colado, que não é grupo de inscrição */
export interface NewsGroupLink {
  id: string;
  link: string;
  sentAt: string | null;
  error: string | null;
}

/** Grupo oferecido no formulário: tem link e é de evento no ar. */
export interface WhatsappTargetGroup {
  id: string;
  name: string;
  temLink: boolean;
  event: { id: string; name: string; status: string };
}

export interface NewsPayload {
  title: string;
  summary?: string;
  content: string;
  isPublished: boolean;
  /** Imagem nova; sem arquivo, a atual é mantida */
  imageFile?: File | null;
  /** Apaga a imagem atual sem colocar outra no lugar */
  removeImage?: boolean;
  /** Vazio = aviso para todos; com evento, só quem está nele vê no mural */
  eventId?: string | null;
  /** Grupos de inscrição que recebem esta notícia no WhatsApp */
  groupRoleIds?: string[];
  /** Links de convite de grupos avulsos (https://chat.whatsapp.com/...) */
  groupLinks?: string[];
  /** publicar no primeiro horário agendado, e não ao salvar */
  scheduled?: boolean;
}
