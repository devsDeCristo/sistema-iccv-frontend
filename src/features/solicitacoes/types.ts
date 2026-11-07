export type StatusDaSolicitacao =
  | 'REQUESTED'
  | 'IN_REVIEW'
  | 'AWAITING_TREASURY'
  | 'AWAITING_PASTOR'
  | 'REJECTED'
  | 'ACCEPTED'
  | 'PARTIALLY_ACCEPTED';

/** Quem decide: o pastor (líder espiritual da igreja) ou a tesouraria dela */
export type LadoDaDecisao = 'PASTOR' | 'TESOURARIA';

/** Um produto do pedido, com a decisão do admin sobre ele */
export interface ProdutoDaSolicitacao {
  id: string;
  name: string;
  quantity: number;
  /** onde ver o produto; só http(s) */
  link: string | null;
  /**
   * O resultado: `null` até o fim do trâmite; depois, `true` só se o pastor e
   * a tesouraria aprovaram o produto
   */
  accepted: boolean | null;
  /** No painel: o que o pastor e a tesouraria marcaram (`null`: não decidiu) */
  pastorAccepted?: boolean | null;
  treasuryAccepted?: boolean | null;
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

/** Quem deu uma das decisões */
interface QuemDecidiu {
  id: string;
  fullName: string;
}

/** No painel: quem pediu e as duas decisões */
export interface SolicitacaoDaIgreja extends Solicitacao {
  /** `null`: o pastor não decidiu; `true` aprovou; `false` recusou */
  pastorDecision: boolean | null;
  pastorAt: string | null;
  pastor: QuemDecidiu | null;
  treasuryDecision: boolean | null;
  treasuryAt: string | null;
  treasurer: QuemDecidiu | null;
  requester: {
    id: string;
    fullName: string;
    profilePhotoUrl: string | null;
    cellphone: string | null;
  };
}
