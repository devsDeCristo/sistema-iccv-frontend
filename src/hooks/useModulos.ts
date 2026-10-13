import { useMemo } from 'react';
import { ModuloDaIgreja } from '../constants/modulos';
import { useRole } from './useRole';
import { useGetChurches } from '../features/admin/churches/api/getChurches';

/**
 * Os módulos das igrejas que a pessoa alcança, pelo plano de cada uma.
 *
 * O plano recorta quem trabalha na igreja (admin, tesouraria): os módulos vêm
 * dos vínculos da sessão (`/auth/validate` devolve os de cada igreja, e a
 * sessão se renova a cada navegação no painel). Dev e super admin veem todos
 * os módulos de todas as igrejas.
 *
 * É só usabilidade: quem recusa de verdade é o `ModuloGuard` da API.
 *
 * `planoDaIgreja` é outra pergunta: não "a pessoa alcança?", e sim "a igreja
 * tem?". Vale para o super admin também (o plano dele vem da lista de
 * igrejas), porque a tela de uma igreja mostra a igreja como ela é.
 */
export function useModulos() {
  const { isSuperAdmin, churchRoles, eventTreasurers, eventAdmins } = useRole();
  const { data: todasAsIgrejas } = useGetChurches({ enabled: isSuperAdmin });

  // o tesoureiro(a) e o admin de evento alcançam a igreja do evento sem
  // vínculo nela
  const porIgreja = useMemo(
    () =>
      new Map<string, ModuloDaIgreja[]>([
        ...[...eventTreasurers, ...eventAdmins].map(
          (t) => [t.churchId, t.modulos ?? []] as [string, ModuloDaIgreja[]]
        ),
        ...churchRoles.map(
          (v) =>
            [v.church.id, v.church.modulos ?? []] as [string, ModuloDaIgreja[]]
        ),
      ]),
    [churchRoles, eventTreasurers, eventAdmins]
  );

  return {
    /** Alguma igreja da pessoa tem o módulo no plano? */
    temModulo: (modulo: ModuloDaIgreja) =>
      isSuperAdmin ||
      [...porIgreja.values()].some((modulos) => modulos.includes(modulo)),
    /**
     * Os módulos do plano desta igreja, de verdade — também para o super
     * admin. `undefined` é igreja que a pessoa não alcança (ou a lista do
     * super admin ainda não chegou): não dá para dizer.
     */
    planoDaIgreja: (
      churchId: string | null | undefined
    ): ModuloDaIgreja[] | undefined => {
      if (!churchId) return undefined;
      if (isSuperAdmin) {
        const igreja = todasAsIgrejas?.find((i) => i.id === churchId);
        return igreja ? (igreja.plan?.modules ?? []) : undefined;
      }
      return porIgreja.get(churchId);
    },
    /** Esta igreja tem o módulo no plano? */
    igrejaTem: (churchId: string | null | undefined, modulo: ModuloDaIgreja) =>
      isSuperAdmin ||
      (!!churchId && !!porIgreja.get(churchId)?.includes(modulo)),
  };
}
