import { useRole } from '../../../hooks/useRole';
import { useGetWhatsappStatus } from './api/getWhatsappStatus';

/**
 * Situação do canal para quem está fora da tela de configurações.
 *
 * O intervalo aqui é de 30s: só a tela de pareamento precisa da consulta curta,
 * que existe para acompanhar o QR se renovando. Fora dela basta perceber uma
 * queda.
 *
 * `indefinido` separa "não conectado" de "ainda não sei" — a primeira resposta
 * pode não ter chegado, a consulta pode ter falhado, ou pode não haver uma
 * igreja para perguntar. Bloquear um botão por engano é pior do que deixar a
 * ação seguir e falhar com um motivo claro.
 *
 * @param churchId de qual igreja. Omitido, o gancho só responde quando não há
 * ambiguidade: quem administra exatamente uma igreja. Antes o número era um só
 * para o sistema e a pergunta não precisava de dono; agora, para quem alcança
 * várias, "o WhatsApp está conectado?" não tem resposta única — e afirmar que
 * não está esconderia as igrejas que estão.
 */
export function useWhatsappConectado(churchId?: string | null) {
  const { isSuperAdmin, igrejasQueAdministra } = useRole();

  const unica =
    !isSuperAdmin && igrejasQueAdministra.length === 1
      ? igrejasQueAdministra[0].id
      : null;

  const alvo = churchId ?? unica;

  const { data } = useGetWhatsappStatus(alvo, { refetchInterval: 30000 });

  return {
    status: data?.status,
    conectado: data?.status === 'CONNECTED',
    indefinido: !alvo || !data,
    /** só quando a API confirmou que aquela igreja não tem número pronto */
    semNumero: !!alvo && !!data && data.status !== 'CONNECTED',
  };
}
