import { Role } from '../constants/roles';
import { useRole } from './useRole';

type EventRoleInfo = {
  /** Perfil de quem está logado na igreja deste evento */
  perfil: number | null;
  /** Administra a igreja deste evento */
  isAdminDoEvento: boolean;
  /** É tesouraria na igreja deste evento */
  isTesourariaDoEvento: boolean;
  /**
   * Tesoureiro(a) deste evento sem perfil na igreja dele: vê só a aba
   * Tesouraria
   */
  isTesoureiroDoEvento: boolean;
  /** Já dá para decidir — `false` enquanto a igreja do evento não chegou */
  resolvido: boolean;
};

const NAO_RESOLVIDO: EventRoleInfo = {
  perfil: null,
  isAdminDoEvento: false,
  isTesourariaDoEvento: false,
  isTesoureiroDoEvento: false,
  resolvido: false,
};

/**
 * O perfil de quem está logado *neste* evento.
 *
 * `useRole().role` é o perfil efetivo — o mais alto entre os vínculos — e
 * responde só a uma pergunta: "esta pessoa alcança o painel?". Quem é admin
 * numa igreja e tesouraria em outra tem perfil efetivo de admin, e montar a
 * tela do evento com isso oferece abas e botões que a API recusa: a pessoa
 * clica e leva 403. A pergunta certa aqui é outra — o que ela é na igreja
 * *deste* evento.
 */
function useEventRole(
  churchId?: string | null,
  eventId?: string | null
): EventRoleInfo {
  const { isSuperAdmin, perfilNaIgreja, tesoureiroDoEvento } = useRole();

  // o super admin atravessa as igrejas: não tem vínculo e não precisa de um
  if (isSuperAdmin) {
    return {
      perfil: Role.SUPER_ADMIN,
      isAdminDoEvento: true,
      isTesourariaDoEvento: false,
      isTesoureiroDoEvento: false,
      resolvido: true,
    };
  }

  // sem a igreja do evento não há o que decidir. Enquanto ela não chega a tela
  // fica no perfil mais restrito, nunca no mais permissivo
  if (!churchId) return NAO_RESOLVIDO;

  const perfil = perfilNaIgreja(churchId);

  return {
    perfil,
    isAdminDoEvento: perfil === Role.ADMIN,
    isTesourariaDoEvento: perfil === Role.TESOURARIA,
    // quem tem perfil na igreja já vê mais que o tesoureiro
    isTesoureiroDoEvento:
      perfil === null && !!eventId && !!tesoureiroDoEvento(eventId),
    resolvido: true,
  };
}

export { useEventRole };
