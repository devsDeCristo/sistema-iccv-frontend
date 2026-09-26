import { useEffect, useState } from 'react';
import { GroupRole } from './types';

/**
 * Quando cada grupo recebe inscrição, com a mesma regra do servidor
 * (`src/event/event-groups.ts`). Aqui é só para a tela: quem decide é o
 * servidor, e mexer no relógio do celular não abre grupo nenhum.
 */
export type EstadoDoGrupo = 'aberto' | 'agendado' | 'encerrado' | 'inativo';

type Janela = Pick<GroupRole, 'active' | 'opensAt' | 'closesAt'>;

export function estadoDoGrupo(
  grupo: Janela,
  agora = Date.now()
): EstadoDoGrupo {
  // ausente é grupo anterior à opção: ativo e sem datas
  if (grupo.active === false) return 'inativo';
  if (grupo.opensAt && agora < new Date(grupo.opensAt).getTime()) {
    return 'agendado';
  }
  if (grupo.closesAt && agora >= new Date(grupo.closesAt).getTime()) {
    return 'encerrado';
  }
  return 'aberto';
}

/** "12/10 às 08:00", no fuso de quem está vendo */
export const quandoDoGrupo = (iso: string) =>
  new Date(iso)
    .toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
    .replace(', ', ' às ');

/**
 * O relógio da tela, que anda sozinho na hora em que algum grupo abre ou
 * encerra: quem está com a página aberta às 07:59 vê o grupo liberar às 08:00
 * sem recarregar.
 */
export function useAgoraDosGrupos(grupos: Janela[] = []) {
  const [agora, setAgora] = useState(() => Date.now());

  const proxima = grupos
    .flatMap((grupo) => [grupo.opensAt, grupo.closesAt])
    .map((data) => (data ? new Date(data).getTime() : NaN))
    .filter((instante) => instante > agora)
    .sort((a, b) => a - b)[0];

  useEffect(() => {
    if (proxima === undefined) return;
    // setTimeout não passa de ~24 dias; mais longe que isso, a página já
    // terá sido recarregada muitas vezes
    const espera = Math.min(proxima - Date.now() + 500, 2 ** 31 - 1);
    const id = setTimeout(() => setAgora(Date.now()), Math.max(espera, 0));
    return () => clearTimeout(id);
  }, [proxima]);

  return agora;
}

/**
 * O valor do campo `datetime-local` ("2026-10-12T08:00", hora local) a partir
 * do ISO gravado, e o caminho de volta. Vazio vira `null`: a data sai.
 */
export const isoParaCampo = (iso?: string | null) => {
  if (!iso) return '';
  const data = new Date(iso);
  const local = new Date(data.getTime() - data.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 16);
};

export const campoParaIso = (valor: string) =>
  valor ? new Date(valor).toISOString() : null;
