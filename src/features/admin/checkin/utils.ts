import { CheckinParticipant, CheckinStats } from './types';

/**
 * Um evento reúne grupos diferentes — quem vem participar e as equipes que vêm
 * trabalhar — e cada posto costuma atender um grupo por vez. Este filtro é só
 * do operador: recorta o que a tela mostra, sem mexer em etapa nenhuma do
 * check-in.
 *
 * O valor precisa ser diferente de string vazia: o select do sistema usa
 * `displayEmpty`, e com valor vazio o MUI não encolhe o rótulo, que fica por
 * cima do texto da opção escolhida.
 */
export const TODOS_OS_GRUPOS = '__todos__';

/** Os grupos que aparecem nas inscrições do evento, em ordem alfabética. */
export function gruposDosInscritos(inscritos: CheckinParticipant[]) {
  const grupos = new Set(inscritos.flatMap((inscrito) => inscrito.groups));

  return Array.from(grupos).sort((a, b) => a.localeCompare(b, 'pt-BR'));
}

export function filtrarPorGrupo(
  inscritos: CheckinParticipant[],
  grupo: string
) {
  if (!grupo || grupo === TODOS_OS_GRUPOS) return inscritos;

  return inscritos.filter((inscrito) => inscrito.groups.includes(grupo));
}

/**
 * Mesma ideia do filtro de grupo, agora pela etapa do check-in: serve para a
 * recepção olhar só quem ainda não chegou, ou conferir quem já saiu com o
 * crachá, sem perder a lista do evento de vista.
 *
 * O valor segue a mesma regra do `TODOS_OS_GRUPOS`: não pode ser string vazia,
 * senão o rótulo do select fica por cima da opção escolhida.
 */
export const TODAS_AS_SITUACOES = '__todas__';

export function filtrarPorSituacao(
  inscritos: CheckinParticipant[],
  situacao: string
) {
  if (!situacao || situacao === TODAS_AS_SITUACOES) return inscritos;

  return inscritos.filter((inscrito) => inscrito.status === situacao);
}

/** Os mesmos contadores do endpoint de stats, só que do recorte em tela. */
export function contarCheckin(inscritos: CheckinParticipant[]): CheckinStats {
  const contar = (status: CheckinParticipant['status']) =>
    inscritos.filter((inscrito) => inscrito.status === status).length;

  return {
    total: inscritos.length,
    pending: contar('PENDING'),
    queued: contar('QUEUED'),
    inProgress: contar('IN_PROGRESS'),
    done: contar('DONE'),
  };
}
