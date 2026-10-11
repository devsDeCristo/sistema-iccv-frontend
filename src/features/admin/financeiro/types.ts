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

export interface UsuarioDoDizimista {
  id: string;
  fullName: string;
  cpf: string;
  cellphone: string;
  email: string;
  profilePhotoUrl: string | null;
}

export interface Dizimista {
  id: string;
  active: boolean;
  /** "2024-03-01" */
  since: string | null;
  notes: string | null;
  /** o dízimo combinado; separa dízimo de oferta na importação do banco */
  expectedAmount: number | null;
  user: UsuarioDoDizimista;
  totalNoAno: number;
  /** meses do ano com dízimo, 1 a 12 */
  mesesNoAno: number[];
  ultimoDizimo: string | null;
}

export interface ListaDeDizimistas {
  ano: number;
  resumo: {
    ativos: number;
    dizimaramNoMes: number;
    totalNoMes: number;
    totalNoAno: number;
  };
  dizimistas: Dizimista[];
}

/** Resultado da busca de quem adicionar: CPF vem pela metade */
export interface UsuarioEncontrado {
  id: string;
  fullName: string;
  cpf: string;
  profilePhotoUrl: string | null;
  jaDizimista: boolean;
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
