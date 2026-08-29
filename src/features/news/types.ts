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
  /** Só vem na lista do admin (`/news/admin`) */
  isPublished?: boolean;
  updatedAt?: string;
  /** Grupos escolhidos como destino no WhatsApp, com o resultado do envio */
  groups?: NewsDestination[];
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
  /** Grupos de inscrição que recebem esta notícia no WhatsApp */
  groupRoleIds?: string[];
}
