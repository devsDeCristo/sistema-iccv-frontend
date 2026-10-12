/**
 * Tesourarias de eventos e de congregações: os tipos e as contas que a tela
 * faz sobre o que a API devolve (`api.ts`). As regras — distribuir, conciliar,
 * fechar, quem pode o quê — estão no servidor (`TesourariasService`).
 *
 * O modelo é o de uma conta por tesouraria: a de Eventos e a de Congregações
 * têm os seus bancos (a divisão da Pluggy, em Configurações › Integrações), e
 * cada movimento é **alocado** na tesouraria do evento (ou da congregação) a
 * que pertence — inteiro, ou em partes quando serve a mais de uma (rateio).
 * Sem a divisão, elas distribuem da conta única, a da Administrativa.
 */

export type TipoDoLancamento = 'INCOME' | 'EXPENSE';

/** De onde veio um lançamento do sistema (o do banco é `BANCO`) */
export type OrigemNoSistema = 'INSCRICAO' | 'PRODUTO' | 'MANUAL';

/** Como o lançamento do sistema está diante do extrato */
export type SituacaoNoBanco = 'CONCILIADO' | 'A_CONCILIAR' | 'NAO_CONSTA';

/** O tipo da tesouraria, como a API chama */
export type TipoDaTesouraria = 'EVENT' | 'CONGREGATION';

/** A conta de onde a tesouraria distribui */
export type ContaDaTesouraria = 'ADMINISTRATIVA' | 'EVENTOS' | 'CONGREGACOES';

/** Um lançamento como os totais e a tabela de Lançamentos o veem */
export interface LancamentoDaTesouraria {
  id: string;
  tesourariaId: string;
  tipo: TipoDoLancamento;
  categoria: string;
  descricao: string;
  valor: number;
  /** "2026-10-03" */
  data: string;
  origem: OrigemNoSistema | 'BANCO';
  /** O banco de onde veio (o do extrato, ou o do movimento conciliado) */
  banco: string | null;
  /** Só nos do sistema */
  situacao: SituacaoNoBanco | null;
}

export const ROTULO_DA_ORIGEM: Record<OrigemNoSistema | 'BANCO', string> = {
  INSCRICAO: 'Inscrição',
  PRODUTO: 'Produto',
  MANUAL: 'Manual',
  BANCO: 'Extrato',
};

export const ROTULO_DA_SITUACAO: Record<SituacaoNoBanco, string> = {
  CONCILIADO: 'Conciliado',
  A_CONCILIAR: 'A conciliar',
  NAO_CONSTA: 'Não consta no banco',
};

export const centavos = (valor: number) => Math.round(valor * 100) / 100;

/** Entradas menos saídas */
export const saldoDe = (itens: { tipo: TipoDoLancamento; valor: number }[]) =>
  centavos(
    itens.reduce(
      (soma, i) => soma + (i.tipo === 'INCOME' ? i.valor : -i.valor),
      0
    )
  );

/**
 * Fechar a tesouraria é dar as contas dela por encerradas: nada mais entra,
 * sai ou muda. Fecham (e reabrem) o admin e a tesouraria da igreja.
 */
export interface Fechamento {
  /** "2026-09-15" */
  em: string;
  por: string;
}

export interface Resumo {
  entradas: number;
  saidas: number;
  saldo: number;
}

/** Uma tesouraria (de evento ou de congregação), como a lista e o cabeçalho */
export interface Tesouraria {
  id: string;
  tipo: TipoDaTesouraria;
  /** O nome do evento ou da congregação */
  nome: string;
  /** O evento do sistema; nulo é evento fora do sistema, ou congregação */
  eventoId: string | null;
  /** "07 a 10/08/2026"; vazio sem data */
  periodo: string;
  /** Bairro, distrito ou cidade (congregação) */
  local: string | null;
  fechamento: Fechamento | null;
}

export type TesourariaNaLista = Tesouraria & { resumo: Resumo };

export interface DetalheDaTesouraria extends Tesouraria {
  conta: ContaDaTesouraria;
  /** "Sicredi", "PagBank": os bancos da conta */
  bancos: string[];
  /** A conta tem banco só dela (a divisão da Pluggy) */
  temBancoProprio: boolean;
  /** Admin e tesouraria da igreja fecham; o tesoureiro do evento não */
  podeFechar: boolean;
}

/** Um movimento da conta, como a Pluggy trouxe e ficou salvo */
export interface MovimentoDaConta {
  id: string;
  conta: ContaDaTesouraria;
  banco: string;
  tipo: TipoDoLancamento;
  descricao: string;
  /** Quem pagou, quando o banco diz */
  pagador: string | null;
  valor: number;
  /** "2026-10-03" */
  data: string;
  codigo: string | null;
}

/** Quanto de um movimento foi para uma tesouraria */
export interface Alocacao {
  id: string;
  movimentoId: string;
  tesourariaId: string;
  valor: number;
  /** Nula até alguém classificar: aparece como "Sem categoria" */
  categoria: string | null;
}

/** Um movimento com o que ainda falta alocar dele */
export interface LinhaLivre {
  movimento: MovimentoDaConta;
  restante: number;
}

/** O que a conta ainda não distribuiu (a lista de não alocados) */
export interface NaoAlocados {
  conta: ContaDaTesouraria;
  bancos: string[];
  temBancoProprio: boolean;
  movimentos: LinhaLivre[];
}

/**
 * O que o evento registrou antes de o dinheiro aparecer no banco: os
 * pagamentos das inscrições e dos produtos e os lançamentos manuais. O id é
 * `pagamento:<id>` ou `manual:<id>`.
 */
export interface LancamentoDoSistema {
  id: string;
  tesourariaId: string;
  origem: OrigemNoSistema;
  tipo: TipoDoLancamento;
  categoria: string;
  descricao: string;
  valor: number;
  /** "2026-10-03" */
  data: string;
  /** Pix, Cartão, Dinheiro… */
  forma: string | null;
  /** A referência do checkout, no pago pelo site; nula na baixa manual */
  codigo: string | null;
}

export const SEM_CATEGORIA = 'Sem categoria';

/** As categorias que uma alocação (ou um lançamento manual) pode receber */
export const CATEGORIAS: Record<
  TipoDaTesouraria,
  Record<TipoDoLancamento, string[]>
> = {
  EVENT: {
    INCOME: [
      'Ingressos',
      'Produtos',
      'Doações',
      'Patrocínio',
      'Outras entradas',
    ],
    EXPENSE: [
      'Hospedagem',
      'Alimentação',
      'Transporte',
      'Materiais',
      'Som e decoração',
      'Tarifas',
      'Outras saídas',
    ],
  },
  CONGREGATION: {
    INCOME: ['Ofertas', 'Campanhas', 'Doações', 'Outras entradas'],
    EXPENSE: [
      'Aluguel',
      'Água e luz',
      'Manutenção',
      'Limpeza',
      'Ação social',
      'Outras saídas',
    ],
  },
};

/**
 * Como uma linha da conciliação está, como na Administrativa. `sugerido` é o
 * movimento com o lançamento de mesmo valor e data próxima, para confirmar.
 */
export type EstadoDaLinha =
  'sugerido' | 'so_banco' | 'so_evento' | 'nao_consta' | 'conciliado';

/** O lado direito: um lançamento da tesouraria */
export type LadoDaTesouraria =
  /** pagamento ou manual do evento */
  | {
      de: 'sistema';
      situacao: SituacaoNoBanco;
      lancamento: LancamentoDoSistema;
      automatica: boolean;
    }
  /** o movimento trazido do banco, que é ele mesmo o lançamento */
  | { de: 'extrato'; alocacao: Alocacao };

export interface LinhaDaConciliacao {
  chave: string;
  estado: EstadoDaLinha;
  /** O lado esquerdo: o movimento do banco e quanto dele está nesta linha */
  banco: { movimento: MovimentoDaConta; valor: number } | null;
  /** O banco é o mesmo da linha de cima (um movimento, vários lançamentos) */
  continua: boolean;
  tesouraria: LadoDaTesouraria | null;
}

export interface ConciliacaoDaTesouraria {
  conta: ContaDaTesouraria;
  bancos: string[];
  temBancoProprio: boolean;
  linhas: LinhaDaConciliacao[];
  /** Os lançamentos do sistema ainda sem banco: o fechamento avisa deles */
  aConciliar: { quantos: number; saldo: number };
}

/** "Sicredi e PagBank"; "o banco" sem nenhum ainda */
export const nomeDosBancos = (bancos: string[]) =>
  bancos.length
    ? bancos.length === 1
      ? bancos[0]
      : `${bancos.slice(0, -1).join(', ')} e ${bancos[bancos.length - 1]}`
    : 'o banco';

export function resumir(lancamentos: LancamentoDaTesouraria[]): Resumo {
  let entradas = 0;
  let saidas = 0;
  for (const l of lancamentos) {
    if (l.tipo === 'INCOME') entradas += l.valor;
    else saidas += l.valor;
  }
  return {
    entradas: centavos(entradas),
    saidas: centavos(saidas),
    saldo: centavos(entradas - saidas),
  };
}

/** Total por categoria de um tipo, do maior para o menor */
export function porCategoria(
  lancamentos: LancamentoDaTesouraria[],
  tipo: TipoDoLancamento
) {
  const totais = new Map<string, number>();
  for (const l of lancamentos) {
    if (l.tipo !== tipo) continue;
    totais.set(l.categoria, (totais.get(l.categoria) ?? 0) + l.valor);
  }
  return [...totais]
    .map(([categoria, total]) => ({ categoria, total: centavos(total) }))
    .sort((a, b) => b.total - a.total);
}
