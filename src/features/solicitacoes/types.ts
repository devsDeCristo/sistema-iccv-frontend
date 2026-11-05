export type StatusDaSolicitacao =
  'REQUESTED' | 'IN_REVIEW' | 'REJECTED' | 'ACCEPTED' | 'PARTIALLY_ACCEPTED';

/** Um produto do pedido, com a decisão do admin sobre ele */
export interface ProdutoDaSolicitacao {
  id: string;
  name: string;
  quantity: number;
  /** onde ver o produto; só http(s) */
  link: string | null;
  /** `null`: ainda sem decisão (solicitado, em análise) */
  accepted: boolean | null;
}

export interface Solicitacao {
  id: string;
  ministry: string;
  title: string;
  description: string;
  /** os produtos, na ordem em que a pessoa listou */
  items: ProdutoDaSolicitacao[];
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
