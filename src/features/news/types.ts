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
}
