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
 * ao voltar outro dia. `'all'` é "Todas as igrejas", o padrão.
 */
export function useIgrejaEscolhida() {
  return useFiltroSalvo('igreja', TODAS_AS_IGREJAS, ehTexto);
}
