export type StatusDaSolicitacao =
  'REQUESTED' | 'IN_REVIEW' | 'REJECTED' | 'ACCEPTED';

export interface Solicitacao {
  id: string;
  ministry: string;
  title: string;
  description: string;
  /** onde ver o produto pedido; só http(s) */
  link: string | null;
  status: StatusDaSolicitacao;
  /** o que o admin respondeu (o motivo, o prazo) */
  response: string | null;
  createdAt: string;
  updatedAt: string;
}

/** Na tela do membro: a igreja a que pediu */
export interface MinhaSolicitacao extends Solicitacao {
  church: { id: string; name: string };
}

/** No painel: quem pediu */
export interface SolicitacaoDaIgreja extends Solicitacao {
  requester: {
    id: string;
    fullName: string;
    profilePhotoUrl: string | null;
    cellphone: string | null;
  };
}
