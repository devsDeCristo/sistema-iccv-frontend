import {
  Campo,
  EtapaDaCandidatura,
  Rede,
  Respostas,
  Salario,
  TipoDeCampo,
} from './types';

/**
 * O espelho, na tela, das regras de `ic-backend/src/oportunidades/formulario.ts`
 * — quem decide é a API; aqui é só para montar e mostrar.
 */

export const REDES: Record<Rede, { rotulo: string; placeholder: string }> = {
  linkedin: { rotulo: 'LinkedIn', placeholder: 'linkedin.com/in/seu-perfil' },
  instagram: { rotulo: 'Instagram', placeholder: 'instagram.com/seu-perfil' },
  facebook: { rotulo: 'Facebook', placeholder: 'facebook.com/seu-perfil' },
  github: { rotulo: 'GitHub', placeholder: 'github.com/seu-usuario' },
  tiktok: { rotulo: 'TikTok', placeholder: 'tiktok.com/@seu-perfil' },
  x: { rotulo: 'X (Twitter)', placeholder: 'x.com/seu-perfil' },
  site: { rotulo: 'Site ou portfólio', placeholder: 'seusite.com.br' },
};

export const NOME_DO_TIPO: Record<TipoDeCampo, string> = {
  CURRICULO: 'Currículo (PDF)',
  PRETENSAO_SALARIAL: 'Valor ou faixa',
  MENSAGEM: 'Texto curto',
  REDE_SOCIAL: 'Link',
  TEXTO: 'Resposta livre',
  SELECAO: 'Seleção (lista)',
  CAIXAS: 'Caixas de marcação',
  OPCAO_UNICA: 'Opção única',
};

export const TIPOS_PROPRIOS: TipoDeCampo[] = [
  'TEXTO',
  'SELECAO',
  'CAIXAS',
  'OPCAO_UNICA',
];
export const DE_ESCOLHA: TipoDeCampo[] = ['SELECAO', 'CAIXAS', 'OPCAO_UNICA'];

const ROTULO: Partial<Record<TipoDeCampo, string>> = {
  CURRICULO: 'Currículo',
  PRETENSAO_SALARIAL: 'Pretensão salarial',
  MENSAGEM: 'Mensagem',
};

/** Um campo padrão novo (o mesmo id que a API dá a ele) */
export const campoPadrao = (tipo: TipoDeCampo, rede?: Rede): Campo => ({
  id: tipo === 'REDE_SOCIAL' ? `rede-${rede}` : tipo.toLowerCase(),
  tipo,
  rotulo: rede ? REDES[rede].rotulo : (ROTULO[tipo] ?? ''),
  obrigatorio: false,
  ...(rede && { rede }),
});

/** Os padrão que ainda não estão no formulário, para voltar */
export const padraoQueFaltam = (campos: Campo[]) =>
  [
    campoPadrao('CURRICULO'),
    campoPadrao('PRETENSAO_SALARIAL'),
    campoPadrao('MENSAGEM'),
    ...(Object.keys(REDES) as Rede[]).map((r) => campoPadrao('REDE_SOCIAL', r)),
  ].filter((p) => !campos.some((c) => c.id === p.id));

export const LIMITES = {
  campos: 20,
  rotulo: 200,
  opcoes: 20,
  mensagem: 1000,
  texto: 2000,
};
export const CURRICULO_MAXIMO_BYTES = 5 * 1024 * 1024;

const real = (v: number) =>
  v.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: Number.isInteger(v) ? 0 : 2,
  });

/** "R$ 2.000" ou "R$ 2.000 a R$ 2.500" */
export const formatarSalario = (s?: Salario | null) =>
  !s ? '' : s.max ? `${real(s.min)} a ${real(s.max)}` : real(s.min);

/** "31/12/2026" a partir do fim do dia guardado */
export const formatarData = (iso: string) =>
  new Date(iso).toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' });

/** O dia (`AAAA-MM-DD`) de `closesAt`, para o campo de data */
export const diaDe = (iso: string | null) =>
  iso
    ? new Date(iso).toLocaleDateString('en-CA', {
        timeZone: 'America/Sao_Paulo',
      })
    : '';

/** "Encerra hoje", "Faltam 3 dias", "Encerra em 31/12" */
export function prazo(closesAt: string | null) {
  if (!closesAt) return null;
  const hoje = diaDe(new Date().toISOString());
  const fim = diaDe(closesAt);
  const dias = Math.round(
    (new Date(fim).getTime() - new Date(hoje).getTime()) / 86_400_000
  );
  if (dias < 0) return 'Inscrições encerradas';
  if (dias === 0) return 'Encerra hoje';
  if (dias === 1) return 'Encerra amanhã';
  if (dias <= 7) return `Faltam ${dias} dias`;
  return `Encerra em ${formatarData(closesAt).slice(0, 5)}`;
}

/** A resposta como texto (lista do painel e PDF) */
export function respostaEmTexto({ tipo, valor }: Respostas[string]) {
  if (tipo === 'CURRICULO')
    return (valor as { nome?: string })?.nome ?? 'Enviado';
  if (tipo === 'PRETENSAO_SALARIAL') return formatarSalario(valor as Salario);
  if (Array.isArray(valor)) return valor.join(', ');
  return String(valor ?? '');
}

/** Vaga antiga é texto puro: vira parágrafos para o visualizador do Quill */
export const descricaoEmHtml = (descricao: string) =>
  /^\s*</.test(descricao)
    ? descricao
    : descricao
        .split('\n')
        .map(
          (linha) =>
            `<p>${
              linha
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;') || '<br>'
            }</p>`
        )
        .join('');

/** Para o card: a descrição sem as marcas do HTML */
export const descricaoEmTexto = (descricao: string) =>
  new DOMParser().parseFromString(descricaoEmHtml(descricao), 'text/html').body
    .textContent ?? '';

/** O que falta para o formulário poder ser salvo (vazio: pronto) */
export function problemasDoFormulario(campos: Campo[]) {
  return campos.flatMap((c, i) => {
    if (!TIPOS_PROPRIOS.includes(c.tipo)) return [];
    if (!c.rotulo.trim()) return [`escreva a pergunta ${i + 1}`];
    const opcoes = (c.opcoes ?? []).filter((o) => o.trim());
    return DE_ESCOLHA.includes(c.tipo) && opcoes.length < 2
      ? [`dê ao menos 2 opções em "${c.rotulo}"`]
      : [];
  });
}

/** Preenchido do jeito que cada tipo entende "vazio" */
export const preenchido = (
  campo: Campo,
  valor: unknown,
  curriculo: File | null
) => {
  if (campo.tipo === 'CURRICULO') return !!curriculo;
  if (campo.tipo === 'PRETENSAO_SALARIAL')
    return (
      (valor as { min?: unknown })?.min !== undefined &&
      (valor as { min?: unknown })?.min !== ''
    );
  if (campo.tipo === 'CAIXAS') return Array.isArray(valor) && valor.length > 0;
  return typeof valor === 'string' && valor.trim() !== '';
};

/** As etapas do processo, na ordem, com o nome e o tom de cada uma */
export const ETAPAS: {
  valor: EtapaDaCandidatura;
  rotulo: string;
  tom: 'info' | 'warning' | 'secondary' | 'success' | 'error';
}[] = [
  { valor: 'NEW', rotulo: 'Nova', tom: 'info' },
  { valor: 'REVIEWING', rotulo: 'Em análise', tom: 'warning' },
  { valor: 'INTERVIEW', rotulo: 'Entrevista', tom: 'secondary' },
  { valor: 'SELECTED', rotulo: 'Selecionada', tom: 'success' },
  { valor: 'DISCARDED', rotulo: 'Descartada', tom: 'error' },
];
export const etapaDe = (valor: EtapaDaCandidatura) =>
  ETAPAS.find((e) => e.valor === valor) ?? ETAPAS[0];

/** O link do WhatsApp para um celular brasileiro (com ou sem o 55) */
export function linkDoWhatsApp(celular?: string | null) {
  const d = (celular ?? '').replace(/\D/g, '');
  if (d.length < 10) return null;
  return `https://wa.me/${d.length <= 11 ? `55${d}` : d}`;
}
