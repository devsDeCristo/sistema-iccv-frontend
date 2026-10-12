/**
 * Tesourarias de eventos e de congregações — MVP com dados de exemplo.
 *
 * O modelo é o de uma conta por tesouraria: a tesouraria de Eventos tem os
 * seus bancos (Sicredi e PagBank, aqui), e a de Congregações os dela (uma
 * conta só para todas as congregações). O extrato chega pelo Pluggy e fica
 * salvo, e cada movimento é **alocado** na tesouraria do evento (ou da
 * congregação) a que pertence — inteiro, ou em partes quando serve a mais de
 * uma (rateio). O que não foi alocado em nenhuma (uma tarifa do banco, por
 * exemplo) fica "não alocado".
 *
 * O evento tem também os lançamentos **do sistema**: os pagamentos das
 * inscrições e dos produtos, e os lançamentos manuais (o dinheiro em
 * espécie). Eles são registrados antes de o dinheiro aparecer no banco, e a
 * conciliação liga cada um ao movimento do extrato que é o mesmo dinheiro —
 * sozinha, quando o pagamento tem o código da transação; à mão, quando foi
 * baixa manual. O que nunca vai passar pelo banco fica "não consta no banco".
 *
 * ponytail: tudo aqui é mock, guardado em memória — o que se cria, aloca,
 * concilia ou fecha some ao recarregar a página. Quando virar dado de
 * verdade, este arquivo vira o `api.ts` (hooks) e as contas passam para o
 * servidor.
 */

export type TipoDoLancamento = 'INCOME' | 'EXPENSE';

/** De onde veio um lançamento do sistema (o do banco é `BANCO`) */
export type OrigemNoSistema = 'INSCRICAO' | 'PRODUTO' | 'MANUAL';

/** Como o lançamento do sistema está diante do extrato */
export type SituacaoNoBanco = 'CONCILIADO' | 'A_CONCILIAR' | 'NAO_CONSTA';

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

// ---- fechamento ------------------------------------------------------------------

/**
 * Fechar a tesouraria é dar as contas dela por encerradas: nada mais entra,
 * sai ou muda de categoria. Não é o fim do evento — o fechamento vem bem
 * depois, quando o dinheiro todo assentou. Fecham (e reabrem) o admin e a
 * tesouraria da igreja — o tesoureiro(a) do evento não; vale igual para
 * evento e congregação.
 */
export interface Fechamento {
  /** "2026-09-15" */
  em: string;
  por: string;
}

const fechamentos = new Map<string, Fechamento>([
  ['cursilho-48', { em: '2026-09-15', por: 'Pr. Carlos Andrade' }],
]);

export const fechamentoDa = (tesourariaId: string) =>
  fechamentos.get(tesourariaId) ?? null;

export const fecharTesouraria = (tesourariaId: string, por: string) =>
  fechamentos.set(tesourariaId, {
    em: new Date().toISOString().slice(0, 10),
    por,
  });

export const reabrirTesouraria = (tesourariaId: string) =>
  fechamentos.delete(tesourariaId);

// ---- tesourarias de evento -------------------------------------------------------

export interface EventoDoSistema {
  id: string;
  nome: string;
  periodo: string;
}

export interface TesourariaDeEvento {
  id: string;
  nome: string;
  /** O evento do sistema; nulo é evento fora do sistema (um jantar, uma rifa) */
  eventoId: string | null;
  periodo: string;
}

/** Os eventos cadastrados na igreja, para ligar uma tesouraria a um deles */
export const EVENTOS_DO_SISTEMA: EventoDoSistema[] = [
  {
    id: 'ev-retiro-2027',
    nome: 'Retiro de Carnaval 2027',
    periodo: '13 a 16/02/2027',
  },
  {
    id: 'ev-casais-2026',
    nome: 'Encontro de Casais 2026',
    periodo: '19 e 20/09/2026',
  },
  {
    id: 'ev-cursilho-48',
    nome: 'Cursilho Masculino nº 48',
    periodo: '07 a 10/08/2026',
  },
  {
    id: 'ev-cursilho-f31',
    nome: 'Cursilho Feminino nº 31',
    periodo: '06 a 09/11/2026',
  },
  {
    id: 'ev-jovens-2027',
    nome: 'Acampamento de Jovens 2027',
    periodo: '10 a 12/07/2027',
  },
];

/**
 * Só existe tesouraria de evento que alguém criou: o evento cadastrado no
 * sistema não ganha uma sozinho.
 */
const tesourarias: TesourariaDeEvento[] = [
  {
    id: 'retiro-carnaval-2027',
    nome: 'Retiro de Carnaval 2027',
    eventoId: 'ev-retiro-2027',
    periodo: '13 a 16/02/2027',
  },
  {
    id: 'encontro-casais-2026',
    nome: 'Encontro de Casais 2026',
    eventoId: 'ev-casais-2026',
    periodo: '19 e 20/09/2026',
  },
  {
    id: 'jantar-equipe-2026',
    nome: 'Jantar de confraternização da equipe',
    eventoId: null,
    periodo: '26/09/2026',
  },
  {
    id: 'cursilho-48',
    nome: 'Cursilho Masculino nº 48',
    eventoId: 'ev-cursilho-48',
    periodo: '07 a 10/08/2026',
  },
];

export const listarTesourarias = () => [...tesourarias];

export const buscarTesouraria = (id?: string) =>
  tesourarias.find((t) => t.id === id) ?? null;

export function criarTesouraria(
  dados: Pick<TesourariaDeEvento, 'nome' | 'eventoId' | 'periodo'>
) {
  const nova: TesourariaDeEvento = { ...dados, id: `nova-${Date.now()}` };
  tesourarias.unshift(nova);
  return nova;
}

// ---- tesourarias de congregação -------------------------------------------------

/**
 * ponytail: por enquanto a congregação nasce com a tesouraria (criar uma cria
 * a outra). Quando houver o cadastro de congregações, a tesouraria passa a
 * escolher uma congregação que já existe, como a de evento escolhe o evento.
 */
export interface Congregacao {
  id: string;
  nome: string;
  /** Bairro, distrito ou cidade */
  local: string | null;
}

export interface TesourariaDeCongregacao {
  id: string;
  congregacao: Congregacao;
}

const tesourariasDeCongregacao: TesourariaDeCongregacao[] = [
  {
    id: 'vila-nova',
    congregacao: {
      id: 'cong-vila-nova',
      nome: 'Congregação Vila Nova',
      local: 'Bairro Vila Nova',
    },
  },
  {
    id: 'sao-jose',
    congregacao: {
      id: 'cong-sao-jose',
      nome: 'Congregação São José',
      local: 'Distrito de São José',
    },
  },
  {
    id: 'jardim-das-flores',
    congregacao: {
      id: 'cong-jardim-das-flores',
      nome: 'Congregação Jardim das Flores',
      local: 'Jardim das Flores',
    },
  },
];

export const listarTesourariasDeCongregacao = () => [
  ...tesourariasDeCongregacao,
];

export const buscarTesourariaDeCongregacao = (id?: string) =>
  tesourariasDeCongregacao.find((t) => t.id === id) ?? null;

/** Cria a congregação e a tesouraria dela, de uma vez */
export function criarTesourariaDeCongregacao(dados: Omit<Congregacao, 'id'>) {
  const id = String(Date.now());
  const nova: TesourariaDeCongregacao = {
    id: `nova-${id}`,
    congregacao: { ...dados, id: `cong-${id}` },
  };
  tesourariasDeCongregacao.unshift(nova);
  return nova;
}

// ---- as contas de Eventos e de Congregações -------------------------------------

/** As tesourarias que têm conta própria e distribuem o extrato */
export type ContaDaTesouraria = 'EVENTOS' | 'CONGREGACOES';

/**
 * Os bancos de cada conta: uma tesouraria pode receber de mais de um (a de
 * Eventos tem o Sicredi e o PagBank, onde caem as vendas do site)
 */
export const BANCOS_DA_CONTA: Record<ContaDaTesouraria, string[]> = {
  EVENTOS: ['Sicredi', 'PagBank'],
  CONGREGACOES: ['Cora'],
};

/** "Sicredi e PagBank" */
export const nomeDosBancos = (conta: ContaDaTesouraria) =>
  BANCOS_DA_CONTA[conta].join(' e ');

/**
 * A conta tem banco só dela — em Configurações › Integrações, "bancos
 * divididos por tesouraria". Com a conta única (sem restrição de
 * tesouraria), o que não foi alocado já aparece na Administrativa, e o aviso
 * não se repete aqui.
 *
 * ponytail: fixo enquanto a divisão dos bancos não é salva (é só prévia na
 * tela da Pluggy); depois, vem da integração da igreja.
 */
export const TEM_BANCO_PROPRIO: Record<ContaDaTesouraria, boolean> = {
  EVENTOS: true,
  CONGREGACOES: true,
};

/** Um movimento da conta, como o Pluggy trouxe e ficou salvo */
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
  /**
   * O código da transação que veio junto — o da venda no PagBank. É por ele
   * que o pagamento do site se concilia sozinho
   */
  codigo: string | null;
}

/**
 * Quanto de um movimento foi para uma tesouraria. Um movimento pode ter mais
 * de uma (rateio): a gráfica que imprimiu os banners de dois eventos.
 */
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

/** Um lançamento do sistema ligado a um movimento */
export interface Conciliado {
  lancamento: LancamentoDoSistema;
  /** Ligado pelo código da transação, sem ninguém marcar */
  automatica: boolean;
}

/** Uma alocação desta tesouraria, com o movimento e o que ela concilia */
export interface LinhaDaqui {
  alocacao: Alocacao;
  movimento: MovimentoDaConta;
  /**
   * Os lançamentos do sistema que são este dinheiro. Vazio: o movimento foi
   * trazido do banco e é, ele mesmo, o lançamento da tesouraria
   */
  conciliados: Conciliado[];
}

export const SEM_CATEGORIA = 'Sem categoria';

/** As categorias que uma alocação (ou um lançamento manual) pode receber */
export const CATEGORIAS: Record<
  ContaDaTesouraria,
  Record<TipoDoLancamento, string[]>
> = {
  EVENTOS: {
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
  CONGREGACOES: {
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

const EXTRATO: MovimentoDaConta[] = [];
const ALOCACOES: Alocacao[] = [];

type Linha = [
  TipoDoLancamento,
  string,
  number,
  string,
  string | null,
  string | null,
];

let proximo = 0;
/** Grava um movimento e, se `tesourariaId`, a alocação dele inteiro */
function movimento(
  conta: ContaDaTesouraria,
  banco: string,
  tesourariaId: string | null,
  [tipo, descricao, valor, data, categoria, pagador]: Linha,
  codigo: string | null = null
) {
  const id = `mov-${++proximo}`;
  EXTRATO.push({
    id,
    conta,
    banco,
    tipo,
    descricao,
    pagador,
    valor,
    data,
    codigo,
  });
  if (tesourariaId) {
    ALOCACOES.push({
      id: `aloc-${id}`,
      movimentoId: id,
      tesourariaId,
      valor,
      categoria,
    });
  }
  return id;
}

// ---- os lançamentos do sistema (só evento) ---------------------------------------

/**
 * O que o evento registrou antes de o dinheiro aparecer no banco: os
 * pagamentos das inscrições e dos produtos (vêm da tela de pagamentos do
 * evento) e os lançamentos manuais da tesouraria.
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
  /**
   * O código da transação no gateway (PagBank). Sem ele, o pagamento teve
   * baixa manual no "Detalhes do pagamento", ou é um lançamento manual
   */
  codigo: string | null;
  /** Gerado pela conciliação automática (a tarifa do gateway) */
  automatico?: boolean;
}

/** O lançamento do sistema ligado ao movimento do extrato que é ele */
interface Conciliacao {
  lancamentoId: string;
  movimentoId: string;
  tesourariaId: string;
  automatica: boolean;
}

/** Um lançamento do sistema, com a situação dele diante do extrato */
export interface LinhaDoSistema {
  lancamento: LancamentoDoSistema;
  situacao: SituacaoNoBanco;
  /** O movimento conciliado */
  movimento: MovimentoDaConta | null;
  automatica: boolean;
}

const SISTEMA: LancamentoDoSistema[] = [];
const CONCILIACOES: Conciliacao[] = [];
/** Os confirmados como "não consta no banco" */
const NAO_CONSTA = new Set<string>();

function lancamento(
  tesourariaId: string,
  origem: OrigemNoSistema,
  [tipo, descricao, valor, data, categoria, forma]: Linha,
  codigo: string | null = null
) {
  const id = `sis-${++proximo}`;
  SISTEMA.push({
    id,
    tesourariaId,
    origem,
    tipo,
    descricao,
    valor,
    data,
    categoria: categoria ?? SEM_CATEGORIA,
    forma,
    codigo,
  });
  return id;
}

const ligar = (
  lancamentoId: string,
  movimentoId: string,
  tesourariaId: string,
  automatica = false
) => {
  NAO_CONSTA.delete(lancamentoId);
  CONCILIACOES.push({ lancamentoId, movimentoId, tesourariaId, automatica });
};

// ---- a conta de Eventos ----------------------------------------------------------

// o que já foi para cada evento
for (const [tesourariaId, linhas] of [
  [
    'retiro-carnaval-2027',
    [
      [
        'EXPENSE',
        'Pix enviado — Sítio Recanto Verde (sinal)',
        5000,
        '2026-09-15',
        'Hospedagem',
        null,
      ],
    ],
  ],
  [
    'encontro-casais-2026',
    [
      [
        'EXPENSE',
        'Pix enviado — Hotel Fazenda Serra Azul (sinal)',
        4000,
        '2026-07-28',
        'Hospedagem',
        null,
      ],
      [
        'EXPENSE',
        'Pix enviado — Hotel Fazenda Serra Azul',
        4800,
        '2026-09-18',
        'Hospedagem',
        null,
      ],
      [
        'EXPENSE',
        'Boleto — Buffet Sabor & Arte',
        1650,
        '2026-09-19',
        'Alimentação',
        null,
      ],
      [
        'EXPENSE',
        'Pix enviado — Malharia Fiel (50 camisas)',
        1250,
        '2026-08-30',
        'Materiais',
        null,
      ],
      [
        'EXPENSE',
        'Cartão — Papelaria Central',
        640,
        '2026-09-12',
        'Materiais',
        null,
      ],
      [
        'EXPENSE',
        'Pix enviado — Som e Luz Eventos',
        900,
        '2026-09-19',
        'Som e decoração',
        null,
      ],
      [
        'EXPENSE',
        'Pix enviado — Transportes Rota Sul',
        380,
        '2026-09-19',
        'Transporte',
        null,
      ],
    ],
  ],
  [
    'jantar-equipe-2026',
    [
      [
        'INCOME',
        'Pix recebido',
        300,
        '2026-09-22',
        'Doações',
        'Família Mendes',
      ],
      [
        'EXPENSE',
        'Cartão — Restaurante Sabor da Terra',
        1480,
        '2026-09-26',
        'Alimentação',
        null,
      ],
      [
        'EXPENSE',
        'Pix enviado — Floricultura Bela Flor',
        210,
        '2026-09-25',
        null,
        null,
      ],
    ],
  ],
  [
    'cursilho-48',
    [
      [
        'INCOME',
        'Pix recebido',
        1200,
        '2026-07-02',
        'Doações',
        'Paróquia São Pedro',
      ],
      [
        'INCOME',
        'Pix recebido',
        800,
        '2026-07-20',
        'Patrocínio',
        'Mercado Bom Preço',
      ],
      [
        'EXPENSE',
        'Pix enviado — Casa de Retiros São José',
        7200,
        '2026-08-10',
        'Hospedagem',
        null,
      ],
      ['EXPENSE', 'Cartão — Atacadão', 2380, '2026-08-05', 'Alimentação', null],
      [
        'EXPENSE',
        'Pix enviado — Padaria Pão Nosso',
        460,
        '2026-08-08',
        'Alimentação',
        null,
      ],
      [
        'EXPENSE',
        'Pix enviado — Viação Litoral (fretamento)',
        1700,
        '2026-08-07',
        'Transporte',
        null,
      ],
      [
        'EXPENSE',
        'Pix enviado — Gráfica Rápida',
        520,
        '2026-07-30',
        'Materiais',
        null,
      ],
      [
        'EXPENSE',
        'Pix enviado — Som e Luz Eventos',
        450,
        '2026-08-07',
        'Som e decoração',
        null,
      ],
    ],
  ],
] as const) {
  for (const linha of linhas) {
    movimento('EVENTOS', 'Sicredi', tesourariaId, linha as unknown as Linha);
  }
}

/**
 * Os eventos que já acabaram: as inscrições vieram por lote, e cada repasse
 * do PagBank que caiu no Sicredi já foi conciliado com o lote dele.
 */
for (const [tesourariaId, lotes] of [
  [
    'encontro-casais-2026',
    [
      ['Inscrições — 1º lote (18 casais)', 5400, '2026-07-20', '2026-07-22'],
      ['Inscrições — 2º lote (13 casais)', 4550, '2026-08-25', '2026-08-27'],
    ],
  ],
  [
    'cursilho-48',
    [
      [
        'Inscrições — 1º lote (30 inscrições)',
        6600,
        '2026-06-15',
        '2026-06-17',
      ],
      [
        'Inscrições — 2º lote (22 inscrições)',
        5720,
        '2026-07-15',
        '2026-07-17',
      ],
    ],
  ],
] as const) {
  for (const [descricao, valor, pago, caiu] of lotes) {
    const sis = lancamento(tesourariaId, 'INSCRICAO', [
      'INCOME',
      descricao,
      valor,
      pago,
      'Ingressos',
      'Site',
    ]);
    const mov = movimento('EVENTOS', 'Sicredi', tesourariaId, [
      'INCOME',
      'Transferência recebida — PagBank (repasse)',
      valor,
      caiu,
      'Ingressos',
      'PagBank',
    ]);
    ligar(sis, mov, tesourariaId);
  }
}
lancamento(
  'encontro-casais-2026',
  'PRODUTO',
  [
    'INCOME',
    'Camisas do encontro (42 un.)',
    1890,
    '2026-09-20',
    'Produtos',
    'Dinheiro',
  ],
  null
);
NAO_CONSTA.add(SISTEMA[SISTEMA.length - 1].id);

// o retiro, aberto: o que ainda está a distribuir e a conciliar
const RETIRO = 'retiro-carnaval-2027';

// as vendas do site, uma a uma, com o código da transação. A primeira ainda
// não caiu no PagBank (cartão demora)
for (const [origem, descricao, valor, data, codigo, forma] of [
  [
    'INSCRICAO',
    'Inscrição — Ana Paula Souza',
    190,
    '2026-09-28',
    'PAG-7F3A21',
    'Cartão',
  ],
  [
    'PRODUTO',
    'Camisa do retiro — Ana Paula Souza',
    45,
    '2026-09-28',
    'PAG-7F3A22',
    'Cartão',
  ],
  [
    'INSCRICAO',
    'Inscrição — Bruno Lima',
    190,
    '2026-09-29',
    'PAG-8C1D45',
    'Pix',
  ],
  [
    'INSCRICAO',
    'Inscrição — Carla Menezes',
    190,
    '2026-10-01',
    'PAG-2B9E77',
    'Pix',
  ],
  [
    'INSCRICAO',
    'Inscrição — Diego Ramos',
    190,
    '2026-10-03',
    'PAG-5E6F10',
    'Cartão',
  ],
] as const) {
  lancamento(
    RETIRO,
    origem,
    [
      'INCOME',
      descricao,
      valor,
      data,
      origem === 'PRODUTO' ? 'Produtos' : 'Ingressos',
      forma,
    ],
    codigo
  );
}
// e o que caiu no PagBank, já sem a tarifa
for (const [codigo, valor, data] of [
  ['PAG-7F3A21', 181.27, '2026-09-29'],
  ['PAG-7F3A22', 42.93, '2026-09-29'],
  ['PAG-8C1D45', 188.12, '2026-09-29'],
  ['PAG-2B9E77', 188.12, '2026-10-01'],
] as const) {
  movimento(
    'EVENTOS',
    'PagBank',
    null,
    ['INCOME', `Venda — cód. ${codigo}`, valor, data, null, null],
    codigo
  );
}

// as baixas manuais: não têm código, a tesouraria concilia à mão
for (const [origem, descricao, valor, data, categoria, forma] of [
  [
    'INSCRICAO',
    'Inscrição — Elisa Prado (baixa manual)',
    190,
    '2026-10-02',
    'Ingressos',
    'Pix',
  ],
  [
    'INSCRICAO',
    'Inscrição — Fábio Nunes (baixa manual)',
    190,
    '2026-10-04',
    'Ingressos',
    'Dinheiro',
  ],
  [
    'INSCRICAO',
    'Inscrição — Gabriela Costa (baixa manual)',
    190,
    '2026-10-04',
    'Ingressos',
    'Dinheiro',
  ],
  [
    'PRODUTO',
    'Camisas — venda no balcão (3 un.)',
    135,
    '2026-10-05',
    'Produtos',
    'Dinheiro',
  ],
] as const) {
  lancamento(RETIRO, origem, [
    'INCOME',
    descricao,
    valor,
    data,
    categoria,
    forma,
  ]);
}

// o que está na conta e não foi para evento nenhum
for (const linha of [
  // a baixa manual da Elisa, que pagou por Pix direto na conta
  ['INCOME', 'Pix recebido', 190, '2026-10-02', null, 'Elisa Prado'],
  // as inscrições do Fábio e da Gabriela, depositadas juntas
  ['INCOME', 'Depósito em dinheiro', 380, '2026-10-06', null, null],
  // não é de evento nenhum: fica não alocado
  ['EXPENSE', 'Tarifa de manutenção da conta', 39.9, '2026-10-05', null, null],
  // a gráfica imprimiu os banners de dois eventos: rateio
  [
    'EXPENSE',
    'Pix enviado — Gráfica Rápida (banners de dois eventos)',
    640,
    '2026-10-06',
    null,
    null,
  ],
  [
    'EXPENSE',
    'Pix enviado — Casa de Retiros São José (caução)',
    1500,
    '2026-10-09',
    null,
    null,
  ],
  ['INCOME', 'Pix recebido', 450, '2026-10-02', null, 'Grupo de Jovens'],
  ['INCOME', 'Depósito em dinheiro', 1240, '2026-09-22', null, null],
  ['INCOME', 'Pix recebido', 1520, '2026-09-21', null, 'Tesoureira do jantar'],
  ['EXPENSE', 'Pix enviado — Gráfica Rápida', 280, '2026-09-06', null, null],
] as const) {
  movimento('EVENTOS', 'Sicredi', null, linha as unknown as Linha);
}

// ---- a conta das Congregações -----------------------------------------------------

/**
 * A conta das Congregações, gerada para ter o ano inteiro sem uma lista de
 * cem linhas: ofertas em dinheiro duas vezes por mês, uma doação de vez em
 * quando, aluguel, luz e água. De janeiro a setembro de 2026 tudo já foi
 * alocado; outubro (até o dia 12) ainda não. Os valores seguem uma regra
 * fixa, e não o acaso, para não mudarem a cada recarga.
 */
const GASTOS: Record<
  string,
  { aluguel: number; extra: [number, string, string, number][] }
> = {
  'vila-nova': {
    aluguel: 900,
    extra: [
      [4, 'Cartão — Casa do Construtor', 'Manutenção', 480],
      [6, 'Pix enviado — Cestas básicas', 'Ação social', 350],
    ],
  },
  'sao-jose': {
    aluguel: 0,
    extra: [[8, 'Cartão — Atacadão (limpeza)', 'Limpeza', 160]],
  },
  'jardim-das-flores': {
    aluguel: 650,
    extra: [[3, 'Pix enviado — Gráfica Rápida (campanha)', 'Campanhas', 220]],
  },
};
const DOADORES = ['Família Rocha', 'Irmã Neusa', 'Família Duarte'];
const OUTUBRO = 10;
const HOJE = 12;
const dia = (mes: number, d: number) =>
  `2026-${String(mes).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

tesourariasDeCongregacao.forEach((t, ti) => {
  const gastos = GASTOS[t.id];
  const lancar = (
    mes: number,
    d: number,
    tipo: TipoDoLancamento,
    descricao: string,
    valor: number,
    categoria: string,
    pagador: string | null = null
  ) => {
    if (mes === OUTUBRO && d > HOJE) return;
    movimento('CONGREGACOES', 'Cora', mes < OUTUBRO ? t.id : null, [
      tipo,
      descricao,
      valor,
      dia(mes, d),
      categoria,
      pagador,
    ]);
  };

  for (let mes = 1; mes <= OUTUBRO; mes++) {
    const oferta1 = 380 + ((mes * 37 + ti * 53) % 260);
    const oferta2 = 300 + ((mes * 29 + ti * 41) % 220);
    lancar(mes, 8, 'INCOME', 'Depósito em dinheiro', oferta1, 'Ofertas');
    lancar(mes, 22, 'INCOME', 'Depósito em dinheiro', oferta2, 'Ofertas');
    if ((mes + ti) % 3 === 0) {
      const doador = DOADORES[(mes + ti) % DOADORES.length];
      lancar(
        mes,
        6,
        'INCOME',
        'Pix recebido',
        150 + ti * 50,
        'Doações',
        doador
      );
    }
    if (gastos.aluguel) {
      lancar(
        mes,
        10,
        'EXPENSE',
        'Pix enviado — Aluguel do salão',
        gastos.aluguel,
        'Aluguel'
      );
    }
    lancar(
      mes,
      15,
      'EXPENSE',
      'Boleto — Energisa',
      120 + ((mes * 13) % 60),
      'Água e luz'
    );
    lancar(
      mes,
      18,
      'EXPENSE',
      'Boleto — Saneamento',
      55 + ((mes * 7) % 25),
      'Água e luz'
    );
    for (const [mesExtra, descricao, categoria, valor] of gastos.extra) {
      if (mesExtra === mes) {
        lancar(mes, 20, 'EXPENSE', descricao, valor, categoria);
      }
    }
  }
});

// não é de congregação nenhuma: fica não alocado
movimento('CONGREGACOES', 'Cora', null, [
  'EXPENSE',
  'Tarifa de manutenção da conta',
  29.9,
  dia(OUTUBRO, 5),
  null,
  null,
]);
// material de limpeza das três congregações num boleto só: rateio
movimento('CONGREGACOES', 'Cora', null, [
  'EXPENSE',
  'Boleto — Material de limpeza (três congregações)',
  360,
  dia(OUTUBRO, 7),
  null,
  null,
]);

// ---- distribuir o extrato ----------------------------------------------------------

const maisRecentes = (a: string, b: string) => b.localeCompare(a);

const alocadoDe = (movimentoId: string) =>
  centavos(
    ALOCACOES.filter((a) => a.movimentoId === movimentoId).reduce(
      (soma, a) => soma + a.valor,
      0
    )
  );

const restanteDe = (movimentoId: string) =>
  centavos(
    (EXTRATO.find((m) => m.id === movimentoId)?.valor ?? 0) -
      alocadoDe(movimentoId)
  );

/**
 * O que está na conta e ainda não foi (todo) para nenhuma tesouraria: os
 * movimentos não alocados, e o resto dos que foram só em parte.
 */
export const aDistribuir = (conta: ContaDaTesouraria): LinhaLivre[] =>
  EXTRATO.filter((m) => m.conta === conta)
    .map((m) => ({ movimento: m, restante: restanteDe(m.id) }))
    .filter((l) => l.restante > 0)
    .sort((a, b) => maisRecentes(a.movimento.data, b.movimento.data));

const conciliadosDe = (
  movimentoId: string,
  tesourariaId: string
): Conciliado[] =>
  CONCILIACOES.filter(
    (c) => c.movimentoId === movimentoId && c.tesourariaId === tesourariaId
  ).map((c) => ({
    lancamento: SISTEMA.find((s) => s.id === c.lancamentoId)!,
    automatica: c.automatica,
  }));

/** As alocações desta tesouraria, com o movimento de cada uma */
export const alocacoesDa = (tesourariaId: string): LinhaDaqui[] =>
  ALOCACOES.filter((a) => a.tesourariaId === tesourariaId)
    .map((alocacao) => ({
      alocacao,
      movimento: EXTRATO.find((m) => m.id === alocacao.movimentoId)!,
      conciliados: conciliadosDe(alocacao.movimentoId, tesourariaId),
    }))
    .sort((a, b) => maisRecentes(a.movimento.data, b.movimento.data));

/**
 * Rateio: traz só uma parte do movimento; o resto continua a distribuir, para
 * outra tesouraria. Uma tesouraria tem no máximo uma alocação por movimento —
 * trazer de novo soma na que já existe. Entra sem categoria.
 */
export function distribuirParte(
  movimentoId: string,
  tesourariaId: string,
  valor: number,
  categoria: string | null = null
) {
  const parte = centavos(Math.min(valor, restanteDe(movimentoId)));
  if (parte <= 0) return;
  const ja = ALOCACOES.find(
    (a) => a.movimentoId === movimentoId && a.tesourariaId === tesourariaId
  );
  if (ja) {
    ja.valor = centavos(ja.valor + parte);
    return;
  }
  ALOCACOES.push({
    id: `aloc-${movimentoId}-${tesourariaId}`,
    movimentoId,
    tesourariaId,
    valor: parte,
    categoria,
  });
}

/** Traz para a tesouraria o que falta alocar de cada movimento */
export function distribuir(movimentoIds: string[], tesourariaId: string) {
  for (const id of movimentoIds) {
    distribuirParte(id, tesourariaId, restanteDe(id));
  }
}

/** Desfaz as conciliações de um movimento nesta tesouraria */
function soltar(movimentoId: string, tesourariaId: string) {
  for (let i = CONCILIACOES.length - 1; i >= 0; i--) {
    const c = CONCILIACOES[i];
    if (c.movimentoId !== movimentoId || c.tesourariaId !== tesourariaId) {
      continue;
    }
    CONCILIACOES.splice(i, 1);
    // a tarifa que a conciliação automática lançou some junto com ela
    const s = SISTEMA.findIndex((x) => x.id === c.lancamentoId);
    if (s >= 0 && SISTEMA[s].automatico) SISTEMA.splice(s, 1);
  }
}

/**
 * Devolve a alocação: o valor dela volta a distribuir, e o que ela
 * conciliava volta a conciliar
 */
export function devolver(alocacaoId: string) {
  const i = ALOCACOES.findIndex((a) => a.id === alocacaoId);
  if (i < 0) return;
  soltar(ALOCACOES[i].movimentoId, ALOCACOES[i].tesourariaId);
  ALOCACOES.splice(i, 1);
}

export function classificar(alocacaoId: string, categoria: string) {
  const a = ALOCACOES.find((x) => x.id === alocacaoId);
  if (a) a.categoria = categoria;
}

// ---- conciliar com o sistema ---------------------------------------------------------

/** Os lançamentos do sistema desta tesouraria, com a situação de cada um */
export const sistemaDa = (tesourariaId: string): LinhaDoSistema[] =>
  SISTEMA.filter((s) => s.tesourariaId === tesourariaId)
    .map((lancamento) => {
      const c = CONCILIACOES.find((x) => x.lancamentoId === lancamento.id);
      return {
        lancamento,
        situacao: c
          ? 'CONCILIADO'
          : NAO_CONSTA.has(lancamento.id)
            ? 'NAO_CONSTA'
            : 'A_CONCILIAR',
        movimento: c ? EXTRATO.find((m) => m.id === c.movimentoId)! : null,
        automatica: !!c?.automatica,
      } satisfies LinhaDoSistema;
    })
    .sort((a, b) => maisRecentes(a.lancamento.data, b.lancamento.data));

/** Os que ainda pedem conciliação: o fechamento avisa deles */
export const aConciliarDa = (tesourariaId: string) =>
  sistemaDa(tesourariaId).filter((l) => l.situacao === 'A_CONCILIAR');

/**
 * Concilia um movimento do banco com lançamentos do sistema que são o mesmo
 * dinheiro — um ou vários: o depósito do dinheiro de três inscrições, o
 * repasse de um lote. A soma deles (entradas menos saídas) precisa bater com
 * o valor do banco ao centavo; a tarifa do gateway entra como um lançamento
 * de saída junto. O movimento ainda a distribuir vem para a tesouraria.
 *
 * Volta a mensagem do que impediu, ou `null`.
 */
export function conciliar(
  movimentoId: string,
  lancamentoIds: string[],
  tesourariaId: string
): string | null {
  const m = EXTRATO.find((x) => x.id === movimentoId);
  if (!m || !lancamentoIds.length) return 'Marque o banco e o sistema';
  if (conciliadosDe(movimentoId, tesourariaId).length) {
    return 'Este movimento já está conciliado: desfaça antes';
  }
  const aqui = ALOCACOES.find(
    (a) => a.movimentoId === movimentoId && a.tesourariaId === tesourariaId
  );
  const doBanco = aqui?.valor ?? restanteDe(movimentoId);
  const lancamentos = SISTEMA.filter((s) => lancamentoIds.includes(s.id));
  const sinal = (tipo: TipoDoLancamento) => (tipo === 'INCOME' ? 1 : -1);
  const soma = centavos(
    lancamentos.reduce((t, l) => t + sinal(l.tipo) * l.valor, 0)
  );
  const banco = centavos(sinal(m.tipo) * doBanco);
  if (soma !== banco) {
    const fmt = (v: number) =>
      v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    return `O banco tem ${fmt(banco)} e os lançamentos somam ${fmt(soma)}. Se a diferença é tarifa, lance-a como saída e marque junto.`;
  }
  if (!aqui) {
    distribuirParte(
      movimentoId,
      tesourariaId,
      doBanco,
      lancamentos[0].categoria
    );
  }
  for (const l of lancamentos) ligar(l.id, movimentoId, tesourariaId);
  return null;
}

/** Desfaz a conciliação do lançamento (e dos outros do mesmo movimento) */
/**
 * Desfaz a conciliação do lançamento (e dos outros do mesmo movimento): o
 * movimento volta para o lado do banco, sem par, e os lançamentos voltam a
 * conciliar
 */
export function desfazerConciliacao(lancamentoId: string) {
  const c = CONCILIACOES.find((x) => x.lancamentoId === lancamentoId);
  const a =
    c &&
    ALOCACOES.find(
      (x) =>
        x.movimentoId === c.movimentoId && x.tesourariaId === c.tesourariaId
    );
  if (a) devolver(a.id);
}

/** Confirma que não vai aparecer no extrato (dinheiro em espécie), ou volta */
export function marcarNaoConsta(lancamentoIds: string[], naoConsta: boolean) {
  for (const id of lancamentoIds) {
    if (CONCILIACOES.some((c) => c.lancamentoId === id)) continue;
    if (naoConsta) NAO_CONSTA.add(id);
    else NAO_CONSTA.delete(id);
  }
}

/** Lançamento manual da tesouraria do evento: entra a conciliar */
export function novoLancamento(
  tesourariaId: string,
  dados: Pick<
    LancamentoDoSistema,
    'tipo' | 'categoria' | 'descricao' | 'valor' | 'data' | 'forma'
  >
) {
  SISTEMA.push({
    ...dados,
    id: `sis-${++proximo}`,
    tesourariaId,
    origem: 'MANUAL',
    codigo: null,
  });
}

/**
 * A conciliação automática: o pagamento com código de transação casa com o
 * movimento do extrato que traz o mesmo código, sem ninguém marcar nada. O
 * banco recebe o valor já sem a tarifa do gateway; a diferença vira um
 * lançamento de saída ("Tarifas"), conciliado junto.
 *
 * ponytail: roda uma vez, ao carregar; no servidor, roda a cada importação
 * (do extrato ou dos pagamentos).
 */
function conciliarAutomatico() {
  for (const s of [...SISTEMA]) {
    if (!s.codigo || CONCILIACOES.some((c) => c.lancamentoId === s.id)) {
      continue;
    }
    const m = EXTRATO.find(
      (x) => x.codigo === s.codigo && restanteDe(x.id) === x.valor
    );
    if (!m) continue;
    distribuirParte(m.id, s.tesourariaId, m.valor, s.categoria);
    ligar(s.id, m.id, s.tesourariaId, true);
    const tarifa = centavos(s.valor - m.valor);
    if (tarifa > 0) {
      const id = `sis-${++proximo}`;
      SISTEMA.push({
        id,
        tesourariaId: s.tesourariaId,
        origem: 'MANUAL',
        tipo: 'EXPENSE',
        categoria: 'Tarifas',
        descricao: `Tarifa do PagBank — cód. ${s.codigo}`,
        valor: tarifa,
        data: m.data,
        forma: null,
        codigo: s.codigo,
        automatico: true,
      });
      ligar(id, m.id, s.tesourariaId, true);
    }
  }
}
conciliarAutomatico();

// ---- o diff da conciliação -----------------------------------------------------

/** Como uma linha da conciliação está, como na Administrativa */
export type EstadoDaLinha =
  'so_banco' | 'so_evento' | 'nao_consta' | 'conciliado';

/** O lado direito: um lançamento da tesouraria */
export type LadoDaTesouraria =
  /** pagamento ou manual do evento */
  | ({ de: 'sistema'; situacao: SituacaoNoBanco } & Conciliado)
  /** o movimento trazido do banco, que é ele mesmo o lançamento */
  | { de: 'extrato'; alocacao: Alocacao };

export interface LinhaDaConciliacao {
  chave: string;
  estado: EstadoDaLinha;
  /** O lado esquerdo: o movimento do banco e quanto dele está nesta linha */
  banco: { movimento: MovimentoDaConta; valor: number } | null;
  /**
   * O banco é o mesmo da linha de cima: um movimento que concilia com
   * vários lançamentos (o depósito do dinheiro de três inscrições)
   */
  continua: boolean;
  tesouraria: LadoDaTesouraria | null;
}

/**
 * A conciliação de uma tesouraria como um diff, linha a linha: à esquerda o
 * que veio do banco (o Pluggy), à direita os lançamentos da tesouraria.
 *
 * - só no banco: o que ainda não foi para tesouraria nenhuma;
 * - só no evento: o pagamento ou o manual que ainda não achou o banco;
 * - não consta no banco: o que nunca vai achar (dinheiro em espécie);
 * - conciliado: o par — o pagamento com o movimento, ou o movimento trazido
 *   do banco, que vira o lançamento da tesouraria.
 *
 * O que pede ação vem primeiro; dentro de cada grupo, do mais recente.
 */
export function conciliacaoDa(
  conta: ContaDaTesouraria,
  tesourariaId: string
): LinhaDaConciliacao[] {
  const sistema = conta === 'EVENTOS' ? sistemaDa(tesourariaId) : [];
  const soDoSistema = (situacao: SituacaoNoBanco) =>
    sistema
      .filter((l) => l.situacao === situacao)
      .map((l): LinhaDaConciliacao => ({
        chave: l.lancamento.id,
        estado: situacao === 'NAO_CONSTA' ? 'nao_consta' : 'so_evento',
        banco: null,
        continua: false,
        tesouraria: {
          de: 'sistema',
          situacao,
          lancamento: l.lancamento,
          automatica: false,
        },
      }));

  return [
    ...aDistribuir(conta).map(
      ({ movimento, restante }): LinhaDaConciliacao => ({
        chave: movimento.id,
        estado: 'so_banco',
        banco: { movimento, valor: restante },
        continua: false,
        tesouraria: null,
      })
    ),
    ...soDoSistema('A_CONCILIAR'),
    ...soDoSistema('NAO_CONSTA'),
    ...alocacoesDa(tesourariaId).flatMap(
      ({ alocacao, movimento, conciliados }): LinhaDaConciliacao[] => {
        const banco = { movimento, valor: alocacao.valor };
        if (!conciliados.length) {
          return [
            {
              chave: alocacao.id,
              estado: 'conciliado',
              banco,
              continua: false,
              tesouraria: { de: 'extrato', alocacao },
            },
          ];
        }
        return conciliados.map((c, i) => ({
          chave: c.lancamento.id,
          estado: 'conciliado',
          banco,
          continua: i > 0,
          tesouraria: { de: 'sistema', situacao: 'CONCILIADO', ...c },
        }));
      }
    ),
  ];
}

// ---- lançamentos ----------------------------------------------------------------

/**
 * Os lançamentos de uma tesouraria: os do sistema (pagamentos e manuais,
 * conciliados ou não) e o que veio do banco sem par no sistema. O movimento
 * conciliado não entra: os lançamentos dele já contam aquele dinheiro.
 */
export function lancamentosDa(tesourariaId: string): LancamentoDaTesouraria[] {
  const doSistema = sistemaDa(tesourariaId).map(
    ({ lancamento: l, situacao, movimento: m }): LancamentoDaTesouraria => ({
      id: l.id,
      tesourariaId,
      tipo: l.tipo,
      categoria: l.categoria,
      descricao: l.descricao,
      valor: l.valor,
      data: l.data,
      origem: l.origem,
      banco: m?.banco ?? null,
      situacao,
    })
  );
  const doBanco = alocacoesDa(tesourariaId)
    .filter(({ conciliados }) => !conciliados.length)
    .map(({ alocacao, movimento: m }): LancamentoDaTesouraria => ({
      id: alocacao.id,
      tesourariaId,
      tipo: m.tipo,
      categoria: alocacao.categoria ?? SEM_CATEGORIA,
      descricao: m.pagador ? `${m.descricao} — ${m.pagador}` : m.descricao,
      valor: alocacao.valor,
      data: m.data,
      origem: 'BANCO',
      banco: m.banco,
      situacao: null,
    }));
  return [...doSistema, ...doBanco];
}

export function resumir(lancamentos: LancamentoDaTesouraria[]) {
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
