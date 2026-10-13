import { TODAS_AS_IGREJAS } from '../features/settings/shared/churchScopeBar';
import { useFiltroSalvo } from './useFiltroSalvo';

const ehTexto = (valor: unknown): valor is string => typeof valor === 'string';

/**
 * A igreja escolhida no seletor, **uma só para o painel inteiro** —
 * multitenant.
 *
 * Fica no `localStorage` (via `useFiltroSalvo`, separada por usuário): quem
 * escolhe "ICCV Filial" em Notícias encontra Usuários, Eventos, Início e
 * Configurações já na Filial, sem reescolher a cada módulo, e continua nela
 * ao voltar outro dia. As telas dos módulos exigem uma igreja; `'all'` é só a
 * visão DEV da home (dev e super admin).
 */
export function useIgrejaEscolhida() {
  return useFiltroSalvo('igreja', TODAS_AS_IGREJAS, ehTexto);
}
