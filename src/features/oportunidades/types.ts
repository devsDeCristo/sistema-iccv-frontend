/** Os campos que já vêm prontos (rótulo fixo) e as perguntas do admin */
export type TipoDeCampo =
  | 'CURRICULO'
  | 'PRETENSAO_SALARIAL'
  | 'MENSAGEM'
  | 'REDE_SOCIAL'
  | 'TEXTO'
  | 'SELECAO'
  | 'CAIXAS'
  | 'OPCAO_UNICA';

export type Rede =
  'linkedin' | 'instagram' | 'facebook' | 'github' | 'tiktok' | 'x' | 'site';

export interface Campo {
  id: string;
  tipo: TipoDeCampo;
  rotulo: string;
  obrigatorio: boolean;
  rede?: Rede;
  opcoes?: string[];
}

export interface Formulario {
  campos: Campo[];
}

/** Valor (`min`) ou faixa (`min` e `max`) */
export interface Salario {
  min: number;
  max?: number;
}

/** Cada resposta leva tipo e rótulo de quando foi enviada */
export interface Resposta {
  tipo: TipoDeCampo;
  rotulo: string;
  /** currículo: `{ nome }`; pretensão: `Salario`; caixas: lista; o resto, texto */
  valor: unknown;
}
export type Respostas = Record<string, Resposta>;

export interface Oportunidade {
  id: string;
  title: string;
  /** quem oferece: a própria igreja ou a empresa de um membro */
  company: string;
  /** HTML do editor; as vagas antigas são texto puro */
  description: string;
  location: string | null;
  /** `false`: encerrada à mão */
  isOpen: boolean;
  /** último dia para se candidatar */
  closesAt: string | null;
  /** encerrada à mão ou vencida */
  encerrada: boolean;
  imagemUrl: string | null;
  /** cor dominante da logo (`#rrggbb`); tinge o crachá */
  cor: string | null;
  salario: Salario | null;
  createdAt: string;
  updatedAt: string;
}

/** Na tela do membro: se ele já se candidatou */
export interface OportunidadeDoMembro extends Oportunidade {
  interessei: boolean;
}

/** A página de candidatura: com o formulário e o que a pessoa já mandou */
export interface DetalheDaOportunidade extends OportunidadeDoMembro {
  formulario: Formulario;
  minhaCandidatura: { createdAt: string; respostas: Respostas } | null;
}

/** A etapa de uma candidatura no processo; o candidato não vê */
export type EtapaDaCandidatura =
  'NEW' | 'REVIEWING' | 'INTERVIEW' | 'SELECTED' | 'DISCARDED';

export interface Interessado {
  createdAt: string;
  respostas: Respostas;
  /** o acompanhamento, de quem conduz a vaga (admin e quem propôs) */
  stage: EtapaDaCandidatura;
  note: string | null;
  trackedAt: string | null;
  user: {
    id: string;
    fullName: string;
    email: string;
    cellphone: string | null;
    profilePhotoUrl: string | null;
  };
}

/** No painel: quem publicou, o formulário e as candidaturas */
/**
 * Situação na igreja: a vaga do admin nasce aprovada; a proposta de um membro
 * nasce pendente e só vai ao ar aprovada
 */
export type SituacaoDaVaga = 'PENDING' | 'APPROVED' | 'REJECTED';

type Pessoa = { id: string; fullName: string } | null;

/** No painel (e para quem propôs): a situação, quem publicou e as candidaturas */
export interface OportunidadeDaIgreja extends Oportunidade {
  formulario: Formulario;
  status: SituacaoDaVaga;
  /** o motivo da recusa, que vai para quem propôs */
  rejectionReason: string | null;
  reviewedAt: string | null;
  createdBy: Pessoa;
  /** o membro que propôs (nulo na vaga criada pelo admin) */
  proposedBy: Pessoa;
  reviewedBy: Pessoa;
  interests: Interessado[];
}

/** O que a tela de edição manda; na edição parcial, qualquer parte */
export interface DadosDaOportunidade {
  titulo: string;
  empresa: string;
  descricao: string;
  local: string;
  aberta?: boolean;
  /** `AAAA-MM-DD`; `null` tira o prazo */
  encerraEm: string | null;
  salario: { min?: number | string; max?: number | string } | null;
  formulario: Formulario;
}
