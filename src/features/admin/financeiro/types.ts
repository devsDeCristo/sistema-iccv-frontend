/** Os tipos do módulo financeiro — o formato do `src/financeiro` do backend */

export type TipoDeLancamento = 'INCOME' | 'EXPENSE';
export type OrigemDoLancamento = 'MANUAL' | 'PLUGGY';
export type FormaDePagamento =
  'PIX' | 'CASH' | 'CARD' | 'TRANSFER' | 'BOLETO' | 'OTHER';
export type Categoria =
  | 'TITHE'
  | 'OFFERING'
  | 'DONATION'
  | 'EVENT_INCOME'
  | 'OTHER_INCOME'
  | 'UTILITIES'
  | 'RENT'
  | 'MAINTENANCE'
  | 'SALARIES'
  | 'SUPPLIES'
  | 'MISSIONS'
  | 'EVENT_EXPENSE'
  | 'BANK_FEES'
  | 'OTHER_EXPENSE';

/**
 * Um dizimista é um membro da igreja — todo membro é um dizimista em
 * potencial —, com os números de dízimo do ano.
 */
export interface Dizimista {
  /** o id do usuário */
  id: string;
  fullName: string;
  cpf: string;
  cellphone: string;
  email: string;
  profilePhotoUrl: string | null;
  memberSince: string | null;
  family: { id: string; name: string } | null;
  /** o valor do dízimo; separa dízimo de oferta na importação do banco */
  titheAmount: number | null;
  totalNoAno: number;
  /** meses do ano com dízimo, 1 a 12 */
  mesesNoAno: number[];
  /** o dízimo de cada mês do ano, janeiro a dezembro (visão por mês) */
  porMes: number[];
  ultimoDizimo: string | null;
}

export interface ListaDeDizimistas {
  ano: number;
  resumo: {
    membros: number;
    dizimaramNoMes: number;
    dizimaramNoAno: number;
    totalNoMes: number;
    totalNoAno: number;
    /** o total da igreja em cada mês do ano, janeiro a dezembro */
    porMes: number[];
  };
  dizimistas: Dizimista[];
}

export interface Lancamento {
  id: string;
  type: TipoDeLancamento;
  category: Categoria;
  amount: number;
  /** "2026-10-03" */
  date: string;
  description: string;
  method: FormaDePagamento | null;
  source: OrigemDoLancamento;
  bankAccount: string | null;
  payerName: string | null;
  user: { id: string; fullName: string } | null;
  /** já conciliado com o seu par (banco ↔ manual) */
  conciliado: boolean;
  /** o id do par, do lado de lá */
  conciliadoCom: string | null;
  createdAt: string;
}

export interface ListaDeLancamentos {
  de: string;
  ate: string;
  resumo: { entradas: number; saidas: number; saldo: number; dizimos: number };
  lancamentos: Lancamento[];
  cortado: boolean;
}

export interface FiltrosDeLancamento {
  de: string;
  ate: string;
  type?: TipoDeLancamento;
  category?: Categoria;
  source?: OrigemDoLancamento;
  busca?: string;
  conciliacao?: 'conciliado' | 'pendente';
}

export interface LancamentoPayload {
  type: TipoDeLancamento;
  category: Categoria;
  amount: number;
  date: string;
  description: string;
  method: FormaDePagamento | null;
  userId: string | null;
}

export interface ResultadoDaImportacao {
  de: string;
  ate: string;
  lidas: number;
  importadas: number;
  jaExistiam: number;
}

/** Como uma linha do diff da conciliação está */
export type EstadoDaLinha =
  'conciliado' | 'sugerido' | 'so_banco' | 'so_manual';

export interface LinhaDaConciliacao {
  estado: EstadoDaLinha;
  banco: Lancamento | null;
  manual: Lancamento | null;
}

export interface Conciliacao {
  de: string;
  ate: string;
  resumo: {
    conciliados: number;
    sugeridos: number;
    soBanco: number;
    soManual: number;
    /** saldo (entradas − saídas) do que só está de um lado */
    valorSoBanco: number;
    valorSoManual: number;
  };
  linhas: LinhaDaConciliacao[];
}
