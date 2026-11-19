export interface Oportunidade {
  id: string;
  title: string;
  /** quem oferece: a própria igreja ou a empresa de um membro */
  company: string;
  description: string;
  location: string | null;
  /** encerrada: some para os membros e não recebe interesse */
  isOpen: boolean;
  createdAt: string;
  updatedAt: string;
}

/** Na tela do membro: se ele já demonstrou interesse */
export interface OportunidadeDoMembro extends Oportunidade {
  interessei: boolean;
}

export interface Interessado {
  createdAt: string;
  user: {
    id: string;
    fullName: string;
    email: string;
    cellphone: string | null;
    profilePhotoUrl: string | null;
  };
}

/** No painel: quem publicou e quem se interessou */
export interface OportunidadeDaIgreja extends Oportunidade {
  createdBy: { id: string; fullName: string } | null;
  interests: Interessado[];
}

/** O que o formulário manda; na edição parcial, qualquer parte */
export interface DadosDaOportunidade {
  titulo: string;
  empresa: string;
  descricao: string;
  local: string;
  aberta?: boolean;
}
