import { useGetWhatsappStatus } from './api/getWhatsappStatus';

/**
 * Situação do canal para quem está fora da tela de configurações.
 *
 * O intervalo aqui é de 30s: só a tela de pareamento precisa da consulta curta,
 * que existe para acompanhar o QR se renovando. Fora dela basta perceber uma
 * queda.
 *
 * `indefinido` separa "não conectado" de "ainda não sei" — a primeira resposta
 * pode não ter chegado, ou a consulta pode ter falhado. Bloquear um botão por
 * engano é pior do que deixar a ação seguir e falhar com um motivo claro.
 */
export function useWhatsappConectado() {
  const { data } = useGetWhatsappStatus({ refetchInterval: 30000 });

  return {
    status: data?.status,
    conectado: data?.status === 'CONNECTED',
    indefinido: !data,
    /** só quando a API confirmou que não há número pronto para disparar */
    semNumero: !!data && data.status !== 'CONNECTED',
  };
}
