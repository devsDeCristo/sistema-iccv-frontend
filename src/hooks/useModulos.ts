import { useMemo } from 'react';
import { ModuloDaIgreja } from '../constants/modulos';
import { useRole } from './useRole';

/**
 * Os módulos das igrejas que a pessoa alcança, pelo plano de cada uma.
 *
 * O plano recorta quem trabalha na igreja (admin, tesouraria): os módulos vêm
 * dos vínculos da sessão (`/auth/validate` devolve os de cada igreja, e a
 * sessão se renova a cada navegação no painel). Dev e super admin veem todos
 * os módulos de todas as igrejas.
 *
 * É só usabilidade: quem recusa de verdade é o `ModuloGuard` da API.
 */
export function useModulos() {
  const { isSuperAdmin, churchRoles } = useRole();

  const porIgreja = useMemo(
    () =>
      new Map<string, ModuloDaIgreja[]>(
        churchRoles.map((v) => [v.church.id, v.church.modulos ?? []])
      ),
    [churchRoles]
  );

  return {
    /** Alguma igreja da pessoa tem o módulo no plano? */
    temModulo: (modulo: ModuloDaIgreja) =>
      isSuperAdmin ||
      [...porIgreja.values()].some((modulos) => modulos.includes(modulo)),
    /** Esta igreja tem o módulo no plano? */
    igrejaTem: (churchId: string | null | undefined, modulo: ModuloDaIgreja) =>
      isSuperAdmin ||
      (!!churchId && !!porIgreja.get(churchId)?.includes(modulo)),
  };
}
