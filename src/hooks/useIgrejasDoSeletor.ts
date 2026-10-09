import { useGetChurches } from '../features/admin/churches/api/getChurches';
import { useRole } from './useRole';

/**
 * Igrejas que o seletor de igreja oferece — multitenant: a tela de uma
 * feature que é por igreja mostra uma igreja por vez, escolhida aqui.
 *
 * Super admin e dev escolhem entre todas; quem administra, entre as dele. Com
 * uma só, não há o que escolher e o seletor fica escondido (`mostraSeletor`).
 * Mesma regra do filtro de admin/usuários.
 */
export function useIgrejasDoSeletor() {
  const { isSuperAdmin, igrejasQueAdministra } = useRole();
  const { data: todas = [] } = useGetChurches({ enabled: isSuperAdmin });

  const igrejas = isSuperAdmin
    ? todas.map((igreja) => ({ id: igreja.id, name: igreja.name }))
    : igrejasQueAdministra;

  return { igrejas, mostraSeletor: igrejas.length > 1 };
}
