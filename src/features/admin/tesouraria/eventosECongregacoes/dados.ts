/**
 * Tesourarias de eventos e de congregações — MVP com dados de exemplo.
 *
 * O modelo é o de uma conta por tesouraria: a tesouraria de Eventos tem a sua
 * conta no banco, e a de Congregações a dela (uma só para todas as
 * congregações). O extrato chega pelo Pluggy e fica salvo, e cada movimento é
 * **alocado** na tesouraria do evento (ou da congregação) a que pertence —
 * inteiro, ou em partes quando serve a mais de uma (rateio). Ninguém lança à
 * mão para depois conciliar: o banco é a fonte. O que não foi alocado em
 * nenhuma tesouraria (uma tarifa do banco, por exemplo) fica "não alocado".
 *
 * ponytail: tudo aqui é mock, guardado em memória — o que se cria, aloca ou
 * fecha some ao recarregar a página. Quando virar dado de verdade, este
 * arquivo vira o `api.ts` (hooks) e as contas passam para o servidor.
 */

export type TipoDoLancamento = 'INCOME' | 'EXPENSE';
/** De onde veio o lançamento: das inscrições pagas no sistema ou da conta */
export type OrigemNaTesouraria = 'INSCRICOES' | 'BANCO';

export interface LancamentoDaTesouraria {
  id: string;
  tesourariaId: string;
  tipo: TipoDoLancamento;
  categoria: string;
  descricao: string;
  valor: number;
  /** "2026-10-03" */
  data: string;
  origem: OrigemNaTesouraria;
  /** Pagamento das inscrições já conferido com um movimento da conta */
  conferido?: boolean;
}

export const ROTULO_DA_ORIGEM: Record<OrigemNaTesouraria, string> = {
  INSCRICOES: 'Pagamentos das inscrições',
  BANCO: 'Extrato da conta',
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
 * depois, quando o dinheiro todo assentou. Só o admin da igreja fecha (e
 * reabre); vale igual para evento e congregação.
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

export const NOME_DA_CONTA: Record<ContaDaTesouraria, string> = {
  EVENTOS: 'Sicredi · Conta de eventos',
  CONGREGACOES: 'Cora · Conta das congregações',
};

/** Um movimento da conta, como o Pluggy trouxe e ficou salvo */
export interface MovimentoDaConta {
  id: string;
  conta: ContaDaTesouraria;
  tipo: TipoDoLancamento;
  descricao: string;
  /** Quem pagou, quando o banco diz */
  pagador: string | null;
  valor: number;
  /** "2026-10-03" */
  data: string;
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
  /**
   * O pagamento das inscrições que este movimento confirma (só em evento): o
   * repasse do PagBank que cai na conta é o mesmo dinheiro das inscrições já
   * registradas, e conferido não conta duas vezes
   */
  pagamentoId: string | null;
}

/** Um movimento com o que ainda falta alocar dele */
export interface LinhaLivre {
  movimento: MovimentoDaConta;
  restante: number;
}

/** Uma alocação desta tesouraria, com o movimento de onde ela veio */
export interface LinhaDaqui {
  alocacao: Alocacao;
  movimento: MovimentoDaConta;
}

export const SEM_CATEGORIA = 'Sem categoria';

/** As categorias que uma alocação pode receber */
export const CATEGORIAS: Record<
  ContaDaTesouraria,
  Record<TipoDoLancamento, string[]>
> = {
  EVENTOS: {
    INCOME: [
      'Ingressos',
      'Loja do evento',
      'Convites',
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

let proximo = 0;
/** Grava um movimento e, se `tesourariaId`, a alocação dele inteiro */
function movimento(
  conta: ContaDaTesouraria,
  tesourariaId: string | null,
  [tipo, descricao, valor, data, categoria, pagador]: [
    TipoDoLancamento,
    string,
    number,
    string,
    string | null,
    string | null,
  ]
) {
  const id = `mov-${++proximo}`;
  EXTRATO.push({ id, conta, tipo, descricao, pagador, valor, data });
  if (tesourariaId) {
    ALOCACOES.push({
      id: `aloc-${id}`,
      movimentoId: id,
      tesourariaId,
      valor,
      categoria,
      pagamentoId: null,
    });
  }
}

// a conta de Eventos: o que já foi para cada evento e o que não foi para nenhum
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
  [
    null,
    [
      // o repasse das inscrições do 1º lote do retiro: conferir com o
      // pagamento já registrado, e não contar de novo
      [
        'INCOME',
        'Transferência recebida — PagSeguro (repasse)',
        7790,
        '2026-10-01',
        null,
        'PagSeguro Internet',
      ],
      // não é de evento nenhum: fica não alocado
      [
        'EXPENSE',
        'Tarifa de manutenção da conta',
        39.9,
        '2026-10-05',
        null,
        null,
      ],
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
      ['INCOME', 'Pix recebido', 190, '2026-10-08', null, 'Carla Menezes'],
      ['INCOME', 'Pix recebido', 450, '2026-10-02', null, 'Grupo de Jovens'],
      ['INCOME', 'Depósito em dinheiro', 1240, '2026-09-22', null, null],
      [
        'INCOME',
        'Pix recebido',
        1520,
        '2026-09-21',
        null,
        'Tesoureira do jantar',
      ],
      ['INCOME', 'Depósito em dinheiro', 1050, '2026-09-11', null, null],
      [
        'EXPENSE',
        'Pix enviado — Gráfica Rápida',
        280,
        '2026-09-06',
        null,
        null,
      ],
      ['INCOME', 'Depósito em dinheiro', 1560, '2026-08-03', null, null],
    ],
  ],
] as const) {
  for (const linha of linhas) {
    movimento(
      'EVENTOS',
      tesourariaId,
      linha as Parameters<typeof movimento>[2]
    );
  }
}

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
    movimento('CONGREGACOES', mes < OUTUBRO ? t.id : null, [
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
movimento('CONGREGACOES', null, [
  'EXPENSE',
  'Tarifa de manutenção da conta',
  29.9,
  dia(OUTUBRO, 5),
  null,
  null,
]);
// material de limpeza das três congregações num boleto só: rateio
movimento('CONGREGACOES', null, [
  'EXPENSE',
  'Boleto — Material de limpeza (três congregações)',
  360,
  dia(OUTUBRO, 7),
  null,
  null,
]);

const maisRecentes = (a: string, b: string) => b.localeCompare(a);

const alocadoDe = (movimentoId: string) =>
  centavos(
    ALOCACOES.filter((a) => a.movimentoId === movimentoId).reduce(
      (soma, a) => soma + a.valor,
      0
    )
  );

/**
 * O que está na conta e ainda não foi (todo) para nenhuma tesouraria: os
 * movimentos não alocados, e o resto dos que foram só em parte.
 */
export const aDistribuir = (conta: ContaDaTesouraria): LinhaLivre[] =>
  EXTRATO.filter((m) => m.conta === conta)
    .map((m) => ({
      movimento: m,
      restante: centavos(m.valor - alocadoDe(m.id)),
    }))
    .filter((l) => l.restante > 0)
    .sort((a, b) => maisRecentes(a.movimento.data, b.movimento.data));

/** As alocações desta tesouraria, com o movimento de cada uma */
export const alocacoesDa = (tesourariaId: string): LinhaDaqui[] =>
  ALOCACOES.filter((a) => a.tesourariaId === tesourariaId)
    .map((alocacao) => ({
      alocacao,
      movimento: EXTRATO.find((m) => m.id === alocacao.movimentoId)!,
    }))
    .sort((a, b) => maisRecentes(a.movimento.data, b.movimento.data));

/**
 * Traz para a tesouraria o que falta alocar de cada movimento (o movimento
 * inteiro, se nada dele foi alocado). Entra sem categoria.
 */
export function distribuir(movimentoIds: string[], tesourariaId: string) {
  for (const id of movimentoIds) {
    const restante = centavos(
      (EXTRATO.find((m) => m.id === id)?.valor ?? 0) - alocadoDe(id)
    );
    if (restante > 0) distribuirParte(id, tesourariaId, restante);
  }
}

/**
 * Rateio: traz só uma parte do movimento; o resto continua a distribuir, para
 * outra tesouraria. Uma tesouraria tem no máximo uma alocação por movimento —
 * trazer de novo soma na que já existe.
 */
export function distribuirParte(
  movimentoId: string,
  tesourariaId: string,
  valor: number
) {
  const m = EXTRATO.find((x) => x.id === movimentoId);
  if (!m) return;
  const parte = centavos(Math.min(valor, m.valor - alocadoDe(movimentoId)));
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
    categoria: null,
    pagamentoId: null,
  });
}

/** Devolve a alocação: o valor dela volta a distribuir */
export function devolver(alocacaoId: string) {
  const i = ALOCACOES.findIndex((a) => a.id === alocacaoId);
  if (i >= 0) ALOCACOES.splice(i, 1);
}

export function classificar(alocacaoId: string, categoria: string) {
  const a = ALOCACOES.find((x) => x.id === alocacaoId);
  if (!a) return;
  a.categoria = categoria;
  a.pagamentoId = null;
}

// ---- os pagamentos das inscrições (só evento) -----------------------------------

type Ingresso = [string, string, number, string];

const INGRESSOS: Record<string, Ingresso[]> = {
  'retiro-carnaval-2027': [
    ['Ingressos', 'Ingressos — 1º lote (41 inscrições)', 7790, '2026-09-30'],
    [
      'Ingressos',
      'Ingressos — 2º lote, parcial (17 inscrições)',
      3740,
      '2026-10-10',
    ],
    ['Loja do evento', 'Camisas — pré-venda (23 un.)', 1035, '2026-10-05'],
  ],
  'encontro-casais-2026': [
    ['Ingressos', 'Ingressos — 1º lote (18 casais)', 5400, '2026-07-20'],
    ['Ingressos', 'Ingressos — 2º lote (13 casais)', 4550, '2026-08-25'],
    ['Loja do evento', 'Camisas do encontro (42 un.)', 1890, '2026-09-20'],
  ],
  'cursilho-48': [
    ['Ingressos', 'Ingressos — 1º lote (30 inscrições)', 6600, '2026-06-15'],
    ['Ingressos', 'Ingressos — 2º lote (22 inscrições)', 5720, '2026-07-15'],
  ],
};

/**
 * Os pagamentos das inscrições registrados no sistema para o evento. O
 * dinheiro deles cai na conta (o repasse do PagBank); conferir o repasse com
 * o pagamento é o que impede contar o mesmo dinheiro duas vezes.
 */
export const pagamentosDa = (tesourariaId: string): LancamentoDaTesouraria[] =>
  (INGRESSOS[tesourariaId] ?? []).map(
    ([categoria, descricao, valor, data], i) => {
      const id = `${tesourariaId}-ingresso-${i}`;
      return {
        id,
        tesourariaId,
        tipo: 'INCOME',
        categoria,
        descricao,
        valor,
        data,
        origem: 'INSCRICOES',
        conferido: ALOCACOES.some((a) => a.pagamentoId === id),
      };
    }
  );

/** Confere a alocação com um pagamento das inscrições (ou desfaz, com null) */
export function conferirComPagamento(
  alocacaoId: string,
  pagamentoId: string | null
) {
  const a = ALOCACOES.find((x) => x.id === alocacaoId);
  if (!a) return;
  a.pagamentoId = pagamentoId;
  a.categoria = pagamentoId
    ? (pagamentosDa(a.tesourariaId).find((p) => p.id === pagamentoId)
        ?.categoria ?? null)
    : null;
}

// ---- lançamentos ----------------------------------------------------------------

/**
 * Os lançamentos de uma tesouraria: os pagamentos das inscrições (só evento)
 * e o que foi alocado nela. A alocação conferida com um pagamento não entra:
 * o pagamento já conta aquele dinheiro.
 */
export function lancamentosDa(tesourariaId: string): LancamentoDaTesouraria[] {
  const daConta = alocacoesDa(tesourariaId)
    .filter(({ alocacao }) => !alocacao.pagamentoId)
    .map(({ alocacao, movimento: m }): LancamentoDaTesouraria => ({
      id: alocacao.id,
      tesourariaId,
      tipo: m.tipo,
      categoria: alocacao.categoria ?? SEM_CATEGORIA,
      descricao: m.pagador ? `${m.descricao} — ${m.pagador}` : m.descricao,
      valor: alocacao.valor,
      data: m.data,
      origem: 'BANCO',
    }));
  return [...pagamentosDa(tesourariaId), ...daConta];
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
